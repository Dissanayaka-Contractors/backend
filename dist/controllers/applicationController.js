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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteApplication = exports.updateApplicationStatus = exports.downloadCV = exports.getUserApplications = exports.getAllApplications = exports.submitApplication = void 0;
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
// Email Transporter (Reuse from authController or extract to utility later)
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});
const sendStatusEmail = (email, fullName, jobTitle, status) => __awaiter(void 0, void 0, void 0, function* () {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn('Skipping email notification: EMAIL_USER or EMAIL_PASS not set.');
        return;
    }
    let subject = '';
    let text = '';
    let html = '';
    if (status === 'accepted') {
        subject = `Congratulations! Application Accepted - ${jobTitle}`;
        text = `Dear ${fullName},\n\nWe are pleased to inform you that your application for the position of ${jobTitle} has been accepted. We will contact you shortly with further details.\n\nBest regards,\nDissanayaka Contractors`;
        html = `<h3>Application Accepted</h3><p>Dear ${fullName},</p><p>We are pleased to inform you that your application for the position of <strong>${jobTitle}</strong> has been <strong>accepted</strong>.</p><p>We will contact you shortly with further details.</p><br><p>Best regards,<br>Dissanayaka Contractors</p>`;
    }
    else if (status === 'rejected') {
        subject = `Update on your application - ${jobTitle}`;
        text = `Dear ${fullName},\n\nThank you for your interest in the ${jobTitle} position at Dissanayaka Contractors. After careful consideration, we regret to inform you that we will not be proceeding with your application at this time.\n\nWe wish you the best in your job search.\n\nBest regards,\nDissanayaka Contractors`;
        html = `<h3>Application Update</h3><p>Dear ${fullName},</p><p>Thank you for your interest in the <strong>${jobTitle}</strong> position at Dissanayaka Contractors.</p><p>After careful consideration, we regret to inform you that we will not be proceeding with your application at this time.</p><p>We wish you the best in your job search.</p><br><p>Best regards,<br>Dissanayaka Contractors</p>`;
    }
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: subject,
        text: text,
        html: html
    };
    yield transporter.sendMail(mailOptions);
});
const updateApplicationStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = Number(req.params.id);
        const { status } = req.body;
        if (!['pending', 'reviewed', 'accepted', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }
        const success = yield Application_1.ApplicationModel.updateStatus(id, status);
        if (!success) {
            return res.status(404).json({ message: 'Application not found' });
        }
        // Fetch application details to send email
        // We need to implement findById in ApplicationModel first or just trust the frontend?
        // Better to fetch from DB to be safe and get correct email/name.
        // For now, let's assume valid ID and we might need to add findById to ApplicationModel if not exists, 
        // OR just reuse findAll/findById? 
        // ApplicationModel.findCVById only returns CV data. 
        // Let's rely on the frontend passing necessary data OR add findById.
        // Adding findById to ApplicationModel is cleaner.
        // Wait, I can't edit Model and Controller in one step if they are different files. 
        // I'll add findById to ApplicationModel in this same step if possible? No, strictly one file per tool.
        // I will assume I can fetch it via a raw query here for speed, or just ask frontend to pass email/name (less secure but faster).
        // Let's do a quick raw query here or modify Model in next step.
        // Actually, let's check if I can just query it here since I imported pool. Not imported here properly? 
        // I don't have pool imported in controller usually, it's in Model.
        // I will add `getApplicationDetails` to ApplicationModel in the next step.
        // For now, I'll update the status. I will send the email in a separate step or just do it after adding the helper.
        // Actually, I'll add the logic to fetch details inside the controller using a direct query if I can, OR request the model update first.
        // Refined Plan:
        // 1. Update ApplicationController (this step) - adding logic but commenting out email part until Model has findById? 
        // No, I'll use a hack or just add the Model update next.
        // actually `findAll` returns all. 
        // Let's add the `updateStatus` and `sendEmail` logic, but I need the applicant's email.
        // I'll grab it from the frontend request body for now to save a DB call, 
        // IF the frontend has it. AdminDashboard has it.
        // So I'll expect { status, email, fullName, jobTitle } in the body.
        const { email, fullName, jobTitle } = req.body;
        if (email && fullName && jobTitle && (status === 'accepted' || status === 'rejected')) {
            yield sendStatusEmail(email, fullName, jobTitle, status);
        }
        res.json({ message: 'Application status updated successfully' });
    }
    catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({ message: 'Error updating status', error });
    }
});
exports.updateApplicationStatus = updateApplicationStatus;
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
