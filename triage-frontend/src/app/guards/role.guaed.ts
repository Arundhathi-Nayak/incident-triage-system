import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth-service';


export const roleGuard = (
  allowedRoles: string[]
): CanActivateFn => {

  return () => {

    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isLoggedIn()) {
      return router.createUrlTree(['/login']);
    }

    const userRoles = authService.getRoles();

    const hasRequiredRole = allowedRoles.some(
      role => userRoles.includes(role)
    );

    if (hasRequiredRole) {
      return true;
    }

    // Logged in, but doesn't have permission
    return router.createUrlTree(['/']);
  };
};