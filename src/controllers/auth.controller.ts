import { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import { asyncHandler } from '../utils/catchAsync';

export const signup = asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.signup(req.body);
    res.status(201).json({
        success: true,
        ...result,
    });
});

export const verifyOtp = asyncHandler(async (req: Request, res: Response) => {
    const { email, otp } = req.body;
    const result = await authService.verifyOtp(email, otp);

    const cookieOptions = {
        httpOnly: true,
        secure: false,
        sameSite: 'lax' as const,
        path: '/',
    };

    res.cookie('accessToken', result.accessToken, {
        ...cookieOptions,
        maxAge: 24 * 60 * 60 * 1000,
    });

    res.cookie('refreshToken', result.refreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
        success: true,
        ...result,
    });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const result = await authService.login(email, password);

    const cookieOptions = {
        httpOnly: true,
        secure: false,
        sameSite: 'lax' as const,
        path: '/',
    };

    res.cookie('accessToken', result.accessToken, {
        ...cookieOptions,
        maxAge: 24 * 60 * 60 * 1000,
    });

    res.cookie('refreshToken', result.refreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
        success: true,
        ...result,
    });
});

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.body.refreshToken || req.cookies.refreshToken;

    if (!refreshToken) {
        const error: any = new Error('Refresh token is required');
        error.statusCode = 400;
        throw error;
    }

    const result = await authService.refreshToken(refreshToken);

    const cookieOptions = {
        httpOnly: true,
        secure: false,
        sameSite: 'lax' as const,
        path: '/',
    };

    res.cookie('accessToken', result.accessToken, {
        ...cookieOptions,
        maxAge: 24 * 60 * 60 * 1000,
    });

    res.cookie('refreshToken', result.refreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
        success: true,
        ...result,
    });
});

export const resendOtp = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    const result = await authService.resendOtp(email);
    res.status(200).json({
        success: true,
        ...result,
    });
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
    const cookieOptions = {
        httpOnly: true,
        secure: false,
        sameSite: 'lax' as const,
        path: '/',
    };

    res.clearCookie('accessToken', cookieOptions);
    res.clearCookie('refreshToken', cookieOptions);

    res.status(200).json({
        success: true,
        message: 'Logout successful',
    });
});
