import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { submitApplication, getAllApplications, getUserApplications } from '../controllers/applicationController';
import { protect, adminOnly } from '../middleware/authMiddleware';

const router = Router();

// Configure Multer for PDF/Doc uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /pdf|doc|docx/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only PDF and Word documents are allowed'));
        }
    }
});

router.post('/', protect, upload.single('cv'), submitApplication);
router.get('/', protect, adminOnly, getAllApplications);
router.get('/my', protect, getUserApplications);

export default router;
