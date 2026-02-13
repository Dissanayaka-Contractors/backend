import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { submitApplication, getAllApplications, getUserApplications } from '../controllers/applicationController';
import { protect, adminOnly } from '../middleware/authMiddleware';

const router = Router();

import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer for Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        return {
            folder: 'dissanayaka-contractors/applications',
            allowed_formats: ['pdf', 'doc', 'docx'],
            resource_type: 'auto', // Auto-detect resource type
            public_id: `${Date.now()}-${path.parse(file.originalname).name}`
        };
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

router.post('/', protect, upload.single('cv'), submitApplication);
router.get('/', protect, adminOnly, getAllApplications);
router.get('/my', protect, getUserApplications);

export default router;
