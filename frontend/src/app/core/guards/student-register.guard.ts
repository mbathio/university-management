// src/app/core/guards/student-register.guard.ts
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { Role } from '../models/user.model';

export const studentRegisterGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Si l'utilisateur est connecté
  if (authService.isLoggedIn()) {
    const currentUser = authService.currentUserValue;

    // Autoriser seulement si l'utilisateur est un administrateur ou non connecté
    if (currentUser && currentUser.role !== Role.ADMIN) {
      router.navigate(['/dashboard']);
      return false;
    }
  }

  // Si l'utilisateur n'est pas connecté ou est un administrateur, autoriser l'accès
  return true;
};
