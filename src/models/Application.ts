import pool from '../config/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface Application {
    id?: number;
    job_id: number;
    user_id: number;
    full_name: string;
    email: string;
    phone: string;
    address: string;
    gender: string;
    cv_path: string;
    status: 'pending' | 'reviewed' | 'rejected' | 'accepted';
    applied_at?: Date;
    job_title?: string; // For joining
}

export const ApplicationModel = {
    create: async (application: Application): Promise<number> => {
        const [result] = await pool.query<ResultSetHeader>(
            'INSERT INTO applications (job_id, user_id, full_name, email, phone, address, gender, cv_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [application.job_id, application.user_id, application.full_name, application.email, application.phone, application.address, application.gender, application.cv_path]
        );
        return result.insertId;
    },

    findAll: async (): Promise<Application[]> => {
        const [rows] = await pool.query<RowDataPacket[]>(`
            SELECT a.*, j.title as job_title 
            FROM applications a 
            JOIN jobs j ON a.job_id = j.id 
            ORDER BY a.applied_at DESC
        `);
        return rows as Application[];
    },

    findByUserId: async (userId: number): Promise<Application[]> => {
        const [rows] = await pool.query<RowDataPacket[]>(`
            SELECT a.*, j.title as job_title 
            FROM applications a 
            JOIN jobs j ON a.job_id = j.id 
            WHERE a.user_id = ? 
            ORDER BY a.applied_at DESC
        `, [userId]);
        return rows as Application[];
    },

    updateStatus: async (id: number, status: string): Promise<boolean> => {
        const [result] = await pool.query<ResultSetHeader>(
            'UPDATE applications SET status = ? WHERE id = ?',
            [status, id]
        );
        return result.affectedRows > 0;
    }
};
