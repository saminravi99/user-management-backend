import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { validateRequest } from '../middleware/validateRequest';
import {
    loginSchema,
    refreshTokenSchema,
    resendOtpSchema,
    signupSchema,
    verifyOtpSchema,
} from '../validations/auth.validation';

const router = Router();

router.post('/signup', validateRequest(signupSchema), authController.signup);
router.post('/verify-otp', validateRequest(verifyOtpSchema), authController.verifyOtp);
router.post('/login', validateRequest(loginSchema), authController.login);
router.post('/refresh-token', validateRequest(refreshTokenSchema), authController.refreshToken);
router.post('/resend-otp', validateRequest(resendOtpSchema), authController.resendOtp);
router.post('/logout', authController.logout);

export default router;
