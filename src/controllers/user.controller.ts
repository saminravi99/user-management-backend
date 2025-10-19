import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as emailService from '../services/email.service';
import * as otpService from '../services/otp.service';
import * as userService from '../services/user.service';
import { asyncHandler } from '../utils/catchAsync';

export const getAllUsers = asyncHandler(async (_req: Request, res: Response) => {
    const users = await userService.getAllUsers();
    res.status(200).json({
        success: true,
        data: users,
    });
});

export const getUserById = asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.getUserById(req.params.id);
    res.status(200).json({
        success: true,
        data: user,
    });
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.updateUser(req.params.id, req.body);
    res.status(200).json({
        success: true,
        message: 'User updated successfully',
        data: user,
    });
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
    await userService.deleteUser(req.params.id);
    res.status(200).json({
        success: true,
        message: 'User deleted successfully',
    });
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const userId = authReq.user!.userId;

    const user = await userService.updateOwnProfile(userId, req.body);

    res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: user,
    });
});

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const userId = authReq.user!.userId;

    const user = await userService.getUserById(userId);

    res.status(200).json({
        success: true,
        data: user,
    });
});

export const requestEmailChange = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const userId = authReq.user!.userId;
    const { newEmail } = req.body;

    await userService.requestEmailChange(userId, newEmail);

    const otp = await otpService.generateAndStoreOtp(newEmail);
    await emailService.sendOtpEmail(newEmail, otp);

    res.status(200).json({
        success: true,
        message: 'OTP sent to new email address. Please verify to complete email change.',
    });
});

export const verifyEmailChange = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const userId = authReq.user!.userId;
    const { newEmail, otp } = req.body;

    const isValid = await otpService.verifyOtp(newEmail, otp);
    if (!isValid) {
        const error: any = new Error('Invalid or expired OTP');
        error.statusCode = 400;
        throw error;
    }

    const user = await userService.verifyEmailChange(userId, newEmail);

    res.status(200).json({
        success: true,
        message: 'Email changed successfully',
        data: user,
    });
});

export const changeUserRole = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const requesterId = authReq.user!.userId;
    const requesterRole = authReq.user!.role;
    const targetUserId = req.params.id;
    const { role: newRole } = req.body;

    const user = await userService.changeUserRole(
        requesterId,
        requesterRole,
        targetUserId,
        newRole,
    );

    res.status(200).json({
        success: true,
        message: 'User role changed successfully',
        data: user,
    });
});
