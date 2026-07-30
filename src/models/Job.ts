import { getDB, getNextSequenceValue } from '../config/db';

export interface Job {
    id?: number;
    title: string;
    type: string;
    location: string;
    description: string;
    salary: string;
    postedDate: string;
    keywords: string[];
    status?: number;
}

export const JobModel = {
    findAll: async (): Promise<Job[]> => {
        const db = getDB();
        const jobs = await db.collection('jobs')
            .find({ status: { $ne: 5 } }) // Assuming 5 is deleted, and 1 is active, or just not 5. Let's use $ne 5 or $eq 1 based on old code. Old code used `status = 1`.
            // Wait, looking at old code: `SELECT * FROM jobs WHERE status = 1`
            // and `softDelete: UPDATE jobs SET status = 5`
            // Let's stick to status: 1, or if it's missing (migrated records didn't have status in schema!), we should handle it.
            // Wait, the MySQL schema didn't have `status` column in `jobs` table, but `Job.ts` uses `status = 1`. 
            // In the migration script, we just migrated `jobs` table. The old DB probably had a status column added later. Let's query by `$or: [{status: 1}, {status: {$exists: false}}]`.
            .sort({ postedDate: -1 })
            .toArray();
            
        // Filter out status 5 just in case.
        return jobs.filter(j => j.status !== 5) as unknown as Job[];
    },

    create: async (job: Job): Promise<number> => {
        const db = getDB();
        const id = await getNextSequenceValue('jobId');
        const newJob = {
            ...job,
            id,
            status: 1
        };
        await db.collection('jobs').insertOne(newJob);
        return id;
    },

    findById: async (id: number): Promise<Job | null> => {
        const db = getDB();
        const job = await db.collection('jobs').findOne({ id, status: { $ne: 5 } });
        return job as Job | null;
    },

    softDelete: async (id: number): Promise<boolean> => {
        const db = getDB();
        const result = await db.collection('jobs').updateOne(
            { id },
            { $set: { status: 5 } }
        );
        return result.modifiedCount > 0;
    }
};
