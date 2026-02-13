import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel, User } from '../models/User';

const generateToken = (id: number, role: string) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET || 'secret123', {
        expiresIn: '30d',
    });
};

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendVerificationEmail = async (email: string, otp: string) => {
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

    await transporter.sendMail(mailOptions);
};

export const registerUser = async (req: Request, res: Response) => {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Please add all fields' });
    }

    try {
        const userExists = await UserModel.findByEmail(email);
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate 6 digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        const newUser: User = {
            username,
            email,
            password: hashedPassword,
            role: 'user',
            is_verified: false,
            verification_code: otp
        };

        const id = await UserModel.create(newUser);

        // Send OTP Email
        await sendVerificationEmail(email, otp);

        res.status(201).json({
            message: 'Registration successful. Please verify your email.',
            email
        });
    } catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({ message: 'Server error', error });
    }
};

export const verifyEmail = async (req: Request, res: Response) => {
    const { email, otp } = req.body;

    try {
        const user = await UserModel.findByEmail(email);
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
        await UserModel.verifyUser(email);

        res.json({
            message: 'Email verified successfully. You can now login.',
            token: generateToken(user.id!, user.role)
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const loginUser = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        const user = await UserModel.findByEmail(email);

        if (user && user.password && (await bcrypt.compare(password, user.password))) {
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
                token: generateToken(user.id!, user.role)
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const getMe = async (req: any, res: Response) => {
    try {
        const user = await UserModel.findById(req.user.id);
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
