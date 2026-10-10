import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from './permissions.decorator';
import { hasPermission } from '../rbac/rbac';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user || !user.role) {
      throw new ForbiddenException('Access denied. Authentication required.');
    }

    const userRole = user.role;
    const directPermissions: string[] = user.permissions || [];

    const hasAny = requiredPermissions.some((perm) => {
      if (directPermissions.includes(perm)) return true;
      return hasPermission(userRole, perm);
    });

    if (!hasAny) {
      throw new ForbiddenException(
        `Access denied. Requires permissions: [${requiredPermissions.join(', ')}]. Current role: ${user.role}`,
      );
    }

    return true;
  }
}
