import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

interface EmailOptions {
    to: string;
    subject: string;
    text: string;
    html?: string;
    replyTo?: string;
}

const createTransporter = () => {
    // Check if SMTP settings are provided, otherwise fallback to Gmail (legacy support/dev)
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        console.log('Configuring SMTP Transporter:', {
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            user: process.env.SMTP_USER,
            secure: process.env.SMTP_SECURE,
            passLength: process.env.SMTP_PASS ? process.env.SMTP_PASS.length : 0
        });

        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS.replace(/\s+/g, ''), // Remove spaces if present
            },
        });
    } else {
        // Fallback to existing GMAIL settings if SMTP not set (backward compatibility)
        console.warn('Using legacy Gmail SMTP settings. Please migrate to a transactional email provider.');
        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/\s+/g, '') : '', // Remove spaces
            },
        });
    }
};

const transporter = createTransporter();

export const sendEmail = async (options: EmailOptions): Promise<void> => {
    const from = process.env.SMTP_FROM || process.env.EMAIL_USER; // Use specific sender or fallback

    if (!from) {
        throw new Error('No sender email address configured (SMTP_FROM or EMAIL_USER)');
    }

    const mailOptions = {
        from: from, // Sender address
        to: options.to,
        replyTo: options.replyTo,
        subject: options.subject,
        text: options.text,
        html: options.html,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to ${options.to}`);
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};
