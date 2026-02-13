import pool from '../config/db';
import { RowDataPacket } from 'mysql2';

export interface Testimonial {
    id?: number;
    name: string;
    role: string;
    text: string;
}

export const TestimonialModel = {
    findAll: async (): Promise<Testimonial[]> => {
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM testimonials');
        return rows as Testimonial[];
    }
};
