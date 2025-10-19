import { createClient } from 'redis';
import logger from '../utils/logger';
import { config } from './index';

const redisClient = createClient({
    socket: {
        host: config.redis.host,
        port: config.redis.port,
    },
    password: config.redis.password,
});

redisClient.on('error', (error) => {
    logger.error('Redis error:', error);
});

redisClient.on('connect', () => {
    logger.info('Redis connected successfully');
});

export const connectRedis = async (): Promise<void> => {
    try {
        await redisClient.connect();
    } catch (error) {
        logger.error('Redis connection error:', error);
        process.exit(1);
    }
};

export default redisClient;
