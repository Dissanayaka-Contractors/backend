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
const emailService_1 = require("../utils/emailService");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// To run: npx ts-node src/scripts/testEmail.ts [recipient@example.com]
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    const args = process.argv.slice(2);
    const recipient = args[0] || process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
    if (!recipient) {
        console.error('Please provide a recipient email as an argument or set ADMIN_EMAIL/EMAIL_USER in .env');
        console.log('Usage: npx ts-node src/scripts/testEmail.ts <email@example.com>');
        process.exit(1);
    }
    console.log(`Sending test email to: ${recipient}`);
    try {
        yield (0, emailService_1.sendEmail)({
            to: recipient,
            subject: 'Test Email from Dissanayaka Contractors System',
            text: 'This is a test email to verify the new email service configuration.',
            html: '<h3>Email Service Test</h3><p>This is a test email to verify the new email service configuration.</p>'
        });
        console.log('Test email sent successfully!');
    }
    catch (error) {
        console.error('Failed to send test email. Check your .env configuration.');
        console.error(error);
    }
});
run();
