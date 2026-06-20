import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role, User } from '../users.entity';
import { ROLES_KEY } from '../decorators/roles.decorators';

export interface AuthenticatedRequest extends Request {
  user: User;
}

// workfLow ->
// client -> iwtauthguard -> validate the token, and attach the current user in the request
// -> rolesguard check if current user role matches the required role -> if match found
// proceed to controller -> if not forbidden exception

@Injectable()
export class RolesGuard implements CanActivate {
  // reflector --> utility that helps to access metadata
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // retrive the roles metadata set by the roles decorator
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(), // method level metadata
      context.getClass(), // class level metadata
    ]);

    if (!requiredRoles) return true;
    const data = context.switchToHttp().getRequest<AuthenticatedRequest>();

    if (!data?.user) throw new ForbiddenException('User not authenticated');

    const hasRequiredRole = requiredRoles.some(
      (r: Role) => data?.user?.role === r,
    );

    if (!hasRequiredRole)
      throw new ForbiddenException('Insufficient permission');

    return true;
  }
}
