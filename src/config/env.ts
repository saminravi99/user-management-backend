import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

interface Env {
    NODE_ENV: string;
    PORT: string;
    MONGODB_URI: string;
    MONGODB_TEST_URI?: string;
    REDIS_HOST: string;
    REDIS_PORT: string;
    REDIS_PASSWORD?: string;
    JWT_ACCESS_SECRET: string;
    JWT_REFRESH_SECRET: string;
    JWT_ACCESS_EXPIRY: string;
    JWT_REFRESH_EXPIRY: string;
    SMTP_HOST: string;
    SMTP_PORT: string;
    SMTP_USER: string;
    SMTP_PASSWORD: string;
    OTP_EXPIRY: string;
    OTP_LENGTH: string;
    FRONTEND_URL: string;
    RATE_LIMIT_WINDOW: string;
    RATE_LIMIT_MAX_REQUESTS: string;
    SUPERADMIN_NAME?: string;
    SUPERADMIN_EMAIL?: string;
    SUPERADMIN_PASSWORD?: string;
    SUPERADMIN_CONTACT?: string;
}

export const env: Env = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: process.env.PORT || '5000',
    MONGODB_URI: process.env.MONGODB_URI || '',
    MONGODB_TEST_URI: process.env.MONGODB_TEST_URI,
    REDIS_HOST: process.env.REDIS_HOST || 'localhost',
    REDIS_PORT: process.env.REDIS_PORT || '6379',
    REDIS_PASSWORD: process.env.REDIS_PASSWORD,
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || '',
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || '',
    JWT_ACCESS_EXPIRY: process.env.JWT_ACCESS_EXPIRY || '15m',
    JWT_REFRESH_EXPIRY: process.env.JWT_REFRESH_EXPIRY || '7d',
    SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
    SMTP_PORT: process.env.SMTP_PORT || '587',
    SMTP_USER: process.env.SMTP_USER || '',
    SMTP_PASSWORD: process.env.SMTP_PASSWORD || '',
    OTP_EXPIRY: process.env.OTP_EXPIRY || '300',
    OTP_LENGTH: process.env.OTP_LENGTH || '6',
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
    RATE_LIMIT_WINDOW: process.env.RATE_LIMIT_WINDOW || '15',
    RATE_LIMIT_MAX_REQUESTS: process.env.RATE_LIMIT_MAX_REQUESTS || '100',
    SUPERADMIN_NAME: process.env.SUPERADMIN_NAME,
    SUPERADMIN_EMAIL: process.env.SUPERADMIN_EMAIL,
    SUPERADMIN_PASSWORD: process.env.SUPERADMIN_PASSWORD,
    SUPERADMIN_CONTACT: process.env.SUPERADMIN_CONTACT,
};
