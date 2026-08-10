const fs = require("fs");
const zlib = require("zlib");
const pdfParse = require("pdf-parse");
const { createWorker } = require("tesseract.js");

/**
 * Stage 1: Standard PDF Parse using pdf-parse (v1.1.1)
 */
async function parseWithPdfParse(dataBuffer) {
  try {
    const data = await pdfParse(dataBuffer);
    if (data && data.text && data.text.trim().length > 15) {
      return data.text.trim();
    }
  } catch (err) {
    console.warn("[PDFParser] pdf-parse warning:", err.message);
  }
  return "";
}

/**
 * Stage 2: Raw Stream & FlateDecode Extraction
 * Uncompresses Flate streams and extracts text enclosed in (string) or [ (string) ] TJ
 */
function parseRawPdfStreams(dataBuffer) {
  try {
    const textPieces = [];
    const str = dataBuffer.toString("binary");

    // Extract text from uncompressed streams directly
    const parenMatches = str.match(/\(([^()]{2,})\)/g);
    if (parenMatches) {
      for (const match of parenMatches) {
        const cleaned = match.slice(1, -1).trim();
        // Ignore font names, metadata tags, and binary garbage
        if (
          cleaned.length > 1 &&
          !/^[\x00-\x1F]+$/.test(cleaned) &&
          !/^(Font|Helv|Times|Courier|Device|RGB|CMYK|PDF|Obj)/i.test(cleaned)
        ) {
          textPieces.push(cleaned);
        }
      }
    }

    // Try finding /FlateDecode streams and unzipping them
    const streamRegex = /stream[\r\n]+([\s\S]*?)endstream/g;
    let streamMatch;
    while ((streamMatch = streamRegex.exec(str)) !== null) {
      try {
        const streamData = Buffer.from(streamMatch[1], "binary");
        const decompressed = zlib.inflateSync(streamData);
        const decompressedStr = decompressed.toString("utf-8");

        const matches = decompressedStr.match(/\(([^()]{2,})\)/g);
        if (matches) {
          for (const m of matches) {
            const cleaned = m.slice(1, -1).trim();
            if (cleaned.length > 1 && !/^[\x00-\x1F]+$/.test(cleaned)) {
              textPieces.push(cleaned);
            }
          }
        }
      } catch (e) {
        // Not all streams are zlib compressed, ignore decompression errors
      }
    }

    const result = textPieces.join(" ").replace(/\s+/g, " ").trim();
    if (result.length > 20) {
      return result;
    }
  } catch (err) {
    console.warn("[PDFParser] Raw stream parse warning:", err.message);
  }
  return "";
}

/**
 * Stage 3: Embedded Image OCR (using Tesseract.js)
 * Useful for scanned PDFs, Admit Cards, Certificates, forms, image-only PDFs
 */
async function parseWithOcr(dataBuffer) {
  let worker = null;
  try {
    console.log("[PDFParser] Attempting OCR for scanned/image PDF...");
    
    // Extract embedded JPEG images (\xFF\xD8\xFF ... \xFF\xD9)
    const images = [];
    let pos = 0;
    while ((pos = dataBuffer.indexOf(Buffer.from([0xff, 0xd8, 0xff]), pos)) !== -1) {
      const endPos = dataBuffer.indexOf(Buffer.from([0xff, 0xd9]), pos);
      if (endPos !== -1) {
        const imgBuffer = dataBuffer.slice(pos, endPos + 2);
        if (imgBuffer.length > 3000) { // filter tiny icons/thumbnails
          images.push(imgBuffer);
        }
        pos = endPos + 2;
      } else {
        break;
      }
    }

    if (images.length === 0) {
      console.log("[PDFParser] No embedded JPEGs found for OCR.");
      return "";
    }

    console.log(`[PDFParser] Found ${images.length} embedded image(s) in PDF. Running OCR...`);

    worker = await createWorker("eng");
    let ocrText = "";

    for (let i = 0; i < Math.min(images.length, 5); i++) {
      const ret = await worker.recognize(images[i]);
      if (ret && ret.data && ret.data.text) {
        ocrText += `\n--- Page/Image ${i + 1} ---\n` + ret.data.text;
      }
    }

    await worker.terminate();
    worker = null;

    return ocrText.trim();
  } catch (err) {
    console.warn("[PDFParser] OCR warning:", err.message);
    if (worker) {
      try { await worker.terminate(); } catch (e) {}
    }
  }
  return "";
}

/**
 * Main Universal PDF Text Extractor
 * Accepts a file path or buffer
 */
async function extractTextFromPdf(filePathOrBuffer) {
  let buffer;
  if (typeof filePathOrBuffer === "string") {
    buffer = fs.readFileSync(filePathOrBuffer);
  } else {
    buffer = filePathOrBuffer;
  }

  // 1. Try standard pdf-parse
  let text = await parseWithPdfParse(buffer);
  if (text) {
    console.log(`[PDFParser] Successfully parsed using pdf-parse (${text.length} chars).`);
    return text;
  }

  // 2. Try raw PDF stream & FlateDecode extraction
  text = parseRawPdfStreams(buffer);
  if (text) {
    console.log(`[PDFParser] Successfully parsed using raw stream extraction (${text.length} chars).`);
    return text;
  }

  // 3. Try OCR on embedded images (for scanned admit cards / documents)
  text = await parseWithOcr(buffer);
  if (text) {
    console.log(`[PDFParser] Successfully extracted text using OCR (${text.length} chars).`);
    return text;
  }

  return "";
}

module.exports = {
  extractTextFromPdf,
};
