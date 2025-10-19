import { z } from 'zod';

export const createUserSchema = z.object({
    body: z.object({
        name: z.string().min(2, 'Name must be at least 2 characters'),
        email: z.string().email('Invalid email address'),
        password: z.string().min(8, 'Password must be at least 8 characters'),
        contactNumber: z
            .string()
            .min(10, 'Contact number must be at least 11 digits')
            .max(15, 'Contact number must not exceed 13 digits'),
    }),
});

export const updateUserSchema = z.object({
    params: z.object({
        id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID'),
    }),
    body: z.object({
        name: z.string().min(2, 'Name must be at least 2 characters').optional(),
        contactNumber: z
            .string()
            .min(10, 'Contact number must be at least 10 digits')
            .max(15, 'Contact number must not exceed 15 digits')
            .optional(),
    }),
});

export const getUserByIdSchema = z.object({
    params: z.object({
        id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID'),
    }),
});

export const deleteUserSchema = z.object({
    params: z.object({
        id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID'),
    }),
});

// Schema for updating own profile (name, password, contactNumber)
export const updateProfileSchema = z.object({
    body: z.object({
        name: z.string().min(2, 'Name must be at least 2 characters').optional(),
        password: z.string().min(8, 'Password must be at least 8 characters').optional(),
        contactNumber: z
            .string()
            .min(10, 'Contact number must be at least 10 digits')
            .max(15, 'Contact number must not exceed 15 digits')
            .optional(),
    }),
});

// Schema for requesting email change (requires OTP verification)
export const requestEmailChangeSchema = z.object({
    body: z.object({
        newEmail: z.string().email('Invalid email address'),
    }),
});

// Schema for verifying email change with OTP
export const verifyEmailChangeSchema = z.object({
    body: z.object({
        newEmail: z.string().email('Invalid email address'),
        otp: z.string().length(6, 'OTP must be 6 digits'),
    }),
});

// Schema for admin/superadmin to change user role
export const changeUserRoleSchema = z.object({
    params: z.object({
        id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID'),
    }),
    body: z.object({
        role: z.enum(['user', 'admin', 'superadmin']),
    }),
});
