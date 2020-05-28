import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    if (!request.headers.authorization) return false;
    const temp = await this.validateToken(request.headers.authorization);
    request.user = temp;

    return true;
  }

  async validateToken(auth: string) {
    if (auth.split(' ')[0] !== 'Bearer') {
      throw new HttpException('Invalid Token', HttpStatus.FORBIDDEN);
    }

    const token = auth.split(' ')[1];

    try {
      const decoded = jwt.verify(token, process.env.SECRET);

      return decoded;
    } catch (err) {
      const message = 'Token error: ' + (err.message || err.name);
      throw new HttpException(message, HttpStatus.FORBIDDEN);
    }
  }
}
