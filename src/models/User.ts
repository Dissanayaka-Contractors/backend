import pool from '../config/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface User {
    id?: number;
    username: string;
    email: string;
    password?: string;
    role: 'admin' | 'user';
    created_at?: Date;
}

export const UserModel = {
    findByEmail: async (email: string): Promise<User | null> => {
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM users WHERE email = ?', [email]);
        return rows.length > 0 ? (rows[0] as User) : null;
    },

    create: async (user: User): Promise<number> => {
        const [result] = await pool.query<ResultSetHeader>(
            'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
            [user.username, user.email, user.password, user.role || 'user']
        );
        return result.insertId;
    },

    findById: async (id: number): Promise<User | null> => {
        const [rows] = await pool.query<RowDataPacket[]>('SELECT id, username, email, role, created_at FROM users WHERE id = ?', [id]);
        return rows.length > 0 ? (rows[0] as User) : null;
    }
};
