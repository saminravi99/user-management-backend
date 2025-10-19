import { NextFunction, Request, Response } from 'express';
import { UserRole } from '../interfaces/user.interface';
import * as tokenService from '../services/token.service';

export interface AuthRequest extends Request {
    user?: {
        userId: string;
        email: string;
        role: UserRole;
    };
}

export const authenticate = (req: Request, _res: Response, next: NextFunction) => {
    try {
        let token: string | undefined;

        // First, try to get token from Authorization header
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        }

        // If no token in header, try to get from cookies
        if (!token && req.cookies && req.cookies.accessToken) {
            token = req.cookies.accessToken;
        }

        // If still no token, throw error
        if (!token) {
            const error: any = new Error('No token provided');
            error.statusCode = 401;
            throw error;
        }

        const decoded = tokenService.verifyAccessToken(token);

        (req as AuthRequest).user = decoded;

        next();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
        const err: any = new Error('Invalid or expired token');
        err.statusCode = 401;
        next(err);
    }
};

// Middleware to check if user is admin or superadmin
export const requireAdmin = (req: Request, _res: Response, next: NextFunction) => {
    const authReq = req as AuthRequest;

    if (!authReq.user) {
        const error: any = new Error('Authentication required');
        error.statusCode = 401;
        return next(error);
    }

    if (authReq.user.role !== 'admin' && authReq.user.role !== 'superadmin') {
        const error: any = new Error('Admin access required');
        error.statusCode = 403;
        return next(error);
    }

    next();
};

// Middleware to check if user is superadmin
export const requireSuperAdmin = (req: Request, _res: Response, next: NextFunction) => {
    const authReq = req as AuthRequest;

    if (!authReq.user) {
        const error: any = new Error('Authentication required');
        error.statusCode = 401;
        return next(error);
    }

    if (authReq.user.role !== 'superadmin') {
        const error: any = new Error('Super admin access required');
        error.statusCode = 403;
        return next(error);
    }

    next();
};
