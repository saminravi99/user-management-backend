import mongoose from 'mongoose';
import logger from '../utils/logger';
import { config } from './index';

export const connectDatabase = async (): Promise<void> => {
    try {
        await mongoose.connect(config.mongodb.uri);
        logger.info('MongoDB connected successfully');
    } catch (error) {
        logger.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
});

mongoose.connection.on('error', (error) => {
    logger.error('MongoDB error:', error);
});

process.on('SIGINT', async () => {
    await mongoose.connection.close();
    process.exit(0);
});
