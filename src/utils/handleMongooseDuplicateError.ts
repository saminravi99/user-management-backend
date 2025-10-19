
export const handleMongooseDuplicateError = (err: any) => {
    const field = Object.keys(err.keyValue)[0];
    const message = `Duplicate field value: ${field}. Please use another value`;
    return { message, statusCode: 409 };
};
