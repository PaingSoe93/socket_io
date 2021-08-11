import { Injectable } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { CreateUserDto, LoginUserDto } from './model/user.dto';
import { UserI } from './model/user.interface';

@Injectable()
export class UserHelperService {
  createUserDtoToEntity(data: CreateUserDto): Observable<UserI> {
    return of({
      email: data.email,
      username: data.username,
      password: data.password,
    });
  }

  loginUserDtoToEntity(data: LoginUserDto): Observable<UserI> {
    return of({
      email: data.email,
      password: data.password,
    });
  }
}
