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
router.get('/view-pdf', (req, res) => {
  const { folderPath, fileName } = req.query;
  console.log('Received query params:', req.query);  // Log all query params

  if (!folderPath || !fileName) {
    console.error('Missing folderPath or fileName');
    return res.status(400).json({ message: 'Folder and file parameters are required' });
  }

  const filePath = path.join(__dirname, '../uploads', folderPath, fileName);
  console.log('Serving file from path:', filePath);

  res.sendFile(filePath, (err) => {
    if (err) {
      console.error('Error serving PDF:', err);
      return res.status(500).json({ message: 'Error retrieving PDF' });
    }
  });
});

module.exports = router;
