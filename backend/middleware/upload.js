const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage(
    {
        destination: function(req,file,cb) {
            cb(null,"uploads/");
        },
         filename: function(req,file,cb) {
            const uniquename = Date.now() +"_"+Math.random(Math.random()* 1000000);
            cb(null,uniquename + path.extname(file.originalname));
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

   