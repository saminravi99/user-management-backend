import { Document, Types } from 'mongoose';

export type UserRole = 'user' | 'admin' | 'superadmin';

export interface IUser extends Document {
    _id: Types.ObjectId;
    name: string;
    email: string;
    password: string;
    contactNumber: string;
    role: UserRole;
    isVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface CreateUserInput {
    name: string;
    email: string;
    password: string;
    contactNumber: string;
    role?: UserRole;
}

export interface UpdateUserInput {
    name?: string;
    contactNumber?: string;
}

export interface UpdateProfileInput {
    name?: string;
    password?: string;
    contactNumber?: string;
}

export interface ChangeRoleInput {
    role: UserRole;
}

export interface TokenPayload {
    userId: string;
    email: string;
    role: UserRole;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

export interface UserResponse {
    id: string;
    name: string;
    email: string;
    contactNumber: string;
    role: UserRole;
    isVerified: boolean;
}
