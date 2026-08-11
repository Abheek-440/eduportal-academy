const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Helper to check if valid Cloudinary credentials are set (not empty and not default placeholders)
const getCloudinaryConfig = () => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (
    cloudName &&
    apiKey &&
    apiSecret &&
    !cloudName.includes("your_") &&
    !apiKey.includes("your_") &&
    !apiSecret.includes("your_")
  ) {
    return { cloudName, apiKey, apiSecret };
  }
  return null;
};

const cloudConfig = getCloudinaryConfig();
let storage;

if (cloudConfig) {
  cloudinary.config({
    cloud_name: cloudConfig.cloudName,
    api_key: cloudConfig.apiKey,
    api_secret: cloudConfig.apiSecret,
  });

  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: "eduportal_courses",
      allowed_formats: ["jpg", "jpeg", "png", "webp", "gif", "svg"],
    },
  });
  console.log(`[Upload Middleware] ☁️ Cloudinary Storage configured & active for cloud: ${cloudConfig.cloudName}`);
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
  console.log("[Upload Middleware] 📁 Using Local Disk Storage (Cloudinary env vars missing or placeholders)");
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



   