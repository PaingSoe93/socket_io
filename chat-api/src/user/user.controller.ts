import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pagination } from 'nestjs-typeorm-paginate';
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
  CreateUser(@Body() data: CreateUserDto): Promise<UserI> {
    const user: UserI = this.userHelperService.createUserDtoToEntity(data);
    return this.userService.createUser(user);
  }

  @Post('login')
  async Login(@Body() data: LoginUserDto): Promise<LoginResponseI> {
    const user: UserI = this.userHelperService.loginUserDtoToEntity(data);
    const jwt: string = await this.userService.login(user);
    return {
      access_token: jwt,
      token_type: 'JWT',
      expires_in: 100000,
    };
  }

  @Get()
  FindAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<Pagination<UserI>> {
    limit = limit > 100 ? 100 : limit;
    return this.userService.findAll({
      page,
      limit,
      route: `${this.configService.get('BASE_URL')}/users`,
    });
  }

  @Get('find-by-username')
  findByUsername(@Query('username') username: string): Promise<UserI[]> {
    return this.userService.findAllByUsername(username);
  }
}
