const fs = require("fs");
const path = require("path");
const mammoth = require("mammoth");
const Groq = require("groq-sdk");
const Course = require("../models/Course");
const { extractTextFromPdf } = require("../utils/pdfParser");

// Helper to extract text from file or course or raw text
const extractSourceText = async (req) => {
  let text = "";

  if (req.file) {
    const fileExt = path.extname(req.file.originalname).toLowerCase();
    if (req.file.mimetype === "application/pdf" || fileExt === ".pdf") {
      text = await extractTextFromPdf(req.file.path);
    } else if (
      req.file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      fileExt === ".docx"
    ) {
      const result = await mammoth.extractRawText({ path: req.file.path });
      text = result.value ? result.value.trim() : "";
    } else if (fileExt === ".txt") {
      text = fs.readFileSync(req.file.path, "utf-8");
    }
  } else if (req.body.courseId) {
    try {
      const course = await Course.findById(req.body.courseId);
      if (course) {
        text = `Title: ${course.title}\nCategory: ${course.category || "General"}\nInstructor: ${course.instructor || "Instructor"}\nPrice: $${course.price || 0}\nDuration: ${course.duration || "N/A"}\nDescription:\n${course.description}`;
      }
    } catch (e) {
      console.warn("Course lookup warning:", e.message);
    }
  }

  if (!text && req.body.notesText) {
    text = req.body.notesText.trim();
  }

  return text;
};

// Robust helper to extract and parse JSON from Groq completion response
const cleanJsonResponse = (content) => {
  if (!content) throw new Error("Empty response from AI model");
  let text = content.trim();

  // Extract content inside first '{' and last '}'
  const startIdx = text.indexOf("{");
  const endIdx = text.lastIndexOf("}");
  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    text = text.substring(startIdx, endIdx + 1);
  } else {
    text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  }

  try {
    return JSON.parse(text);
  } catch (parseError) {
    console.error("JSON Parsing failed for text:", content);
    throw new Error("Failed to parse valid JSON from AI output: " + parseError.message);
  }
};

// 1. Generate Interactive Quiz

exports.generateQuiz = async (req, res) => {
  const apiKey = (process.env.GROQ_API_KEY || "").trim();
  if (!apiKey) {
    return res.status(500).json({
      success: false,
      message: "GROQ_API_KEY is missing from backend environment variables. Please add GROQ_API_KEY to backend/.env file.",
    });
  }

  const groq = new Groq({ apiKey });

  try {
    const sourceText = await extractSourceText(req);
    const difficulty = req.body.difficulty || "Medium";
    const numQuestions = parseInt(req.body.numQuestions) || 5;

    if (!sourceText) {
      return res.status(400).json({
        success: false,
        message: "No content provided. Please upload a file, select a course, or enter study notes.",
      });
    }

    const systemPrompt = `
You are an expert educational assessment creator.
Generate a high quality interactive quiz based on the provided content.
Difficulty Level: ${difficulty}
Number of Questions: ${numQuestions}

Return JSON in this EXACT structure with no extra text:
{
  "title": "Quiz Title",
  "topic": "Topic Name",
  "difficulty": "${difficulty}",
  "questions": [
    {
      "id": 1,
      "question": "Clear question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswerIndex": 0,
      "hint": "Helpful subtle hint without giving away the direct answer",
      "explanation": "Clear explanation of why this answer is correct."
    }
  ]
}
`;

    const candidateModels = [
      "groq/compound-mini",
      "groq/compound",
      "openai/gpt-oss-20b",
      "openai/gpt-oss-120b",
      "qwen/qwen3.6-27b",
      "llama-3.3-70b-versatile",
      "llama-3.1-8b-instant"
    ];

    let aiRes = null;
    let lastError = null;

    for (const model of candidateModels) {
      try {
        try {
          aiRes = await groq.chat.completions.create({
            model,
            response_format: { type: "json_object" },
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: `Source Content:\n${sourceText.slice(0, 8000)}` },
            ],
            temperature: 0.7,
          });
        } catch (jsonFormatErr) {
          aiRes = await groq.chat.completions.create({
            model,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: `Source Content:\n${sourceText.slice(0, 8000)}` },
            ],
            temperature: 0.7,
          });
        }
        if (aiRes && aiRes.choices && aiRes.choices[0]?.message?.content) {
          break;
        }
      } catch (err) {
        console.warn(`Groq model '${model}' failed: ${err.message}. Trying next candidate...`);
        lastError = err;
      }
    }

    if (!aiRes) {
      throw lastError || new Error("All Groq AI candidate models failed to generate response.");
    }

    const parsedData = cleanJsonResponse(aiRes.choices[0].message.content);

    res.json({
      success: true,
      data: parsedData,
    });
  } catch (error) {
    console.error("Quiz Generation Error:", error);
    res.status(500).json({
      message: error.message || "Failed to generate Quiz",
    });
  }
};
