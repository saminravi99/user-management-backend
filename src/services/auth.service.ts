/* eslint-disable @typescript-eslint/no-explicit-any */
import { CreateUserInput } from '../interfaces/user.interface';
import * as emailService from './email.service';
import * as otpService from './otp.service';
import * as tokenService from './token.service';
import * as userService from './user.service';

export const signup = async (userData: CreateUserInput) => {
    // Force role to 'user' - cannot be set from request body
    const user = await userService.createUser({
        ...userData,
        role: 'user',
    });

    const otp = await otpService.generateAndStoreOtp(user.email);

    await emailService.sendOtpEmail(user.email, otp);

    return {
        message: 'Signup successful. Please verify your email with the OTP sent.',
        userId: user._id,
        email: user.email,
    };
};

export const verifyOtp = async (email: string, otp: string) => {
    const isValid = await otpService.verifyOtp(email, otp);

    if (!isValid) {
        const error: any = new Error('Invalid or expired OTP');
        error.statusCode = 400;
        throw error;
    }

    const user = await userService.getUserByEmail(email);

    if (!user) {
        const error: any = new Error('User not found');
        error.statusCode = 401;
        throw error;
    }

    await userService.verifyUser(user._id.toString());

    await emailService.sendWelcomeEmail(user.email, user.name);

    const tokens = tokenService.generateTokenPair({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
    });

    return {
        message: 'Email verified successfully',
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            contactNumber: user.contactNumber,
            role: user.role,
            isVerified: user.isVerified,
        },
        ...tokens,
    };
};

export const login = async (email: string, password: string) => {
    const user = await userService.getUserByEmail(email);

    if (!user) {
        const error: any = new Error('Invalid email or password');
        error.statusCode = 401;
        throw error;
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
        const error: any = new Error('Invalid email or password');
        error.statusCode = 401;
        throw error;
    }

    if (!user.isVerified) {
        const error: any = new Error('Please verify your email first');
        error.statusCode = 401;
        throw error;
    }

    const tokens = tokenService.generateTokenPair({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
    });

    return {
        message: 'Login successful',
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            contactNumber: user.contactNumber,
            role: user.role,
            isVerified: user.isVerified,
        },
        ...tokens,
    };
};

export const refreshToken = async (refreshToken: string) => {
    try {
        const decoded = tokenService.verifyRefreshToken(refreshToken);

        const user = await userService.getUserByEmail(decoded.email);

        if (!user) {
            const error: any = new Error('User not found');
            error.statusCode = 401;
            throw error;
        }

        const tokens = tokenService.generateTokenPair({
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
        });

        return tokens;
    } catch (error: any) {
        const err: any = new Error(error.message || 'Invalid refresh token');
        err.statusCode = 401;
        throw err;
    }
};

export const resendOtp = async (email: string) => {
    const user = await userService.getUserByEmail(email);

    if (!user) {
        const error: any = new Error('User not found');
        error.statusCode = 401;
        throw error;
    }

    if (user.isVerified) {
        const error: any = new Error('Email already verified');
        error.statusCode = 400;
        throw error;
    }

    const otp = await otpService.generateAndStoreOtp(email);

    await emailService.sendOtpEmail(email, otp);

    return {
        message: 'OTP resent successfully',
    };
};
