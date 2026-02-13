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
            cv_path: req.file.path,
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
