import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config';
import { AuthTokens, TokenPayload } from '../interfaces/user.interface';

export const generateAccessToken = (payload: TokenPayload): string => {
    return jwt.sign(payload, config.jwt.accessSecret, {
        expiresIn: config.jwt.accessExpiry as string,
    } as SignOptions);
};

export const generateRefreshToken = (payload: TokenPayload): string => {
    return jwt.sign(payload, config.jwt.refreshSecret, {
        expiresIn: config.jwt.refreshExpiry as string,
    } as SignOptions);
};

export const verifyAccessToken = (token: string): TokenPayload => {
    return jwt.verify(token, config.jwt.accessSecret) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
    return jwt.verify(token, config.jwt.refreshSecret) as TokenPayload;
};

export const generateTokenPair = (payload: TokenPayload): AuthTokens => {
    return {
        accessToken: generateAccessToken(payload),
        refreshToken: generateRefreshToken(payload),
    };
};
