"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const applicationController_1 = require("../controllers/applicationController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Configure Multer for Memory Storage (BLOB)
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /pdf|doc|docx/;
        const extname = filetypes.test(path_1.default.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        }
        else {
            cb(new Error('Only PDF and Word documents are allowed'));
        }
    }
});
router.post('/', authMiddleware_1.protect, upload.single('cv'), applicationController_1.submitApplication);
router.get('/', authMiddleware_1.protect, authMiddleware_1.adminOnly, applicationController_1.getAllApplications);
router.get('/my', authMiddleware_1.protect, applicationController_1.getUserApplications);
router.get('/:id/cv', applicationController_1.downloadCV);
router.put('/:id/status', authMiddleware_1.protect, authMiddleware_1.adminOnly, applicationController_1.updateApplicationStatus);
router.delete('/:id', authMiddleware_1.protect, authMiddleware_1.adminOnly, applicationController_1.deleteApplication);
exports.default = router;
