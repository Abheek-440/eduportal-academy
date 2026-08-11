const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = "uploads/";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const rawExt = path.extname(file.originalname).toLowerCase();
    const ext = rawExt.replace(/[^.a-z0-9]/g, "") || ".png";
    const rawBase = path.basename(file.originalname, rawExt);
    const cleanBase = rawBase.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 30);
    const uniquename = `${Date.now()}_${Math.floor(Math.random() * 1000000)}_${cleanBase}${ext}`;
    cb(null, uniquename);
  },
});

const filefilter = (req, file, cb) => {
  const allowed = /jpg|jpeg|png|webp|gif|svg/;
  const extname = allowed.test(path.extname(file.originalname).toLowerCase());

  if (extname || (file.mimetype && file.mimetype.startsWith("image/"))) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (jpg, jpeg, png, webp, gif, svg) are allowed"));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: filefilter,
});

module.exports = upload;


   