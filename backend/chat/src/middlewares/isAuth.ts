import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

interface IUser  {
    _id: string;
    email: string;
    name: string;
    
}

export interface AuthenticatedRequest extends Request {
    user?: IUser | null;
}
export const isAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
   try{
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ message: 'please log in no auth headers' });
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
            req.user = decodedValue.user as IUser;
            next();  
   }catch(error){
    res.status(401).json({ message: 'please login' });
   }
}
export default isAuth;