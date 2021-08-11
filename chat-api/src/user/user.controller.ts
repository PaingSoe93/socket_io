import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pagination } from 'nestjs-typeorm-paginate';
import { Observable, switchMap, map } from 'rxjs';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { CreateUserDto, LoginUserDto } from './model/user.dto';
import { LoginResponseI, UserI } from './model/user.interface';
import { UserHelperService } from './user-helper.service';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly userHelperService: UserHelperService,
    private readonly configService: ConfigService,
  ) {}

  @Post()
  CreateUser(@Body() data: CreateUserDto): Observable<UserI> {
    return this.userHelperService
      .createUserDtoToEntity(data)
      .pipe(switchMap((user: UserI) => this.userService.createUser(user)));
  }

  @Post('login')
  Login(@Body() data: LoginUserDto): Observable<LoginResponseI> {
    return this.userHelperService.loginUserDtoToEntity(data).pipe(
      switchMap((user: UserI) =>
        this.userService.login(user).pipe(
          map((jwt: string) => {
            return {
              access_token: jwt,
              token_type: 'JWT',
              expires_in: 100000,
            };
          }),
        ),
      ),
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  FindAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Observable<Pagination<UserI>> {
    return this.userService.findAll({
      page,
      limit,
      route: `${this.configService.get('BASE_URL')}/users`,
    });
  }
}
