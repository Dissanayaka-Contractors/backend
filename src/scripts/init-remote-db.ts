import fs from 'fs';
import path from 'path';
import pool from '../config/db';

const initDB = async () => {
    try {
        const schemaPath = path.join(__dirname, '../../schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        // Remove CREATE DATABASE and USE statements as we are connecting to a specific DB
        const queries = schema
            .replace(/CREATE DATABASE.*;/g, '')
            .replace(/USE.*;/g, '')
            .split(';')
            .map(q => q.trim())
            .filter(q => q.length > 0);

        console.log(`Found ${queries.length} queries to execute.`);

        const connection = await pool.getConnection();
        console.log("Connected to database.");

        for (const query of queries) {
            try {
                await connection.query(query);
                console.log(`Executed: ${query.substring(0, 50)}...`);
            } catch (err: any) {
                // Ignore "Table already exists" or "Duplicate entry" errors if we want idempotency
                if (err.code === 'ER_TABLE_EXISTS_ERROR' || err.code === 'ER_DUP_ENTRY') {
                    console.log(`Skipping (already exists): ${query.substring(0, 30)}...`);
                } else {
                    console.error(`Error executing query: ${query.substring(0, 50)}...`, err);
                }
            }
        }

        connection.release();
        console.log('Database initialized successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Failed to initialize database:', error);
        process.exit(1);
    }
};

initDB();
