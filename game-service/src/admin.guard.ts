import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { JwtUser } from './jwt.strategy';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<{ user?: JwtUser }>();

    if (request.user?.role !== 'ADMIN') {
      throw new ForbiddenException('Admin role is required');
    }

    return true;
  }
}
