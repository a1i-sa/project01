import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './users/entities/user.entity';
import { AuthModule } from './auth/auth.module';
import { RecoveryModule } from './recovery/recovery.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import * as dotenv from 'dotenv';
dotenv.config();
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST_NAME,
      port: 3306,
      username: process.env.DB_USER_NAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [UserEntity],
      synchronize: false,
      logging: true,
    }),
    UsersModule,
    AuthModule,
    RecoveryModule,
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000, //no more than 3 request in 1 sec
        limit: 3,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 50, //no more than 50 request in 1 min
      },
    ]),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
