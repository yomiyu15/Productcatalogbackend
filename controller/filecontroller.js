const fs = require('fs').promises; // Use promises for better async handling
const path = require('path');
const { client } = require('../db'); // Adjust path as necessary

const UPLOADS_DIR = path.join(__dirname, '../uploads');

const uploadFile = async (req, res) => {
    console.log(req.body); // Log the incoming request body for debugging

    const { folderPath } = req.body; // This might need to be changed

    if (!folderPath) {
        return res.status(400).send('Folder path is required');
    }

    // Create the folder path for uploads
    const fullFolderPath = path.join(UPLOADS_DIR, folderPath);

    try {
        // Create the full path for the folder, including any necessary parent folders
        await fs.mkdir(fullFolderPath, { recursive: true }); // Ensure nested folder creation
    } catch (err) {
        console.error('Error creating folder', err);
        return res.status(500).send('Error creating folder');
    }

    const file = req.files?.file; // Get the uploaded file

    if (!file) {
        return res.status(400).send('No file uploaded');
    }

    const uploadPath = path.join(fullFolderPath, file.name); // Path to upload the file

    try {
        await file.mv(uploadPath); // Move the file to the target directory
        const query = 'INSERT INTO uploads(original_name, path) VALUES($1, $2) RETURNING id';
        const values = [file.name, uploadPath];

        const result = await client.query(query, values);
        res.status(201).send(`File uploaded successfully! File ID: ${result.rows[0].id}`);
    } catch (err) {
        console.error('Error during file upload', err);
        res.status(500).send('Error uploading file');
    }
};




// Get PDF viewer
const getPdfViewer = async (req, res) => {
    const { folder, subfolder, file } = req.query;

    // Construct the PDF path
    const pdfPath = subfolder
        ? path.join(UPLOADS_DIR, folder, subfolder, file) // Include subfolder if present
        : path.join(UPLOADS_DIR, folder, file); // Only the main folder if no subfolder

    console.log("Constructed PDF Path: ", pdfPath); // Log constructed path for debugging

    try {
        await fs.access(pdfPath); // Check if the file is accessible
        res.sendFile(pdfPath); // Serve the file if it exists
    } catch (err) {
        console.error("Error while loading PDF:", err);
        return res.status(404).send('PDF not found');
    }
};

// List files in a folder
const listFiles = async (req, res) => {
    const { folderName } = req.query;

    if (!folderName) {
        return res.status(400).send('Folder name is required');
    }

    const folderPath = path.join(UPLOADS_DIR, folderName);

    const listFilesRecursively = async (dir) => {
        let results = [];
        const list = await fs.readdir(dir);

        for (const file of list) {
            const filePath = path.join(dir, file);
            const isDirectory = (await fs.lstat(filePath)).isDirectory();

            if (isDirectory) {
                results = results.concat(await listFilesRecursively(filePath)); // Recursion for subdirectories
            } else {
                results.push({
                    name: file,
                    path: filePath
                });
            }
        }

        return results;
    };

    try {
        const files = await listFilesRecursively(folderPath);
        res.json(files);
    } catch (err) {
        console.error('Error listing files', err);
        res.status(500).send('Error retrieving files');
    }
};

// Delete a file
const deleteFile = async (req, res) => {
    const { filePath } = req.body;
    console.log('Received request to delete file:', filePath);

    if (!filePath) {
        return res.status(400).send('File path is required');
    }

    const absolutePath = path.join(UPLOADS_DIR, filePath);
    console.log('Absolute path resolved to:', absolutePath);

    try {
        await fs.access(absolutePath); // Check if the file exists
        await fs.unlink(absolutePath); // Delete the file
        console.log(`Deleted file: ${absolutePath}`);
        res.send('File deleted successfully');
    } catch (err) {
        if (err.code === 'ENOENT') {
            console.log('File does not exist at:', absolutePath);
            return res.status(404).send('File not found');
        }
        console.error('Error deleting file', err);
        res.status(500).send('Error deleting file');
    }
};

// List all PDF files
const listPdfs = async (req, res) => {
    const listFilesRecursively = async (dir) => {
        let results = [];
        const list = await fs.readdir(dir);

        for (const file of list) {
            const filePath = path.join(dir, file);
            const isDirectory = (await fs.lstat(filePath)).isDirectory();

            if (isDirectory) {
                results = results.concat(await listFilesRecursively(filePath)); // Recursion for subdirectories
            } else if (file.endsWith('.pdf')) { // Only include PDF files
                results.push(file); // Only store the filename
            }
        }

        return results;
    };

    try {
        const pdfs = await listFilesRecursively(UPLOADS_DIR);
        res.json(pdfs); // Respond with the list of filenames
    } catch (err) {
        console.error('Error listing PDF files', err);
        res.status(500).send('Error retrieving PDF files');
    }
};

// Search for a PDF by filename
const searchPdf = async (req, res) => {
    const { filename } = req.query;

    if (!filename) {
        return res.status(400).send('Filename is required');
    }

    const searchFilesRecursively = async (dir, searchTerm) => {
        let results = [];
        const list = await fs.readdir(dir);

        for (const file of list) {
            const filePath = path.join(dir, file);
            const isDirectory = (await fs.lstat(filePath)).isDirectory();

            if (isDirectory) {
                results = results.concat(await searchFilesRecursively(filePath, searchTerm));
            } else if (file.toLowerCase().includes(searchTerm.toLowerCase()) && file.endsWith('.pdf')) {
                results.push(file); // Only store the filename of matching PDFs
            }
        }

        return results;
    };

    try {
        const matchedFiles = await searchFilesRecursively(UPLOADS_DIR, filename);
        res.json(matchedFiles);
    } catch (err) {
        console.error('Error searching for PDF files', err);
        res.status(500).send('Error searching for PDF files');
    }
};

// Exporting the functions as an object
module.exports = {
    uploadFile,
    getPdfViewer,
    listFiles,
    deleteFile,
    listPdfs,
    searchPdf,
};
