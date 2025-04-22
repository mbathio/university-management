// frontend/src/app/core/auth.guard.ts
import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, CanActivateFn } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { Role } from '../models/user.model';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot, 
  state: RouterStateSnapshot
) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  
  const currentUser = authService.currentUserValue;
  
  if (currentUser) {
    // Vérifier si la route a des restrictions de rôles
    if (route.data['roles'] && !route.data['roles'].includes(currentUser.role)) {
      // Accès non autorisé pour ce rôle, rediriger vers le tableau de bord
      router.navigate(['/dashboard']);
      return false;
    }
    
    // Authentifié et autorisé
    return true;
  }

  // Non authentifié, rediriger vers la page de connexion avec l'url de retour
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};