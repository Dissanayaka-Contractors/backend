import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const run = async () => {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT),
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            multipleStatements: true
        });

        console.log('Connected to database. Running migration...');

        // Check if columns exist first to avoid errors
        try {
            const [rows] = await connection.query("SHOW COLUMNS FROM users LIKE 'is_verified'");
            if ((rows as any[]).length > 0) {
                console.log('Column is_verified already exists. Skipping migration.');
                await connection.end();
                return;
            }
        } catch (e) {
            console.log('Table might not exist or other error, proceeding to try migration');
        }

        const sql = fs.readFileSync(path.join(__dirname, '../../migrations/add_user_verification.sql'), 'utf8');
        await connection.query(sql);

        console.log('Migration completed successfully!');
        await connection.end();
    } catch (error) {
        console.error('Migration failed:', error);
    }
};

run();
