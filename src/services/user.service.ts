import {
    CreateUserInput,
    IUser,
    UpdateProfileInput,
    UpdateUserInput,
    UserRole
} from '../interfaces/user.interface';
import { User } from '../models/user.model';

export const createUser = async (userData: CreateUserInput): Promise<IUser> => {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
        const error: any = new Error('Email already registered');
        error.statusCode = 409;
        throw error;
    }

    const user = new User({
        ...userData,
        isVerified: false,
    });

    await user.save();
    return user;
};

export const getAllUsers = async (): Promise<IUser[]> => {
    return User.find().select('-password');
};

export const getUserById = async (userId: string): Promise<IUser> => {
    const user = await User.findById(userId).select('-password');
    if (!user) {
        const error: any = new Error('User not found');
        error.statusCode = 404;
        throw error;
    }
    return user;
};

export const getUserByEmail = async (email: string): Promise<IUser | null> => {
    return User.findOne({ email }).select('+password');
};

export const updateUser = async (
    userId: string,
    updateData: UpdateUserInput,
): Promise<IUser> => {
    const user = await User.findByIdAndUpdate(userId, updateData, {
        new: true,
        runValidators: true,
    }).select('-password');

    if (!user) {
        const error: any = new Error('User not found');
        error.statusCode = 404;
        throw error;
    }

    return user;
};

export const deleteUser = async (userId: string): Promise<void> => {
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
        const error: any = new Error('User not found');
        error.statusCode = 404;
        throw error;
    }
};

export const verifyUser = async (userId: string): Promise<void> => {
    const user = await User.findByIdAndUpdate(userId, { isVerified: true });
    if (!user) {
        const error: any = new Error('User not found');
        error.statusCode = 404;
        throw error;
    }
};

// Update own profile (name, password, contactNumber)
export const updateOwnProfile = async (
    userId: string,
    updateData: UpdateProfileInput,
): Promise<IUser> => {
    const user = await User.findById(userId);

    if (!user) {
        const error: any = new Error('User not found');
        error.statusCode = 404;
        throw error;
    }

    // Update allowed fields
    if (updateData.name) user.name = updateData.name;
    if (updateData.contactNumber) user.contactNumber = updateData.contactNumber;
    if (updateData.password) user.password = updateData.password; // Will be hashed by pre-save hook

    await user.save();

    // Return user without password
    return User.findById(userId).select('-password') as Promise<IUser>;
};

// Change email with verification
export const requestEmailChange = async (
    userId: string,
    newEmail: string,
): Promise<{ message: string }> => {
    // Check if new email already exists
    const existingUser = await User.findOne({ email: newEmail });
    if (existingUser) {
        const error: any = new Error('Email already in use');
        error.statusCode = 409;
        throw error;
    }

    const user = await User.findById(userId);
    if (!user) {
        const error: any = new Error('User not found');
        error.statusCode = 404;
        throw error;
    }

    return {
        message: 'Email change requested. Please verify OTP sent to new email.',
    };
};

export const verifyEmailChange = async (
    userId: string,
    newEmail: string,
): Promise<IUser> => {
    const user = await User.findById(userId);

    if (!user) {
        const error: any = new Error('User not found');
        error.statusCode = 404;
        throw error;
    }

    // Update email and set as verified
    user.email = newEmail;
    user.isVerified = true;
    await user.save();

    return User.findById(userId).select('-password') as Promise<IUser>;
};

/**
 * Business Logic for Role Changes:
 * 1. Admin can change user -> admin (promotion only)
 * 2. Admin CANNOT change admin -> user (demotion)
 * 3. Admin CANNOT change superadmin role
 * 4. Superadmin can change any role (admin <-> user)
 * 5. Superadmin CANNOT be demoted by anyone (except themselves via direct DB)
 */
export const changeUserRole = async (
    requesterId: string,
    requesterRole: UserRole,
    targetUserId: string,
    newRole: UserRole,
): Promise<IUser> => {
    // Cannot change own role
    if (requesterId === targetUserId) {
        const error: any = new Error('You cannot change your own role');
        error.statusCode = 403;
        throw error;
    }

    const targetUser = await User.findById(targetUserId);

    if (!targetUser) {
        const error: any = new Error('Target user not found');
        error.statusCode = 404;
        throw error;
    }

    const currentRole = targetUser.role;

    // Superadmin can change anyone's role (except their own, checked above)
    if (requesterRole === 'superadmin') {
        // Prevent changing another superadmin's role
        if (currentRole === 'superadmin') {
            const error: any = new Error('Cannot change another superadmin role');
            error.statusCode = 403;
            throw error;
        }

        targetUser.role = newRole;
        await targetUser.save();
        return User.findById(targetUserId).select('-password') as Promise<IUser>;
    }

    // Admin role change logic
    if (requesterRole === 'admin') {
        // Admin can ONLY promote user -> admin
        if (currentRole === 'user' && newRole === 'admin') {
            targetUser.role = newRole;
            await targetUser.save();
            return User.findById(targetUserId).select('-password') as Promise<IUser>;
        }

        // Admin CANNOT demote admin -> user
        if (currentRole === 'admin') {
            const error: any = new Error('Admin cannot change another admin role');
            error.statusCode = 403;
            throw error;
        }

        // Admin CANNOT touch superadmin
        if (currentRole === 'superadmin') {
            const error: any = new Error('Admin cannot change superadmin role');
            error.statusCode = 403;
            throw error;
        }

        // Any other role change not allowed for admin
        const error: any = new Error('Admin can only promote user to admin');
        error.statusCode = 403;
        throw error;
    }

    // If requester is not admin or superadmin, deny
    const error: any = new Error('Insufficient permissions to change user role');
    error.statusCode = 403;
    throw error;
};
