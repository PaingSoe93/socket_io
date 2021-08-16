import { Injectable } from '@nestjs/common';
import { CreateUserDto, LoginUserDto } from './model/user.dto';
import { UserI } from './model/user.interface';

@Injectable()
export class UserHelperService {
  createUserDtoToEntity(createUserDto: CreateUserDto): UserI {
    return {
      email: createUserDto.email,
      username: createUserDto.username,
      password: createUserDto.password,
    };
  }

  loginUserDtoToEntity(loginUserDto: LoginUserDto): UserI {
    return {
      email: loginUserDto.email,
      password: loginUserDto.password,
    };
  }
}
