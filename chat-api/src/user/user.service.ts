import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  IPaginationOptions,
  paginate,
  Pagination,
} from 'nestjs-typeorm-paginate';
import { from, Observable } from 'rxjs';
import { map, mapTo, switchMap } from 'rxjs/operators';
import { Repository } from 'typeorm';
import { AuthService } from '../auth/auth.service';
import { UserEntity } from './model/user.entity';
import { UserI } from './model/user.interface';

const bcrypt = require('bcrypt');

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private readonly authService: AuthService,
  ) {}

  createUser(newUser: UserI): Observable<UserI> {
    return this.checkEmail(newUser.email).pipe(
      switchMap((exists: boolean) => {
        if (!exists) {
          return this.hashPassword(newUser.password).pipe(
            switchMap((passwordHash: string) => {
              newUser.password = passwordHash;
              return from(this.userRepo.save(newUser)).pipe(
                switchMap((user: UserI) => this.findOne(user.id)),
              );
            }),
          );
        } else {
          throw new ConflictException('Email is already in use!');
        }
      }),
    );
  }

  login(user: UserI): Observable<string> {
    return this.findByEmail(user.email).pipe(
      switchMap((foundUser: UserI) => {
        if (foundUser) {
          return this.validatePassword(user.password, foundUser.password).pipe(
            switchMap((matched: boolean) => {
              if (matched) {
                return this.findOne(foundUser.id).pipe(
                  switchMap((payload: UserI) =>
                    this.authService.generateJwt(payload),
                  ),
                );
              } else {
                throw new UnauthorizedException('Wrong credentials!');
              }
            }),
          );
        } else {
          throw new NotFoundException('User not found!');
        }
      }),
    );
  }

  findAll(options: IPaginationOptions): Observable<Pagination<UserI>> {
    return from(paginate<UserEntity>(this.userRepo, options));
  }

  private hashPassword(password: string): Observable<string> {
    return this.authService.hashPassword(password);
  }

  private validatePassword(
    password: string,
    storedPasswordHash: string,
  ): Observable<any> {
    return this.authService.comparePassword(password, storedPasswordHash);
  }

  private findOne(id: number): Observable<UserI> {
    return from(this.userRepo.findOne(id));
  }

  public getOne(id: number): Promise<UserI> {
    return this.userRepo.findOneOrFail(id);
  }

  private findByEmail(email: string): Observable<UserI> {
    return from(
      this.userRepo.findOne(
        { email },
        { select: ['id', 'username', 'email', 'password'] },
      ),
    );
  }

  private checkEmail(email: string): Observable<boolean> {
    return from(this.userRepo.findOne({ email: email })).pipe(
      map((user: UserI) => {
        if (user) {
          return true;
        } else {
          return false;
        }
      }),
    );
  }
}
