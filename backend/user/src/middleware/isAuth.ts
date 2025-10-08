import type { Request, Response, NextFunction } from 'express';
import type { IUser } from '../modal/userModal.js';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  userId?: IUser | null;
}

export const isAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ message: 'no auth header' });
            return;
        }
        const token = authHeader.split(' ')[1];

       const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            res.status(500).json({ message: 'JWT secret not configured' });
            return;
        }

const decodedValue = jwt.verify(token as string, jwtSecret as string) as jwt.JwtPayload;

        if (!decodedValue || !decodedValue.user) {
            res.status(401).json({ message: 'invalid token' });
            return;
        }
        req.userId = decodedValue.user as IUser;
        next();
    } catch (error) {
        res.status(401).json({ message: 'please login' });
    }
}