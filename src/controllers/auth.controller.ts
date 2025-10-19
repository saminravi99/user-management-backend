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

    // Set tokens in HTTP-only cookies
    const cookieOptions = {
        httpOnly: true, // Prevents JavaScript access
        secure: false, // Set to false for HTTP, true for HTTPS
        sameSite: 'lax' as const, // 'lax' works for same-site requests over HTTP
        path: '/',
    };

    res.cookie('accessToken', result.accessToken, {
        ...cookieOptions,
        maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.cookie('refreshToken', result.refreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
        success: true,
        ...result,
    });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const result = await authService.login(email, password);

    // Set tokens in HTTP-only cookies
    // For production with HTTPS, set secure: true and sameSite: 'none'
    const cookieOptions = {
        httpOnly: true, // Prevents JavaScript access
        secure: false, // Set to false for HTTP, true for HTTPS
        sameSite: 'lax' as const, // 'lax' works for same-site requests over HTTP
        path: '/',
    };

    res.cookie('accessToken', result.accessToken, {
        ...cookieOptions,
        maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.cookie('refreshToken', result.refreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
        success: true,
        ...result,
    });
});

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
    // Get refresh token from body or cookie
    const refreshToken = req.body.refreshToken || req.cookies.refreshToken;

    if (!refreshToken) {
        const error: any = new Error('Refresh token is required');
        error.statusCode = 400;
        throw error;
    }

    const result = await authService.refreshToken(refreshToken);

    // Set new tokens in HTTP-only cookies
    const cookieOptions = {
        httpOnly: true,
        secure: false, // Set to false for HTTP, true for HTTPS
        sameSite: 'lax' as const,
        path: '/',
    };

    res.cookie('accessToken', result.accessToken, {
        ...cookieOptions,
        maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.cookie('refreshToken', result.refreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
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
    // Clear authentication cookies
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
