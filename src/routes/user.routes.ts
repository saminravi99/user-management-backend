import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validateRequest';
import {
    changeUserRoleSchema,
    deleteUserSchema,
    getUserByIdSchema,
    requestEmailChangeSchema,
    updateProfileSchema,
    updateUserSchema,
    verifyEmailChangeSchema,
} from '../validations/user.validation';

const router = Router();

router.use(authenticate);

router.get('/profile/me', userController.getProfile);
router.patch('/profile/me', validateRequest(updateProfileSchema), userController.updateProfile);

router.post(
    '/profile/email/request',
    validateRequest(requestEmailChangeSchema),
    userController.requestEmailChange,
);
router.post(
    '/profile/email/verify',
    validateRequest(verifyEmailChangeSchema),
    userController.verifyEmailChange,
);

router.get('/', requireAdmin, userController.getAllUsers);
router.get('/:id', requireAdmin, validateRequest(getUserByIdSchema), userController.getUserById);
router.patch('/:id', requireAdmin, validateRequest(updateUserSchema), userController.updateUser);
router.delete(
    '/:id',
    requireAdmin,
    validateRequest(deleteUserSchema),
    userController.deleteUser,
);

router.patch(
    '/:id/role',
    requireAdmin,
    validateRequest(changeUserRoleSchema),
    userController.changeUserRole,
);

export default router;
