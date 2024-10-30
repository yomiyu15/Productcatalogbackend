const express = require('express');
const router = express.Router();
const FolderController = require('../controller/foldercontroller');

router.post('/create-folder',   FolderController.createFolder); // Ensure this is defined
router.post('/create-subfolder', FolderController.createSubfolder);
router.put('/edit', FolderController.editFolder);
router.delete('/delete', FolderController.deleteFolder);
router.put('/e>', FolderController.editSubfolder);
router.delete('/delete-subfolder', FolderController.deleteSubfolder);
router.get('/structure', FolderController.getFolderStructure);


module.exports = router;