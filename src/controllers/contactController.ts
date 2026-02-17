import { Request, Response } from 'express';
import { ContactModel, Contact } from '../models/Contact';
import { sendEmail } from '../utils/emailService';

export const submitContact = async (req: Request, res: Response) => {
    try {
        const contactData: Contact = req.body;
        if (!contactData.email || !contactData.message) {
            return res.status(400).json({ message: 'Email and Message are required' });
        }

        // 1. Save to Database
        const id = await ContactModel.create(contactData);

        // 2. Send Email Notification
        const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;

        if (adminEmail) {
            const emailOptions = {
                to: adminEmail, // Send to Admin
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

            await sendEmail(emailOptions);
            console.log('Email notification sent successfully');
        } else {
            console.warn('Skipping email notification: ADMIN_EMAIL or EMAIL_USER not set.');
        }

        res.status(201).json({ message: 'Message sent successfully', id });
    } catch (error) {
        console.error('Error in submitContact:', error);
        res.status(500).json({ message: 'Error processing request', error });
    }
};
