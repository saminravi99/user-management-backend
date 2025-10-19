import mongoose from 'mongoose';

export const handleMongooseCastError = (err: mongoose.Error.CastError) => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return { message, statusCode: 400 };
};
