import nodemailer, { Transporter } from 'nodemailer';
import { config } from '../config';

let transporter: Transporter;

const createTransporter = () => {
    if (!transporter) {
        transporter = nodemailer.createTransport({
            host: config.smtp.host,
            port: config.smtp.port,
            secure: false,
            auth: {
                user: config.smtp.user,
                pass: config.smtp.password,
            },
        });
    }
    return transporter;
};

export const sendOtpEmail = async (email: string, otp: string): Promise<void> => {
    const transporter = createTransporter();

    await transporter.sendMail({
        from: config.smtp.user,
        to: email,
        subject: 'Email Verification - OTP',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>Email Verification</h2>
                <p>Your OTP for email verification is:</p>
                <h1 style="color: #4CAF50; letter-spacing: 5px;">${otp}</h1>
                <p>This OTP will expire in ${config.otp.expiry / 60} minutes.</p>
                <p>If you didn't request this, please ignore this email.</p>
            </div>
        `,
    });
};

export const sendWelcomeEmail = async (email: string, name: string): Promise<void> => {
    const transporter = createTransporter();

    await transporter.sendMail({
        from: config.smtp.user,
        to: email,
        subject: 'Welcome to User Management',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>Welcome ${name}!</h2>
                <p>Your account has been successfully verified.</p>
                <p>Thank you for joining us.</p>
            </div>
        `,
    });
};
