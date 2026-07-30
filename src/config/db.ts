import { MongoClient, Db } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const client = new MongoClient(uri);

let db: Db;

export const connectDB = async () => {
  if (!db) {
    await client.connect();
    db = client.db(process.env.MONGODB_DB_NAME || 'dissanayaka_contractors');
    console.log('Connected to MongoDB');
  }
  return db;
};

export const getDB = () => {
    if (!db) {
        throw new Error('Database not initialized. Call connectDB first.');
    }
    return db;
};

export const getNextSequenceValue = async (sequenceName: string): Promise<number> => {
    const db = getDB();
    const sequenceDocument = await db.collection<{_id: string, sequence_value: number}>('counters').findOneAndUpdate(
        { _id: sequenceName },
        { $inc: { sequence_value: 1 } },
        { returnDocument: 'after', upsert: true }
    );
    return sequenceDocument?.sequence_value || 1;
};
