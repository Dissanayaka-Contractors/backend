import pool from '../config/db';
import { ResultSetHeader } from 'mysql2';

export interface Contact {
    id?: number;
    firstName: string;
    lastName: string;
    email: string;
    subject: string;
    message: string;
}

export const ContactModel = {
    create: async (contact: Contact): Promise<number> => {
        const [result] = await pool.query<ResultSetHeader>(
            'INSERT INTO contacts (first_name, last_name, email, subject, message) VALUES (?, ?, ?, ?, ?)',
            [contact.firstName, contact.lastName, contact.email, contact.subject, contact.message]
        );
        return result.insertId;
    }
};
