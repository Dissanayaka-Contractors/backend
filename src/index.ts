import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './config/db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
import jobRoutes from './routes/jobRoutes';
import testimonialRoutes from './routes/testimonialRoutes';
import contactRoutes from './routes/contactRoutes';
import authRoutes from './routes/authRoutes';
import applicationRoutes from './routes/applicationRoutes';
import path from 'path';

app.use('/api/jobs', jobRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Test Route
app.get('/api/health', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        connection.release();
        res.json({ status: 'ok', database: 'connected' });
    } catch (error) {
        console.error('Database connection failed:', error);
        res.status(500).json({ status: 'error', database: 'disconnected', error: (error as Error).message });
    }
});

// Export the Express API
export default app;

// Only run the server if not in Vercel environment
if (process.env.VERCEL !== '1') {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}
