import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }
    const user = req.user;
    if (!user) throw new ForbiddenException('No hay usuario autenticado');
    if (!user.roles) throw new ForbiddenException('El usuario no tiene roles asociados');

    // Permitir si el usuario tiene al menos uno de los roles requeridos
    const userRoles = user.roles.map(r => typeof r === 'string' ? r : r.nombre);
    const hasRole = requiredRoles.some(role => userRoles.includes(role));
    if (!hasRole) throw new ForbiddenException('No tienes permisos suficientes');
    return true;
  }
}
