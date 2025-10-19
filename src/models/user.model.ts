import bcryptjs from 'bcryptjs';
import mongoose, { Schema } from 'mongoose';
import { IUser } from '../interfaces/user.interface';

const userSchema = new Schema<IUser>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        password: {
            type: String,
            required: true,
            select: false,
        },
        contactNumber: {
            type: String,
            required: true,
            trim: true,
        },
        role: {
            type: String,
            enum: ['user', 'admin', 'superadmin'],
            default: 'user',
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    },
);

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    this.password = await bcryptjs.hash(this.password, 10);
    next();
});

userSchema.methods.comparePassword = async function (
    candidatePassword: string,
): Promise<boolean> {
    return bcryptjs.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', userSchema);
