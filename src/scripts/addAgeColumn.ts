import pool from '../config/db';

const migrate = async () => {
    try {
        console.log('Running migration: Add age column to applications table...');
        await pool.query('ALTER TABLE applications ADD COLUMN age INT NOT NULL DEFAULT 18;');
        console.log('Migration successful: age column added.');
    } catch (error: any) {
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('Migration skipped: age column already exists.');
        } else {
            console.error('Migration failed:', error);
        }
    } finally {
        process.exit();
    }
};

migrate();
