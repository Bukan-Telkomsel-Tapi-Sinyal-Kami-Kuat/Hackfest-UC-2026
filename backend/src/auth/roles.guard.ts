import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) {
      return true; // Jika API tidak diberi penanda @Roles, berarti bebas akses
    }

    const { user } = context.switchToHttp().getRequest();
    
    // Asumsinya Anda sudah punya JWT Auth Guard yang memasukkan data user ke request
    if (requiredRoles.some((role) => user?.role === role)) {
      return true;
    }

    throw new ForbiddenException('Akses ditolak. Fitur ini khusus Admin.');
  }
}