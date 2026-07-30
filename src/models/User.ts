import { getDB, getNextSequenceValue } from '../config/db';

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
        const db = getDB();
        const user = await db.collection('users').findOne({ email });
        return user as User | null;
    },

    create: async (user: User): Promise<number> => {
        const db = getDB();
        const id = await getNextSequenceValue('userId');
        const newUser = {
            ...user,
            id,
            role: user.role || 'user',
            is_verified: user.is_verified || false,
            created_at: new Date()
        };
        await db.collection('users').insertOne(newUser);
        return id;
    },

    findById: async (id: number): Promise<User | null> => {
        const db = getDB();
        const user = await db.collection('users').findOne(
            { id },
            { projection: { id: 1, username: 1, email: 1, role: 1, created_at: 1, is_verified: 1 } }
        );
        return user as User | null;
    },

    verifyUser: async (email: string): Promise<boolean> => {
        const db = getDB();
        const result = await db.collection('users').updateOne(
            { email },
            { $set: { is_verified: true, verification_code: null } }
        );
        return result.modifiedCount > 0;
    }
};
