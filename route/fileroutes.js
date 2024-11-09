const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../db'); // Import your db setup
const UPLOADS_DIR = path.join(__dirname, 'uploads'); // Define upload directory

const router = express.Router();

// Multer storage configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folderPath = path.join(UPLOADS_DIR, req.body.folderPath || '');
    // Create folder if it doesn't exist
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
    cb(null, folderPath);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Use original file name
  }
});

const upload = multer({ storage });

// Route for uploading a file
router.post('/upload', upload.single('file'), async (req, res) => {
  const { folderId } = req.body;
  const file = req.file;

  try {
    const result = await db.query(
      `INSERT INTO files (folder_id, filename, folder_path) VALUES ($1, $2, $3) RETURNING *`,
      [folderId, file.originalname, req.body.folderPath || '']
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Error uploading file' });
  }
});

// Route for renaming a file
router.put('/rename', async (req, res) => {
  const { fileId, newName } = req.body;

  try {
    const result = await db.query(
      `UPDATE files SET filename = $1 WHERE id = $2 RETURNING *`,
      [newName, fileId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error renaming file:', error);
    res.status(500).json({ error: 'Error renaming file' });
  }
});

// Route for deleting a file
router.delete('/delete/:fileId', async (req, res) => {
  const { fileId } = req.params;

  try {
    const fileResult = await db.query('SELECT * FROM files WHERE id = $1', [fileId]);

    if (fileResult.rows.length === 0) {
      return res.status(404).json({ error: 'File not found' });
    }

    const file = fileResult.rows[0];
    const filePath = path.join(UPLOADS_DIR, file.folder_path, file.filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath); // Delete file from the filesystem
    }

    const deleteResult = await db.query('DELETE FROM files WHERE id = $1 RETURNING *', [fileId]);

    if (deleteResult.rows.length === 0) {
      return res.status(404).json({ error: 'File deletion failed' });
    }

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: 'Error deleting file' });
  }
});

module.exports = router;
