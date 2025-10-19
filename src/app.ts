import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application } from 'express';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';
import { config } from './config';
import { globalErrorHandler } from './middleware/globalErrorHandler';
import { notFound } from './middleware/notFound';
import routes from './routes';

export const createApp = (): Application => {
    const app = express();

    // Trust proxy - required when behind nginx reverse proxy
    // Trust the first proxy (nginx container)
    app.set('trust proxy', 1);

    app.use(helmet());

    app.use(
        cors({
            origin: config.frontendUrl,
            credentials: true,
        }),
    );

    app.use(express.json({ limit: '10kb' }));
    app.use(express.urlencoded({ extended: true, limit: '10kb' }));
    app.use(cookieParser());

    app.use(mongoSanitize());

    app.use(hpp());

    app.use(compression());

    if (config.env === 'development') {
        app.use(morgan('dev'));
    } else {
        app.use(morgan('combined'));
    }

    const limiter = rateLimit({
        windowMs: config.rateLimit.windowMs,
        max: config.rateLimit.maxRequests,
        message: 'Too many requests from this IP, please try again later.',
        standardHeaders: true,
        legacyHeaders: false,
    });

    app.use('/api', limiter);

    app.get('/health', (_req, res) => {
        res.status(200).json({
            success: true,
            message: 'Server is healthy',
            timestamp: new Date().toISOString(),
        });
    });

    app.use('/api', routes);

    app.use('*', notFound);

    app.use(globalErrorHandler);

    return app;
};
