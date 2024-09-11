import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { ClientError } from '../utils/apiError.js';

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join('public')); // Adjust the path as needed
    },
    filename: (req, file, cb) => {
        crypto.randomBytes(16, (err, buffer) => {
            if (err) {
                return cb(err);
            }
            const filename = buffer.toString('hex') + path.extname(file.originalname);
            cb(null, filename);
        });
    }
});

// Configure multer
const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype !== 'application/pdf') {
            return cb(new ClientError('Only PDF files are allowed'));
        }
        cb(null, true);
    }
});

export default upload;
