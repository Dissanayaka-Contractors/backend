import { Request, Response } from 'express';
import { JobModel, Job } from '../models/Job';
import * as fs from 'fs';
import * as path from 'path';

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

        // --- Facebook Graph API Integration (with Photo, Vercel Fixed) ---
        try {
            const pageId = process.env.FB_PAGE_ID || '1014189591774493';
            const accessToken = process.env.FB_ACCESS_TOKEN || 'EAAXiqXoRCYIBQ8FLldw856TZBq7eGFFtH83R9h5JRmLqnZCpKsCLFXKkpPdT6e8fkHZCghm1ayM4UwT0Obgi4PsmjonJbOUlDMpHxeegwtZBEzqDxgwmTNtPm5zOrZAUZCjvhRTnBKIAyFy1blt6gQXULZARQsdifl6HH2o6aq8hNDBjZAqVpCMk42kXRZB59DLgctU07eHO5CnCRPoBkEo8dEJvKbdxhi90vGgPlQUhe624ZD';

            const message = `New Job Posted: ${jobData.title}!\n\nLocation: ${jobData.location}\n\nType: ${jobData.type}\n\nSalary: ${jobData.salary}\n\n${jobData.description}\n\nVisit our site to apply.\n\nhttps://www.dissanayakacontractors.com/careers/${id}`;

            const form = new FormData();
            form.append('message', message);
            form.append('access_token', accessToken);

            // Fetch the image from the live frontend URL instead of the local filesystem (Vercel fix)
            const frontendUrl = process.env.FRONTEND_URL || 'https://www.dissanayakacontractors.com';
            const imageUrl = `${frontendUrl}/fb_post.png`;

            try {
                const imageResponse = await fetch(imageUrl);
                if (imageResponse.ok) {
                    const blob = await imageResponse.blob();
                    form.append('source', blob, 'fb_post.png');
                } else {
                    console.warn(`Failed to fetch image from ${imageUrl} (Status: ${imageResponse.status}). Posting without image.`);
                }
            } catch (fetchError) {
                console.warn(`Network error fetching image from ${imageUrl}. Posting without image. Error:`, fetchError);
            }

            const fbResponse = await fetch(`https://graph.facebook.com/v19.0/${pageId}/photos`, {
                method: 'POST',
                body: form as any // To appease older TS version DOM typings, or you could drop `as any` if it natively supports the global.
            });

            if (!fbResponse.ok) {
                const errorData = await fbResponse.json();
                console.error("Facebook post failed:", errorData);
            } else {
                console.log("Successfully posted job to Facebook!");
            }
        } catch (fbError) {
            console.error("Error connecting to Facebook Graph API:", fbError);
        }
        // --------------------------------------

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

export const deleteJob = async (req: Request, res: Response) => {
    try {
        const success = await JobModel.softDelete(Number(req.params.id));
        if (!success) {
            return res.status(404).json({ message: 'Job not found' });
        }
        res.json({ message: 'Job deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting job', error });
    }
};
