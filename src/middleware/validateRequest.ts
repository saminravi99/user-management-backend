import { NextFunction, Request, Response } from 'express';
import { ZodSchema } from 'zod';

export const validateRequest =
    (schema: ZodSchema) => (req: Request, _res: Response, next: NextFunction) => {
        try {
            schema.parse({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            next();
        } catch (error) {
            next(error);
        }
    };
