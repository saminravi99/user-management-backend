import { z } from 'zod';
import { env } from './env';

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']),
    PORT: z.string().min(1),
    MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
    MONGODB_TEST_URI: z.string().optional(),
    REDIS_HOST: z.string().min(1),
    REDIS_PORT: z.string().min(1),
    REDIS_PASSWORD: z.string().optional(),
    JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
    JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
    JWT_ACCESS_EXPIRY: z.string().min(1),
    JWT_REFRESH_EXPIRY: z.string().min(1),
    SMTP_HOST: z.string().min(1, 'SMTP_HOST is required'),
    SMTP_PORT: z.string().min(1),
    SMTP_USER: z.string().email('SMTP_USER must be a valid email'),
    SMTP_PASSWORD: z.string().min(1, 'SMTP_PASSWORD is required'),
    OTP_EXPIRY: z.string().min(1),
    OTP_LENGTH: z.string().min(1),
    FRONTEND_URL: z.string().url('FRONTEND_URL must be a valid URL'),
    RATE_LIMIT_WINDOW: z.string().min(1),
    RATE_LIMIT_MAX_REQUESTS: z.string().min(1),
});

const envValidation = envSchema.safeParse(env);

if (!envValidation.success) {
    console.error('❌ Environment validation failed:');
    console.error(envValidation.error.format());
    throw new Error('Invalid environment variables');
}

export const config = {
    env: env.NODE_ENV as 'development' | 'production' | 'test',
    port: parseInt(env.PORT, 10),
    mongodb: {
        uri: env.NODE_ENV === 'test' ? env.MONGODB_TEST_URI || env.MONGODB_URI : env.MONGODB_URI,
    },
    redis: {
        host: env.REDIS_HOST,
        port: parseInt(env.REDIS_PORT, 10),
        password: env.REDIS_PASSWORD || undefined,
    },
    jwt: {
        accessSecret: env.JWT_ACCESS_SECRET,
        refreshSecret: env.JWT_REFRESH_SECRET,
        accessExpiry: env.JWT_ACCESS_EXPIRY,
        refreshExpiry: env.JWT_REFRESH_EXPIRY,
    },
    smtp: {
        host: env.SMTP_HOST,
        port: parseInt(env.SMTP_PORT, 10),
        user: env.SMTP_USER,
        password: env.SMTP_PASSWORD,
    },
    otp: {
        expiry: parseInt(env.OTP_EXPIRY, 10),
        length: parseInt(env.OTP_LENGTH, 10),
    },
    frontendUrl: env.FRONTEND_URL,
    rateLimit: {
        windowMs: parseInt(env.RATE_LIMIT_WINDOW, 10) * 60 * 1000,
        maxRequests: parseInt(env.RATE_LIMIT_MAX_REQUESTS, 10),
    },
    superAdmin: {
        name: env.SUPERADMIN_NAME || 'Super Admin',
        email: env.SUPERADMIN_EMAIL || 'superadmin@example.com',
        password: env.SUPERADMIN_PASSWORD || 'SuperAdmin@123',
        contactNumber: env.SUPERADMIN_CONTACT || '1234567890',
    },
};
