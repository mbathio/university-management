// src/app/core/guards/auth.guard.ts
import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { Role } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const currentUser = this.authService.currentUserValue;
    
    if (currentUser) {
      // Vérifier si la route a des restrictions de rôles
      if (route.data['roles'] && !route.data['roles'].includes(currentUser.role)) {
        // Accès non autorisé pour ce rôle, rediriger vers le tableau de bord
        this.router.navigate(['/dashboard']);
        return false;
      }
      
      // Authentifié et autorisé
      return true;
    }

    // Non authentifié, rediriger vers la page de connexion avec l'url de retour
    this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
}