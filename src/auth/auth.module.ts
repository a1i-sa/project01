import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import * as dotenv from 'dotenv';
dotenv.config();
@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET_KEY, // Replace with your JWT secret key
      signOptions: { expiresIn: '1h' }, // Default expiration
    }),
  ],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
