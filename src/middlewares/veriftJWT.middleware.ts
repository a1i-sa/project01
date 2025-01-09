import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
dotenv.config();
@Injectable()
export class VerifyJWTMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader =
      req.headers.authorization || (req.headers.Authorization as string);
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(400).json({
        status: 400,
        data: null,
        message:
          'The token was either not sent or does not have the correct format',
      });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded: any) => {
      if (err) {
        return res.status(400).json({
          status: 400,
          message: 'Token is either expired or not valid',
          data: null,
        });
      }
      //  req['user'] = decoded.phoneNumber; // Attach user data to the request object
      next();
    });
  }
}
