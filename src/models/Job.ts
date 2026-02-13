import pool from '../config/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface Job {
    id?: number;
    title: string;
    type: string;
    location: string;
    description: string;
    salary: string;
    postedDate: string;
    keywords: string[];
}

export const JobModel = {
    findAll: async (): Promise<Job[]> => {
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM jobs ORDER BY postedDate DESC');
        return rows.map(row => ({
            ...row,
            keywords: typeof row.keywords === 'string' ? JSON.parse(row.keywords) : row.keywords
        })) as Job[];
    },

    create: async (job: Job): Promise<number> => {
        const [result] = await pool.query<ResultSetHeader>(
            'INSERT INTO jobs (title, type, location, description, salary, postedDate, keywords) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [job.title, job.type, job.location, job.description, job.salary, job.postedDate, JSON.stringify(job.keywords || [])]
        );
        return result.insertId;
    },

    findById: async (id: number): Promise<Job | null> => {
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM jobs WHERE id = ?', [id]);
        if (rows.length === 0) return null;
        const row = rows[0];
        return {
            ...row,
            keywords: typeof row.keywords === 'string' ? JSON.parse(row.keywords) : row.keywords
        } as Job;
    }
};
