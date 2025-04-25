// src/app/core/guards/auth.guard.ts
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { Role } from '../models/user.model';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  // Check if the route requires specific roles
  const requiredRoles = route.data?.['roles'] as Role[];
  if (requiredRoles && requiredRoles.length > 0) {
    if (!authService.hasRole(requiredRoles)) {
      // If the user doesn't have the required role, redirect to the dashboard
      router.navigate(['/dashboard']);
      return false;
    }
  }

  return true;
};
