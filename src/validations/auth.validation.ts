import { z } from 'zod';

export const signupSchema = z.object({
    body: z.object({
        name: z.string().min(2, 'Name must be at least 2 characters'),
        email: z.string().email('Invalid email address'),
        password: z.string().min(8, 'Password must be at least 8 characters'),
        contactNumber: z
            .string()
            .min(10, 'Contact number must be at least 10 digits')
            .max(15, 'Contact number must not exceed 15 digits'),
        // role is NOT accepted from body - always set to 'user' in service
    }),
});

export const verifyOtpSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email address'),
        otp: z.string().length(6, 'OTP must be 6 digits'),
    }),
});

export const loginSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email address'),
        password: z.string().min(1, 'Password is required'),
    }),
});

export const refreshTokenSchema = z.object({
    body: z.object({
        refreshToken: z.string().min(1, 'Refresh token is required'),
    }),
});

export const resendOtpSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email address'),
    }),
});
