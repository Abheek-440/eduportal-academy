const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const { generateQuiz } = require("../controller/notebookLmController");

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = "uploads/docs/";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (
    file.mimetype === "application/pdf" ||
    file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    ext === ".pdf" ||
    ext === ".docx" ||
    ext === ".txt"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF, DOCX, or TXT files are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB limit
});

router.post("/quiz", upload.single("document"), generateQuiz);

module.exports = router;
