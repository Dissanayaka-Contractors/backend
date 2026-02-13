import pool from '../config/db';

const checkSchema = async () => {
    try {
        console.log('Checking jobs table columns...');
        const [rows] = await pool.query('SHOW COLUMNS FROM jobs');
        console.log(rows);
        process.exit(0);
    } catch (error) {
        console.error('Error checking schema:', error);
        process.exit(1);
    }
};

checkSchema();
