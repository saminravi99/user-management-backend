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

// Update own profile (name, password, contactNumber)
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

// Get own profile
export const getProfile = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const userId = authReq.user!.userId;

    const user = await userService.getUserById(userId);

    res.status(200).json({
        success: true,
        data: user,
    });
});

// Request email change (sends OTP to new email)
export const requestEmailChange = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const userId = authReq.user!.userId;
    const { newEmail } = req.body;

    await userService.requestEmailChange(userId, newEmail);

    // Generate and send OTP to new email
    const otp = await otpService.generateAndStoreOtp(newEmail);
    await emailService.sendOtpEmail(newEmail, otp);

    res.status(200).json({
        success: true,
        message: 'OTP sent to new email address. Please verify to complete email change.',
    });
});

// Verify email change with OTP
export const verifyEmailChange = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const userId = authReq.user!.userId;
    const { newEmail, otp } = req.body;

    // Verify OTP
    const isValid = await otpService.verifyOtp(newEmail, otp);
    if (!isValid) {
        const error: any = new Error('Invalid or expired OTP');
        error.statusCode = 400;
        throw error;
    }

    // Update email
    const user = await userService.verifyEmailChange(userId, newEmail);

    res.status(200).json({
        success: true,
        message: 'Email changed successfully',
        data: user,
    });
});

// Admin/SuperAdmin: Change user role
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
