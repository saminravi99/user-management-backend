import { ZodError } from 'zod';

export const handleZodError = (err: ZodError) => {
    const errors = err.errors.map((error) => ({
        path: error.path.join('.'),
        message: error.message,
    }));
    return { message: 'Validation Error', statusCode: 400, errors };
};
