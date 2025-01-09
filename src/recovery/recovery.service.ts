import { Injectable } from '@nestjs/common';
import { Request, Response } from 'express';
import { DataSource } from 'typeorm';
import { randomInt } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import * as dotenv from 'dotenv';
dotenv.config();
@Injectable()
export class RecoveryService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
  ) {}
  async sendRecoverySms(req: Request, res: Response) {
    const phoneNumber = req.body.phoneNumber;
    const regex = new RegExp('^09\\d{9}$');
    const isValidNum = regex.test(phoneNumber);
    if (!isValidNum) {
      return res.json({
        status: 400,
        data: null,
        message: 'enter valid phoneNumber (11 charecters and start with 09)',
      });
    }
    let [user] = await this.dataSource.query(
      'CALL get_user_by_phoneNumber(?)',
      [phoneNumber],
    );
    if (user.length <= 0) {
      return res.json({
        status: 400,
        data: null,
        message: 'wrong phoneNumber',
      });
    }
    let verificationCode = randomInt(100123, 999879);
    let verificationDate = new Date();
    await this.dataSource.query(
      'CALL update_verificationCode_verificationDate_by_phoneNumber(?,?,?)',
      [verificationCode, verificationDate, phoneNumber],
    );
    const https = require('https');

    const data = JSON.stringify({
      from: process.env.SMS_NUMBER,
      to: phoneNumber,
      text: `Code:${verificationCode} this code expires in 2 minutes`,
    });

    const options = {
      hostname: process.env.SMS_HOST,
      port: 443,
      path: process.env.SMS_PATH,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
      },
    };

    const reqq = https.request(options, (res) => {
      console.log('statusCode: ' + res.statusCode);

      res.on('data', (d) => {
        process.stdout.write(d);
      });
    });

    reqq.on('error', (error) => {
      console.error(error);
    });

    reqq.write(data);
    reqq.end();
    return res.json({
      status: 200,
      data: { verificationCode: verificationCode },
      message: `verification code has sent successfully to ${phoneNumber}
    this code expires in 2 minutes`,
    });
  }
  async checkRecoverySms(req: Request, res: Response) {
    const verificationCode = req.body.verificationCode;
    const phoneNumberr = req.body.phoneNumber;
    const regex = new RegExp('^09\\d{9}$');
    const isValidNum = regex.test(phoneNumberr);

    if (!verificationCode || !phoneNumberr) {
      return res.json({
        status: 400,
        data: null,
        message: 'your account phoneNumber and verificationCode is required ',
      });
    }
    if (!isValidNum) {
      return res.json({
        status: 400,
        data: null,
        message: 'not valid phoneNumber',
      });
    }
    if (verificationCode <= 100123 || verificationCode > 999879) {
      return res.json({
        status: 400,
        data: null,
        message: 'not valid verificationCode',
      });
    }
    const [user] = await this.dataSource.query(
      'call get_user_by_phoneNumber(?)',
      [phoneNumberr],
    );

    if (!user[0]) {
      return res.json({
        status: 404,
        data: null,
        message: 'user was not found',
      });
    }
    if (user[0].verificationCode != verificationCode) {
      return res.json({
        status: 400,
        data: null,
        message: 'wrong phoneNumber or expired verificationCode',
      });
    }
    if (!user[0].verificationDate) {
      return res.json({
        status: 400,
        data: null,
        message: 'wrong or expired verificationCode',
      });
    }
    const verificationDate = new Date(
      user[0].verificationDate.getTime() + 120 * 1000,
    );

    if (verificationDate < new Date()) {
      user.verificationCode = '';
      user.verificationDate = null;
      await this.dataSource.query(
        'call update_verificationCode_verificationDate_by_phoneNumber(?,?,?)',
        [null, null, req.body.phoneNumber],
      );
      return res.json({
        status: 400,
        data: null,
        message: 'your verification code has expired please try again',
      });
    }
    const cookies = req.cookies;
    if (cookies.refreshToken)
      res.clearCookie('refreshToken', {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
      });
    const phoneNumber = user.phoneNumber;
    const accessToken = this.jwtService.sign(
      { phoneNumber },
      { expiresIn: '15m' },
    );
    const refreshToken = this.jwtService.sign(
      { phoneNumber },
      { expiresIn: '7d' },
    );
    await this.dataSource.query(
      'CALL update_users_refreshToken_verificationDate_verificationCode(?,?,?,?)',
      [refreshToken, null, null, phoneNumber],
    );
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 1000 * 60 * 60 * 24 * 5,
    });
    res.json({
      status: 200,
      data: {
        name: user[0].name,
        phoneNumber: user[0].phoneNumber,
        id: user[0].user_id,
        accessToken: accessToken,
        refreshToken: refreshToken,
      },
    });
  }
}
