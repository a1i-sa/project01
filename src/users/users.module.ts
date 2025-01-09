import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { JwtModule } from '@nestjs/jwt';
import { VerifyJWTMiddleware } from 'src/middlewares/veriftJWT.middleware';
import * as dotenv from 'dotenv';
dotenv.config();
@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET_KEY,
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(VerifyJWTMiddleware).forRoutes('users'); // Apply to specific routes
  }
}
