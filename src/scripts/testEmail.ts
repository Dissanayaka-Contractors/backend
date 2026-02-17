import { sendEmail } from '../utils/emailService';
import dotenv from 'dotenv';
dotenv.config();

// To run: npx ts-node src/scripts/testEmail.ts [recipient@example.com]

const run = async () => {
    const args = process.argv.slice(2);
    const recipient = args[0] || process.env.ADMIN_EMAIL || process.env.EMAIL_USER;

    if (!recipient) {
        console.error('Please provide a recipient email as an argument or set ADMIN_EMAIL/EMAIL_USER in .env');
        console.log('Usage: npx ts-node src/scripts/testEmail.ts <email@example.com>');
        process.exit(1);
    }

    console.log(`Sending test email to: ${recipient}`);

    try {
        await sendEmail({
            to: recipient,
            subject: 'Test Email from Dissanayaka Contractors System',
            text: 'This is a test email to verify the new email service configuration.',
            html: '<h3>Email Service Test</h3><p>This is a test email to verify the new email service configuration.</p>'
        });
        console.log('Test email sent successfully!');
    } catch (error) {
        console.error('Failed to send test email. Check your .env configuration.');
        console.error(error);
    }
};

run();
