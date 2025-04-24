// src/app/core/guards/auth.guard.ts
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { Role } from '../models/user.model';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const currentUser = authService.currentUserValue;

  // Check if user is authenticated
  if (!currentUser) {
    router.navigate(['/login'], {
      queryParams: { returnUrl: state.url },
    });
    return false;
  }

  // Check role-based access if specified
  if (route.data && route.data['roles']) {
    const requiredRoles = route.data['roles'] as Role[];
    if (!requiredRoles.includes(currentUser.role)) {
      router.navigate(['/dashboard']);
      return false;
    }
  }

  return true;
};
