import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  password: string;
}

export class CreateUserDto extends LoginUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;
}
