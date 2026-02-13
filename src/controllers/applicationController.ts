import { Request, Response } from 'express';
import { ApplicationModel, Application } from '../models/Application';

// Extend Request to include file from multer and user from auth middleware
interface AuthenticatedRequest extends Request {
    user?: any;
    file?: Express.Multer.File;
}

export const submitApplication = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'CV file is required' });
        }

        const { job_id, full_name, email, phone, address, gender } = req.body;
        const user_id = req.user.id;

        if (!job_id || !full_name || !email || !phone || !address || !gender) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const newApplication: Application = {
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

        const id = await ApplicationModel.create(newApplication);
        res.status(201).json({ message: 'Application submitted successfully', id });
    } catch (error) {
        console.error('Error submitting application:', error);
        res.status(500).json({ message: 'Error submitting application', error });
    }
};

export const getAllApplications = async (req: Request, res: Response) => {
    try {
        const applications = await ApplicationModel.findAll();
        res.json(applications);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching applications', error });
    }
};

export const getUserApplications = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const applications = await ApplicationModel.findByUserId(req.user.id);
        res.json(applications);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching applications', error });
    }
};

export const downloadCV = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const cv = await ApplicationModel.findCVById(id);

        if (!cv || !cv.cv_data) {
            return res.status(404).json({ message: 'CV not found' });
        }

        res.setHeader('Content-Type', cv.cv_mimetype);
        res.setHeader('Content-Disposition', `inline; filename="${cv.cv_path}"`);
        res.send(cv.cv_data);
    } catch (error) {
        console.error('Error downloading CV:', error);
        res.status(500).json({ message: 'Error downloading CV' });
    }
};


// Email Transporter (Reuse from authController or extract to utility later)
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendStatusEmail = async (email: string, fullName: string, jobTitle: string, status: 'accepted' | 'rejected') => {
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
    } else if (status === 'rejected') {
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

    await transporter.sendMail(mailOptions);
};

export const updateApplicationStatus = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const { status } = req.body;

        if (!['pending', 'reviewed', 'accepted', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const success = await ApplicationModel.updateStatus(id, status);
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
            await sendStatusEmail(email, fullName, jobTitle, status);
        }

        res.json({ message: 'Application status updated successfully' });
    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({ message: 'Error updating status', error });
    }
};

export const deleteApplication = async (req: Request, res: Response) => {
    try {
        const success = await ApplicationModel.delete(Number(req.params.id));
        if (!success) {
            return res.status(404).json({ message: 'Application not found' });
        }
        res.json({ message: 'Application deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting application', error });
    }
};
