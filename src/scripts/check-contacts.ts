import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const run = async () => {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: Number(process.env.DB_PORT) || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME || 'dissanayaka_contractors'
        });

        console.log(`Connected to database: ${process.env.DB_NAME}`);

        const [rows] = await connection.query("SHOW TABLES LIKE 'contacts'");
        console.log('Tables found:', rows);

        if ((rows as any[]).length > 0) {
            console.log('Contacts table exists. Checking columns...');
            const [columns] = await connection.query("DESCRIBE contacts");
            console.log(columns);
        } else {
            console.log('Contacts table DOES NOT EXIST.');
        }

        await connection.end();
    } catch (error) {
        console.error('Error:', error);
    }
};

run();
