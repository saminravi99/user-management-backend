import { createApp } from './app';
import { config } from './config';
import { connectDatabase } from './config/database';
import { connectRedis } from './config/redis';
import { seedSuperAdmin } from './config/seedSuperAdmin';
import { validateEnvironment } from './config/validateEnv';
import logger from './utils/logger';

const startServer = async () => {
    try {
        validateEnvironment();

        await connectDatabase();
        await connectRedis();

        await seedSuperAdmin();

        const app = createApp();

        const server = app.listen(config.port, () => {
            logger.info(`Server running in ${config.env} mode on port ${config.port}`);
        });

        const gracefulShutdown = async (signal: string) => {
            logger.info(`${signal} received, closing server gracefully`);
            server.close(() => {
                logger.info('Server closed');
                process.exit(0);
            });

            setTimeout(() => {
                logger.error('Forcing shutdown');
                process.exit(1);
            }, 10000);
        };

        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));

        process.on('unhandledRejection', (reason: Error) => {
            logger.error('Unhandled Rejection:', reason);
            gracefulShutdown('unhandledRejection');
        });

        process.on('uncaughtException', (error: Error) => {
            logger.error('Uncaught Exception:', error);
            gracefulShutdown('uncaughtException');
        });
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
