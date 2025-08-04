const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

// Ensure the 'uploads' directory exists
const uploadsDir = 'uploads/';
if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir);
}

// Configure the storage engine for Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // The destination folder for uploads
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        // Create a unique filename to prevent overwrites
        // e.g., 'profileImage-1678886400000-some-uuid.jpg'
        const uniqueSuffix = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, file.fieldname + '-' + uniqueSuffix);
    }
});

// File filter to ensure only image files are uploaded
const fileFilter = (req, file, cb) => {
    // Allowed file extensions
    const filetypes = /jpeg|jpg|png|gif/;
    // Check the extension
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check the mimetype
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Error: Images Only!'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5 // 5MB file size limit for safety
    },
    fileFilter: fileFilter
});

module.exports = upload;