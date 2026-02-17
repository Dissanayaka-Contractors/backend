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


// Email Transporter (Refactored to use emailService)
import { sendEmail } from '../utils/emailService';

const sendStatusEmail = async (email: string, fullName: string, jobTitle: string, status: 'accepted' | 'rejected') => {
    // Only proceed if email service is likely configured (emailService handles the check internally but we can skip if obviously missing critical envs if we want, but better to let service handle it or just try).
    // The emailService logs warning if SMTP/Gmail not configured properly.

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

    const emailOptions = {
        to: email,
        subject: subject,
        text: text,
        html: html
    };

    try {
        await sendEmail(emailOptions);
    } catch (error) {
        console.warn('Failed to send status email:', error);
    }
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

        // Fetch application details to send email (Reliable method)
        const application = await ApplicationModel.findById(id);

        if (application && application.email && application.full_name && application.job_title && (status === 'accepted' || status === 'rejected')) {
            await sendStatusEmail(application.email, application.full_name, application.job_title, status);
        } else {
            if (!application) {
                console.warn(`Application with ID ${id} not found after status update.`);
            } else {
                console.warn(`Skipping email for application ${id}: Missing email, fullName, or jobTitle.`);
            }
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
