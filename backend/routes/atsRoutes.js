const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const { analyzeResume } = require("../controller/atsController");

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = "uploads/resumes/";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "application/pdf" ||
    file.mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF or DOCX file allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
});

router.post("/analyze", upload.single("resume"), analyzeResume);

module.exports = router;
