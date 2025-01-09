import { Module } from '@nestjs/common';
import { RecoveryService } from './recovery.service';
import { RecoveryController } from './recovery.controller';
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

  providers: [RecoveryService],
  controllers: [RecoveryController],
})
export class RecoveryModule {}
