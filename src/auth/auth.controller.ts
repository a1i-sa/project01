import {
  Body,
  Controller,
  Post,
  ValidationPipe,
  Res,
  Req,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { Request, Response } from 'express';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('register')
  register(
    @Body(ValidationPipe) user: RegisterUserDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.authService.register(user, req, res);
  }
  @Post('login')
  login(
    @Body(ValidationPipe) user: LoginUserDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.authService.login(user, req, res);
  }
  @Post('handleRefreshToken')
  handleRefreshToken(@Req() req: Request, @Res() res: Response) {
    return this.authService.handleRefreshToken(req, res);
  }
  @Get('logout')
  handleLogout(@Req() req: Request, @Res() res: Response) {
    return this.authService.handleLogout(req, res);
  }
}
