import { config } from '../config';
import redisClient from '../config/redis';
import { generateOTP } from '../utils/handleJavaScriptError';

const getOtpKey = (email: string): string => {
    return `otp:${email}`;
};

export const generateAndStoreOtp = async (email: string): Promise<string> => {
    const otp = generateOTP(config.otp.length);
    const key = getOtpKey(email);

    await redisClient.setEx(key, config.otp.expiry, otp);

    return otp;
};

export const verifyOtp = async (email: string, otp: string): Promise<boolean> => {
    const key = getOtpKey(email);
    const storedOtp = await redisClient.get(key);

    if (!storedOtp || storedOtp !== otp) {
        return false;
    }

    await redisClient.del(key);
    return true;
};

export const deleteOtp = async (email: string): Promise<void> => {
    const key = getOtpKey(email);
    await redisClient.del(key);
};
