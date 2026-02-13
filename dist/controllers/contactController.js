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
exports.submitContact = void 0;
const Contact_1 = require("../models/Contact");
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});
const submitContact = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const contactData = req.body;
        if (!contactData.email || !contactData.message) {
            return res.status(400).json({ message: 'Email and Message are required' });
        }
        // 1. Save to Database
        const id = yield Contact_1.ContactModel.create(contactData);
        // 2. Send Email Notification
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: process.env.EMAIL_USER, // Send to self (Admin)
                replyTo: contactData.email,
                subject: `New Contact Form Submission: ${contactData.subject}`,
                text: `
You have received a new message from your website contact form.

Name: ${contactData.firstName} ${contactData.lastName}
Email: ${contactData.email}
Subject: ${contactData.subject}

Message:
${contactData.message}
                `,
                html: `
<h3>New Contact Form Submission</h3>
<p><strong>Name:</strong> ${contactData.firstName} ${contactData.lastName}</p>
<p><strong>Email:</strong> ${contactData.email}</p>
<p><strong>Subject:</strong> ${contactData.subject}</p>
<br>
<p><strong>Message:</strong></p>
<p>${contactData.message.replace(/\n/g, '<br>')}</p>
                `
            };
            yield transporter.sendMail(mailOptions);
            console.log('Email notification sent successfully');
        }
        else {
            console.warn('Skipping email notification: EMAIL_USER or EMAIL_PASS not set.');
        }
        res.status(201).json({ message: 'Message sent successfully', id });
    }
    catch (error) {
        console.error('Error in submitContact:', error);
        res.status(500).json({ message: 'Error processing request', error });
    }
});
exports.submitContact = submitContact;
