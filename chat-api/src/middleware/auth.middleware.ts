import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { NextFunction } from 'express';
import { AuthService } from '../auth/auth.service';
import { UserI } from '../user/model/user.interface';
import { UserService } from '../user/user.service';

export interface RequestModel extends Request {
  user: UserI;
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  async use(req: RequestModel, res: Response, next: NextFunction) {
    try {
      const tokenArray: string[] = req.headers['authorization'].split(' ');
      const decodedToken = await this.authService.verifyJwt(tokenArray[1]);
      const user: UserI = await this.userService.findOne(decodedToken.user.id);
      if (user) {
        req.user = user;
        next();
      } else {
        throw new UnauthorizedException('Unauthorized!');
      }
    } catch (error) {
      throw new UnauthorizedException(error);
    }
  }
}
