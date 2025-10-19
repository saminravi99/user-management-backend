import logger from '../utils/logger';
import { config } from './index';

export const validateEnvironment = (): void => {
    const requiredEnvVars = [
        'MONGODB_URI',
        'JWT_ACCESS_SECRET',
        'JWT_REFRESH_SECRET',
        'SMTP_HOST',
        'SMTP_USER',
        'SMTP_PASSWORD',
    ];

    const missingVars: string[] = [];

    requiredEnvVars.forEach((varName) => {
        if (!process.env[varName]) {
            missingVars.push(varName);
        }
    });

    if (missingVars.length > 0) {
        logger.error('❌ Missing required environment variables:');
        missingVars.forEach((varName) => {
            logger.error(`   - ${varName}`);
        });
        throw new Error('Missing required environment variables');
    }

    logger.info('✅ Environment variables validated successfully');
    logger.info(`📝 Running in ${config.env} mode on port ${config.port}`);
};
