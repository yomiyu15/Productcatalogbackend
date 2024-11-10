// fileroutes.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const fileController = require('../controller/filecontroller');  // Ensure correct path

const router = express.Router();

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { folderPath } = req.body;
    const folderDirectory = path.join(__dirname, "../uploads", folderPath || "");
    ensureDirectoryExists(folderDirectory);
    cb(null, folderDirectory);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB file size limit
});

// Helper function to ensure directory exists
const ensureDirectoryExists = (folderPath) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
};

// POST route for file upload
router.post('/upload-file', upload.single('file'), fileController.uploadFile);

module.exports = router;
