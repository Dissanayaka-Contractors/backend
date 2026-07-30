"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
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
        return nodemailer_1.default.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS.replace(/\s+/g, ''), // Remove spaces if present
            },
        });
    }
    else {
        // Fallback to existing GMAIL settings if SMTP not set (backward compatibility)
        console.warn('Using legacy Gmail SMTP settings. Please migrate to a transactional email provider.');
        return nodemailer_1.default.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/\s+/g, '') : '', // Remove spaces
            },
        });
    }
};
const transporter = createTransporter();
const sendEmail = (options) => __awaiter(void 0, void 0, void 0, function* () {
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
        yield transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to ${options.to}`);
    }
    catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
});
exports.sendEmail = sendEmail;
