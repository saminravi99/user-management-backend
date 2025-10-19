import winston from 'winston';
import { config } from '../config';

const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json(),
);

const logger = winston.createLogger({
    level: config.env === 'development' ? 'debug' : 'info',
    format: logFormat,
    defaultMeta: { service: 'user-management-backend' },
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
        }),
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' }),
    ],
});

if (config.env === 'test') {
    logger.transports.forEach((transport) => (transport.silent = true));
}

export default logger;
