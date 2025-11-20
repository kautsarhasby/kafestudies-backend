import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { Role } from 'src/modules/users/enum/role.enum';
import { ROLE_KEY } from '../decorator/roles.decorator';
import { JWTPayload } from '../strategy/access-token.strategy';
import { AccessControlService } from '../shared/access-control.service';
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private accessControlService: AccessControlService,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest<{ user: JWTPayload }>();
    const currentRole = request.user.role;

    for (const role of requiredRoles) {
      const result = this.accessControlService.isAuthorized({
        currentRole,
        requiredRole: role,
      });
      if (result) {
        return true;
      }
    }
    return false;
  }
}
