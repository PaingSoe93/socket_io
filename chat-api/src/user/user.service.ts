import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  IPaginationOptions,
  paginate,
  Pagination,
} from 'nestjs-typeorm-paginate';
import { Like, Repository } from 'typeorm';
import { AuthService } from '../auth/auth.service';
import { UserEntity } from './model/user.entity';
import { UserI } from './model/user.interface';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private readonly authService: AuthService,
  ) {}

  async createUser(newUser: UserI): Promise<UserI> {
    try {
      const exists: boolean = await this.checkEmail(newUser.email);
      if (!exists) {
        let passwordHash: string = await this.hashPassword(newUser.password);
        newUser.password = passwordHash;
        let user: UserI = await this.userRepo.save(newUser);
        return this.findOne(user.id);
      } else {
        throw new ConflictException('Email is already in use!');
      }
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async login(user: UserI): Promise<string> {
    try {
      let foundUser: UserI = await this.findByEmail(user.email);
      if (foundUser) {
        let matched = await this.validatePassword(
          user.password,
          foundUser.password,
        );
        if (matched) {
          let payload: UserI = await this.findOne(foundUser.id);
          return this.authService.generateJwt(payload);
        } else {
          throw new UnauthorizedException('Wrong credentials!');
        }
      } else {
        throw new NotFoundException('User not found!');
      }
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  findAll(options: IPaginationOptions): Promise<Pagination<UserI>> {
    return paginate<UserEntity>(this.userRepo, options);
  }

  findAllByUsername(username: string): Promise<UserI[]> {
    return this.userRepo.find({ where: { username: Like(`%${username}%`) } });
  }

  private async hashPassword(password: string): Promise<string> {
    return this.authService.hashPassword(password);
  }

  private async validatePassword(
    password: string,
    storedPasswordHash: string,
  ): Promise<any> {
    return this.authService.comparePassword(password, storedPasswordHash);
  }

  public findOne(id: number): Promise<UserI> {
    return this.userRepo.findOneOrFail(id);
  }

  private findByEmail(email: string): Promise<UserI> {
    return this.userRepo.findOne(
      { email },
      { select: ['id', 'username', 'email', 'password'] },
    );
  }

  private async checkEmail(email: string): Promise<boolean> {
    let user = await this.userRepo.findOne({ email: email });
    if (user) {
      return true;
    } else {
      return false;
    }
  }
}
