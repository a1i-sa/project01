import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DataSource } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { UserRole } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';
import * as dotenv from 'dotenv';
dotenv.config();
@Injectable()
export class UsersService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
  ) {}
  async findAll(role?: UserRole) {
    if (role && !Object.values(UserRole).includes(role)) {
      throw new BadRequestException('invalid role in your query');
    }
    if (role) {
      const [roleResult] = await this.dataSource.query(
        'call get_users_by_role(?)',
        [role],
      );

      return roleResult;
    }
    if (!role) {
      const result = await this.dataSource.query('call get_all_users()');
      return result[0];
    }
  }

  async findOne(id: number) {
    const [result] = await this.dataSource.query('call get_user_by_id(?)', [
      id,
    ]);
    if (!result[0])
      throw new NotFoundException('user with the given id was not found!');
    return result;
  }
  async create(user: CreateUserDto, res: Response) {
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

  async update(id: number, updatedUser: UpdateUserDto) {
    const [foundUserEmail] = await this.dataSource.query(
      'call get_user_by_email(?)',
      [updatedUser.email],
    );

    if (foundUserEmail[0])
      return 'this user with the given email already excists';
    const [foundUserPhoneNumber] = await this.dataSource.query(
      'call get_user_by_phoneNumber(?)',
      [updatedUser.phoneNumber],
    );
    if (foundUserPhoneNumber[0])
      return 'this user with given phoneNumber already excists';
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(updatedUser.password, salt);

    const result = await this.dataSource.query(
      'call update_user_by_id(?,?,?,?,?,?)',
      [
        updatedUser.name,
        updatedUser.email,
        updatedUser.role,
        updatedUser.phoneNumber,
        password,
        id,
      ],
    );
    return await this.findOne(id);
  }

  async remove(id: number) {
    const result = await this.dataSource.query('call delete_by_id(?)', [id]);
    return result;
  }
}
