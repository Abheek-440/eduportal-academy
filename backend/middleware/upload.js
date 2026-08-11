const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Configure Cloudinary if credentials exist in process.env
const isCloudinaryConfigured = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

let storage;

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: "eduportal_courses",
      allowed_formats: ["jpg", "jpeg", "png", "webp", "gif", "svg"],
    },
  });
} else {
  const uploadDir = "uploads/";
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  storage = multer.diskStorage({
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
}

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



   