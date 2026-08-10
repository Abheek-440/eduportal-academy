const fs = require("fs");
const path = require("path");
const mammoth = require("mammoth");
const Groq = require("groq-sdk");
const { extractTextFromPdf } = require("../utils/pdfParser");

exports.analyzeResume = async (req, res) => {
  const groq = new Groq({
    apiKey: (process.env.GROQ_API_KEY || "").trim(),
  });
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please upload a document or resume file" });
    }

    let resumeText = "";
    const fileExt = path.extname(req.file.originalname).toLowerCase();

    try {
      if (req.file.mimetype === "application/pdf" || fileExt === ".pdf") {
        resumeText = await extractTextFromPdf(req.file.path);
      } else if (
        req.file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        fileExt === ".docx"
      ) {
        const result = await mammoth.extractRawText({
          path: req.file.path,
        });
        resumeText = result.value ? result.value.trim() : "";
      } else if (fileExt === ".txt") {
        resumeText = fs.readFileSync(req.file.path, "utf-8");
      }
    } catch (parseError) {
      console.error("File parsing error:", parseError);
      return res.status(400).json({
        message: "Failed to read text from your file. Please ensure it is a valid PDF, DOCX, or TXT file.",
        error: parseError.message,
      });
    }

    if (!resumeText) {
      return res.status(400).json({
        message: "No readable text found in your document file. If it is an image-based PDF, ensure it has clear text or embedded images.",
      });
    }

    const aiRes = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `
You are an intelligent AI Document & ATS Resume Analyzer.
Analyze the uploaded document (which can be a resume, admit card, academic paper, report, assignment, certificate, or study guide) and return a clear, comprehensive analysis report.

Return this EXACT format:

Document Overview:
- Summary of document type and purpose

ATS / Quality Score: /100

Strong Points & Key Details:
- Point 1
- Point 2

Missing Keywords / Critical Info:
- Item 1
- Item 2

Improvement & Actionable Suggestions:
- Suggestion 1
- Suggestion 2

Best Job Role / Document Category:
- Role or category name
          `,
        },
        {
          role: "user",
          content: `Document Content (${req.file.originalname}):\n\n${resumeText.slice(0, 10000)}`,
        },
      ],
    });

    res.json({
      message: "Document analyzed successfully",
      report: aiRes.choices[0].message.content,
    });
  } catch (error) {
    console.error("ATS Analysis Error Details:", error);
    
    if (error.message && error.message.includes("Invalid API Key")) {
      return res.status(400).json({
        message: "Your Groq API Key is invalid or expired. Please check your GROQ_API_KEY in backend/.env.",
        error: error.message,
      });
    }

    res.status(500).json({
      message: error.message || "Document analysis failed",
      error: error.message,
    });
  }
};
