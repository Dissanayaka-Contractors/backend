"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteApplication = exports.downloadCV = exports.getUserApplications = exports.getAllApplications = exports.submitApplication = void 0;
const Application_1 = require("../models/Application");
const submitApplication = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'CV file is required' });
        }
        const { job_id, full_name, email, phone, address, gender } = req.body;
        const user_id = req.user.id;
        if (!job_id || !full_name || !email || !phone || !address || !gender) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        const newApplication = {
            job_id: Number(job_id),
            user_id,
            full_name,
            email,
            phone,
            address,
            gender,
            cv_path: req.file.originalname, // Store filename
            cv_data: req.file.buffer, // Store Buffer
            cv_mimetype: req.file.mimetype, // Store MimeType
            status: 'pending'
        };
        const id = yield Application_1.ApplicationModel.create(newApplication);
        res.status(201).json({ message: 'Application submitted successfully', id });
    }
    catch (error) {
        console.error('Error submitting application:', error);
        res.status(500).json({ message: 'Error submitting application', error });
    }
});
exports.submitApplication = submitApplication;
const getAllApplications = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const applications = yield Application_1.ApplicationModel.findAll();
        res.json(applications);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching applications', error });
    }
});
exports.getAllApplications = getAllApplications;
const getUserApplications = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const applications = yield Application_1.ApplicationModel.findByUserId(req.user.id);
        res.json(applications);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching applications', error });
    }
});
exports.getUserApplications = getUserApplications;
const downloadCV = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = Number(req.params.id);
        const cv = yield Application_1.ApplicationModel.findCVById(id);
        if (!cv || !cv.cv_data) {
            return res.status(404).json({ message: 'CV not found' });
        }
        res.setHeader('Content-Type', cv.cv_mimetype);
        res.setHeader('Content-Disposition', `inline; filename="${cv.cv_path}"`);
        res.send(cv.cv_data);
    }
    catch (error) {
        console.error('Error downloading CV:', error);
        res.status(500).json({ message: 'Error downloading CV' });
    }
});
exports.downloadCV = downloadCV;
const deleteApplication = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const success = yield Application_1.ApplicationModel.delete(Number(req.params.id));
        if (!success) {
            return res.status(404).json({ message: 'Application not found' });
        }
        res.json({ message: 'Application deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting application', error });
    }
});
exports.deleteApplication = deleteApplication;
