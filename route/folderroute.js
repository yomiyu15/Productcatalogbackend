const express = require('express');
const router = express.Router();
const folderController = require('../controller/foldercontroller');

// Folder management routes
router.post('/create-folder', folderController.createFolder);
router.post('/upload-file', folderController.uploadFile); // Handles the file upload
router.put('/rename-item', folderController.renameItem);
router.delete('/delete-item', folderController.deleteItem);
router.get('/folder-structure', folderController.getFolderStructure);

module.exports = router;
