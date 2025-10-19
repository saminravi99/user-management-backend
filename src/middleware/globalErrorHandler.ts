import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { ZodError } from 'zod';
import { config } from '../config';
import { handleMongooseCastError } from '../utils/handleMongooseCastError';
import { handleMongooseDuplicateError } from '../utils/handleMongooseDuplicateError';
import { handleMongooseValidationError } from '../utils/handleMongooseValidationError';
import { handleZodError } from '../utils/handleZodError';
import { sendErrorResponse } from '../utils/sendErrorResponse';

export const globalErrorHandler = (
    err: any,
    _req: Request,
    res: Response,
    _next: NextFunction,
) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal server error';
    let errors = null;

    if (err instanceof mongoose.Error.CastError) {
        const result = handleMongooseCastError(err);
        statusCode = result.statusCode;
        message = result.message;
    }

    if (err.code === 11000) {
        const result = handleMongooseDuplicateError(err);
        statusCode = result.statusCode;
        message = result.message;
    }

    if (err instanceof mongoose.Error.ValidationError) {
        const result = handleMongooseValidationError(err);
        statusCode = result.statusCode;
        message = result.message;
    }

    if (err instanceof ZodError) {
        const result = handleZodError(err);
        statusCode = result.statusCode;
        message = result.message;
        errors = result.errors;
    }

    if (config.env === 'development') {
        console.error('ERROR:', err);
    }

    sendErrorResponse(res, statusCode, message, errors);
};
