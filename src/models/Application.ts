import { getDB, getNextSequenceValue } from '../config/db';

export interface Application {
    id?: number;
    job_id: number;
    user_id: number;
    full_name: string;
    email: string;
    phone: string;
    address: string;
    gender: string;
    age: number;
    cv_path?: string; // Optional (filename)
    cv_data?: Buffer; // Binary data
    cv_mimetype?: string; // Mime type
    status: 'pending' | 'reviewed' | 'rejected' | 'accepted';
    applied_at?: Date;
    job_title?: string;
}

export const ApplicationModel = {
    create: async (application: Application): Promise<number> => {
        const db = getDB();
        const id = await getNextSequenceValue('applicationId');
        const newApplication = {
            ...application,
            id,
            applied_at: new Date()
        };
        await db.collection('applications').insertOne(newApplication);
        return id;
    },

    findCVById: async (id: number): Promise<{ cv_data: Buffer, cv_mimetype: string, cv_path: string } | null> => {
        const db = getDB();
        const app = await db.collection('applications').findOne(
            { id },
            { projection: { cv_data: 1, cv_mimetype: 1, cv_path: 1 } }
        );
        if (!app || !app.cv_data) return null;
        return {
            cv_data: app.cv_data.buffer ? Buffer.from(app.cv_data.buffer) : app.cv_data,
            cv_mimetype: app.cv_mimetype,
            cv_path: app.cv_path
        };
    },

    findAll: async (): Promise<Application[]> => {
        const db = getDB();
        // Aggregation to join with jobs
        const apps = await db.collection('applications').aggregate([
            {
                $lookup: {
                    from: 'jobs',
                    localField: 'job_id',
                    foreignField: 'id',
                    as: 'job'
                }
            },
            {
                $unwind: { path: '$job', preserveNullAndEmptyArrays: true }
            },
            {
                $sort: { applied_at: -1 }
            },
            {
                $project: {
                    id: 1, job_id: 1, user_id: 1, full_name: 1, email: 1, phone: 1, address: 1, gender: 1, age: 1, cv_path: 1, status: 1, applied_at: 1,
                    job_title: '$job.title'
                }
            }
        ]).toArray();
        return apps as Application[];
    },

    findByUserId: async (userId: number): Promise<Application[]> => {
        const db = getDB();
        const apps = await db.collection('applications').aggregate([
            { $match: { user_id: userId } },
            {
                $lookup: {
                    from: 'jobs',
                    localField: 'job_id',
                    foreignField: 'id',
                    as: 'job'
                }
            },
            {
                $unwind: { path: '$job', preserveNullAndEmptyArrays: true }
            },
            {
                $sort: { applied_at: -1 }
            },
            {
                $project: {
                    id: 1, job_id: 1, user_id: 1, full_name: 1, email: 1, phone: 1, address: 1, gender: 1, age: 1, cv_path: 1, status: 1, applied_at: 1,
                    job_title: '$job.title'
                }
            }
        ]).toArray();
        return apps as Application[];
    },

    findById: async (id: number): Promise<Application | null> => {
        const db = getDB();
        const apps = await db.collection('applications').aggregate([
            { $match: { id } },
            {
                $lookup: {
                    from: 'jobs',
                    localField: 'job_id',
                    foreignField: 'id',
                    as: 'job'
                }
            },
            {
                $unwind: { path: '$job', preserveNullAndEmptyArrays: true }
            },
            {
                $project: {
                    id: 1, job_id: 1, user_id: 1, full_name: 1, email: 1, phone: 1, address: 1, gender: 1, age: 1, cv_path: 1, status: 1, applied_at: 1,
                    job_title: '$job.title'
                }
            }
        ]).toArray();
        return apps.length > 0 ? apps[0] as Application : null;
    },

    updateStatus: async (id: number, status: string): Promise<boolean> => {
        const db = getDB();
        const result = await db.collection('applications').updateOne(
            { id },
            { $set: { status } }
        );
        return result.modifiedCount > 0;
    },

    delete: async (id: number): Promise<boolean> => {
        const db = getDB();
        const result = await db.collection('applications').deleteOne({ id });
        return result.deletedCount > 0;
    }
};
