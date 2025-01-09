import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class AuthService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
  ) {}
  async register(user: RegisterUserDto, req: Request, res: Response) {
    const [foundUserEmail] = await this.dataSource.query(
      'call get_user_by_email(?)',
      [user.email],
    );
    if (foundUserEmail[0])
      return res.send('this user with the given email already excists');
    const [foundUserPhoneNumber] = await this.dataSource.query(
      'call get_user_by_phoneNumber(?)',
      [user.phoneNumber],
    );
    if (foundUserPhoneNumber[0])
      return res.send('this user with given phoneNumber already excists');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(user.password, salt);
    await this.dataSource.query('call insert_into_users(?,?,?,?,?)', [
      user.name,
      user.email,
      user.role,
      user.phoneNumber,
      hashedPassword,
    ]);
    const [userData] = await this.dataSource.query(
      'call get_user_by_email(?)',
      [user.email],
    );
    const jwtCookies = req.cookies?.refreshToken;
    if (jwtCookies)
      res.clearCookie('refreshToken', {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
      });

    const phoneNumber = userData[0].phoneNumber;
    const accessToken = this.jwtService.sign(
      { phoneNumber },
      { expiresIn: '15m' },
    );
    const refreshToken = this.jwtService.sign(
      { phoneNumber },
      { expiresIn: '7d' },
    );
    await this.dataSource.query('call save_refreshToken(?,?)', [
      userData[0].phoneNumber,
      refreshToken,
    ]);
    // Set refresh token in a cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true, // the cookie is accessible only by the server
      secure: true, // the cookie is sent over HTTPS (set to false for local development)
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    const [userFinal] = await this.dataSource.query(
      'call get_user_by_email(?)',
      [user.email],
    );
    res.status(201).send({
      message: 'user successfully registered',
      data: {
        name: userFinal[0].name,
        phoneNumber: userFinal[0].phoneNumber,
        id: userFinal[0].user_id,
        access_token: accessToken,
        refresh_token: userFinal[0].refreshToken,
      },
    });
  }
  async login(user: LoginUserDto, req: Request, res: Response) {
    let foundUser = await this.dataSource.query(
      'call get_user_by_phoneNumber(?)',
      [user.phoneNumber],
    );
    if (foundUser[0].length <= 0) {
      return res.send('wrong phoneNumber or password');
    }
    const isValid = await bcrypt.compare(
      req.body.password,
      foundUser[0][0].password,
    );
    if (!isValid) {
      return res.send('wrong phoneNumber or password');
    }
    const jwtCookies = req.cookies?.refreshToken;
    if (jwtCookies)
      res.clearCookie('refreshToken', {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
      });
    const phoneNumber = foundUser[0][0].phoneNumber;
    const accessToken = this.jwtService.sign(
      { phoneNumber },
      { expiresIn: '15m' },
    );
    const refreshToken = this.jwtService.sign(
      { phoneNumber },
      { expiresIn: '7d' },
    );
    await this.dataSource.query('call save_refreshToken(?,?)', [
      foundUser[0][0].phoneNumber,
      refreshToken,
    ]);
    // Set refresh token in a cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true, // the cookie is accessible only by the server
      secure: true, // the cookie is sent over HTTPS (set to false for local development)
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    const [userFinal] = await this.dataSource.query(
      'call get_user_by_phoneNumber(?)',
      [user.phoneNumber],
    );
    res.status(201).send({
      message: 'user successfully logined',
      data: {
        name: userFinal[0].name,
        phoneNumber: userFinal[0].phoneNumber,
        id: userFinal[0].user_id,
        access_token: accessToken,
        refresh_token: userFinal[0].refreshToken,
      },
    });
  }
  async handleRefreshToken(req: Request, res: Response) {
    const cookies = req.cookies;
    if (!cookies?.refreshToken) {
      throw new HttpException(
        { message: 'Refresh token was not sent (1)', data: null },
        HttpStatus.BAD_REQUEST,
      );
    }
    const refreshToken = cookies.refreshToken;
    res.clearCookie('refreshToken', {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    });
    const [foundUser] = await this.dataSource.query(
      'CALL get_user_by_refreshToken(?)',
      [refreshToken],
    );
    if (foundUser.length <= 0) {
      const decoded = this.jwtService.decode(refreshToken);

      if (!decoded || !decoded.phoneNumber) {
        throw new HttpException(
          { message: 'Invalid refresh token (2)', data: null },
          HttpStatus.BAD_REQUEST,
        );
      }

      await this.dataSource.query(
        'CALL update_user_refreshToken_by_phoneNumber(?,?)',
        [null, decoded.phoneNumber],
      );

      throw new HttpException(
        { message: 'Invalid refresh token (3)', data: null },
        HttpStatus.BAD_REQUEST,
      );
    }

    const decoded = this.jwtService.verify(refreshToken, {
      secret: process.env.JWT_SECRET_KEY,
    });
    const [user] = await this.dataSource.query(
      'Call get_user_by_phoneNumber(?)',
      [decoded.phoneNumber],
    );
    if (!user[0]) {
      throw new HttpException(
        { message: 'Expired or invalid token (4)', data: null },
        HttpStatus.BAD_REQUEST,
      );
    }
    const phoneNumber = user[0].phoneNumber;
    const newAccessToken = this.jwtService.sign(
      { phoneNumber },
      { expiresIn: '15m' },
    );

    const newRefreshToken = this.jwtService.sign(
      { phoneNumber },
      { expiresIn: '7d' },
    );

    await this.dataSource.query(
      'CALL update_user_refreshToken_by_phoneNumber(?,?)',
      [newRefreshToken, user[0].phoneNumber],
    );

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      data: {
        new_accessToken: newAccessToken,
        name: user[0].name,
        id: user[0].user_id,
      },
      message: 'ok',
    });
  }
  async handleLogout(req: Request, res: Response) {
    const cookies = req.cookies;
    if (!cookies?.refreshToken) {
      return res.json({
        data: null,
        message: 'you are not logined',
        status: 401,
      });
    }
    const refreshToken = cookies.refreshToken;
    const [foundUser] = await this.dataSource.query(
      'CALL get_user_by_refreshToken(?)',
      [refreshToken],
    );
    if (foundUser.length <= 0) {
      res.clearCookie('refreshToken', {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
      });
      return res.json({
        data: null,
        status: 204,
        message: 'this user doesnt exist',
      });
    }
    await this.dataSource.query('CALL update_user_refreshToken(?,?)', [
      null,
      refreshToken,
    ]);
    res.clearCookie('refreshToken', {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    });
    return res
      .status(200)
      .json({ data: null, message: 'user successfully logged out' });
  }
}
