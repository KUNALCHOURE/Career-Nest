import multer from 'multer';
import path from 'path';
import ApiError from '../utils/Apierror.js';

// Use memory storage instead of disk storage
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf' ||
        file.mimetype === 'application/msword' || // For .doc files
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // For .docx files
    ) {
        cb(null, true);
    } else {
        cb(new ApiError(400, 'Only PDF, DOC, and DOCX files are allowed!'), false);
    }
};

// Configure multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    }
});

// Error handling middleware
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File size should not exceed 5MB'
            });
        }
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }
    next(err);
};

export { upload, handleMulterError };
