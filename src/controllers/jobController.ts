import { Request, Response } from 'express';
import { JobModel, Job } from '../models/Job';

export const getJobs = async (req: Request, res: Response) => {
    try {
        const jobs = await JobModel.findAll();
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching jobs', error });
    }
};

export const createJob = async (req: Request, res: Response) => {
    try {
        const jobData: Job = req.body;
        // Basic validation
        if (!jobData.title || !jobData.location || !jobData.description || !jobData.type) {
            return res.status(400).json({ message: 'Missing required fields (title, location, description, type)' });
        }

        // Set default postedDate if not provided
        if (!jobData.postedDate) {
            jobData.postedDate = new Date().toISOString().split('T')[0];
        }

        const id = await JobModel.create(jobData);
        res.status(201).json({ message: 'Job created successfully', id, ...jobData });
    } catch (error) {
        console.error("Error creating job:", error);
        res.status(500).json({ message: 'Error creating job', error: String(error) });
    }
};

export const getJobById = async (req: Request, res: Response) => {
    try {
        const job = await JobModel.findById(Number(req.params.id));
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }
        res.json(job);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching job', error });
    }
};
