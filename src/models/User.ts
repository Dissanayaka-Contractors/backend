import pool from '../config/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface User {
    id?: number;
    username: string;
    email: string;
    password?: string;
    role: 'admin' | 'user';
    created_at?: Date;
    is_verified?: boolean;
    verification_code?: string;
}

export const UserModel = {
    findByEmail: async (email: string): Promise<User | null> => {
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM users WHERE email = ?', [email]);
        return rows.length > 0 ? (rows[0] as User) : null;
    },

    create: async (user: User): Promise<number> => {
        const [result] = await pool.query<ResultSetHeader>(
            'INSERT INTO users (username, email, password, role, is_verified, verification_code) VALUES (?, ?, ?, ?, ?, ?)',
            [user.username, user.email, user.password, user.role || 'user', user.is_verified || false, user.verification_code]
        );
        return result.insertId;
    },

    findById: async (id: number): Promise<User | null> => {
        const [rows] = await pool.query<RowDataPacket[]>('SELECT id, username, email, role, created_at, is_verified FROM users WHERE id = ?', [id]);
        return rows.length > 0 ? (rows[0] as User) : null;
    },

    verifyUser: async (email: string): Promise<boolean> => {
        const [result] = await pool.query<ResultSetHeader>('UPDATE users SET is_verified = TRUE, verification_code = NULL WHERE email = ?', [email]);
        return result.affectedRows > 0;
    }
};
