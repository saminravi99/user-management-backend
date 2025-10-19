import mongoose from 'mongoose';

export const handleMongooseValidationError = (err: mongoose.Error.ValidationError) => {
    const errors = Object.values(err.errors).map((el: any) => el.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    return { message, statusCode: 400 };
};
