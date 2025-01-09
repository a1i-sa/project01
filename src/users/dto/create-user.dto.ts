import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  Length,
  MinLength,
} from 'class-validator';
import { UserRole } from '../entities/user.entity';
import { PrimaryGeneratedColumn } from 'typeorm';
import { isLength } from 'lodash';
export class CreateUserDto {
  @PrimaryGeneratedColumn()
  id: number;
  @IsString()
  @IsNotEmpty()
  @Length(1, 45)
  name: string;
  @IsEmail()
  @IsNotEmpty()
  email: string;
  @IsString()
  @IsNotEmpty()
  @Length(11, 11)
  phoneNumber: string;
  @IsEnum(UserRole)
  role: UserRole;
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  password: string;
}
