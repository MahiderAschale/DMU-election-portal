const multer = require("multer");
const path = require("path");

// STORAGE CONFIG
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // MUST match server.js static folder
  },

  filename: (req, file, cb) => {
    // unique filename to avoid conflicts
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);

    cb(null, uniqueName);
  }
});

// FILE FILTER (optional but good)
const fileFilter = (req, file, cb) => {
  cb(null, true); // accept all files for now
};

const upload = multer({
  storage,
  fileFilter
});

module.exports = upload;