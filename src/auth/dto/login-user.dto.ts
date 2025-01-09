import { IsNotEmpty, IsString, Length } from 'class-validator';
export class LoginUserDto {
  @IsString()
  @IsNotEmpty()
  @Length(11, 11)
  phoneNumber: string;
  @IsString()
  @IsNotEmpty()
  password: string;
}
