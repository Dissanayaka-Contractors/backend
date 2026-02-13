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
exports.getMe = exports.loginUser = exports.verifyEmail = exports.registerUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const generateToken = (id, role) => {
    return jsonwebtoken_1.default.sign({ id, role }, process.env.JWT_SECRET || 'secret123', {
        expiresIn: '30d',
    });
};
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
const sendVerificationEmail = (email, otp) => __awaiter(void 0, void 0, void 0, function* () {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn('Skipping email verification: EMAIL_USER or EMAIL_PASS not set.');
        return;
    }
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Verify Your Email - Dissanayaka Contractors',
        text: `Your verification code is: ${otp}`,
        html: `<h3>Email Verification</h3><p>Your verification code is: <strong>${otp}</strong></p>`
    };
    yield transporter.sendMail(mailOptions);
});
const registerUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, email, password, role } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Please add all fields' });
    }
    try {
        const userExists = yield User_1.UserModel.findByEmail(email);
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const salt = yield bcryptjs_1.default.genSalt(10);
        const hashedPassword = yield bcryptjs_1.default.hash(password, salt);
        // Generate 6 digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const newUser = {
            username,
            email,
            password: hashedPassword,
            role: 'user',
            is_verified: false,
            verification_code: otp
        };
        const id = yield User_1.UserModel.create(newUser);
        // Send OTP Email
        yield sendVerificationEmail(email, otp);
        res.status(201).json({
            message: 'Registration successful. Please verify your email.',
            email
        });
    }
    catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({ message: 'Server error', error });
    }
});
exports.registerUser = registerUser;
const verifyEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, otp } = req.body;
    try {
        const user = yield User_1.UserModel.findByEmail(email);
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }
        if (user.is_verified) {
            return res.status(400).json({ message: 'User already verified' });
        }
        if (user.verification_code !== otp) {
            return res.status(400).json({ message: 'Invalid verification code' });
        }
        // Verify user
        yield User_1.UserModel.verifyUser(email);
        res.json({
            message: 'Email verified successfully. You can now login.',
            token: generateToken(user.id, user.role)
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
exports.verifyEmail = verifyEmail;
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const user = yield User_1.UserModel.findByEmail(email);
        if (user && user.password && (yield bcryptjs_1.default.compare(password, user.password))) {
            if (!user.is_verified) {
                return res.status(401).json({
                    message: 'Email not verified',
                    needVerification: true,
                    email: user.email
                });
            }
            res.json({
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                token: generateToken(user.id, user.role)
            });
        }
        else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
exports.loginUser = loginUser;
const getMe = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User_1.UserModel.findById(req.user.id);
        if (user) {
            res.json(user);
        }
        else {
            res.status(404).json({ message: 'User not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getMe = getMe;
