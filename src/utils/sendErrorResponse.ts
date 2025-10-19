export const sendErrorResponse = (res: any, statusCode: number, message: string, errors?: any) => {
    res.status(statusCode).json({
        success: false,
        message,
        ...(errors && { errors }),
    });
};
