const express = require('express');
const router = express.Router();
const FileController = require('../controller/filecontroller'); // Adjust path if necessary

// Define your routes
router.post('/upload', FileController.uploadFile); // Upload file route
router.get('/pdf-viewer', FileController.getPdfViewer); // PDF viewer route
router.get('/list-files', FileController.listFiles); // List files route
router.delete('/delete-file', FileController.deleteFile); // Delete file route
router.get('/list-pdfs', FileController.listPdfs); // List PDF files
router.get('/search', FileController.searchPdf); // Search PDF by filename

module.exports = router;
