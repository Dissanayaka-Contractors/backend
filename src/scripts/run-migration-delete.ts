import fs from 'fs';
import path from 'path';
import pool from '../config/db';

const migrate = async () => {
    try {
        const sqlPath = path.join(__dirname, '../../migrations/add_is_deleted.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        const queries = sql.split(';').filter(q => q.trim().length > 0);

        const connection = await pool.getConnection();
        console.log("Connected to database. Running migration...");

        for (const query of queries) {
            try {
                await connection.query(query);
                console.log(`Executed: ${query.trim()}`);
            } catch (err: any) {
                if (err.code === 'ER_DUP_FIELDNAME') {
                    console.log("Column already exists, skipping.");
                } else {
                    console.error("Error executing query:", err);
                }
            }
        }

        connection.release();
        console.log("Migration complete.");
        process.exit(0);

    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
};

migrate();
