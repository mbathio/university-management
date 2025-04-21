// src/app/core/guards/auth.guard.ts
import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../auth/auth.service';

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
      // Check if route has roles data
      if (route.data['roles'] && route.data['roles'].length) {
        // Check if user has required role
        if (!this.authService.hasRole(route.data['roles'])) {
          // Role not authorized, redirect to home
          this.router.navigate(['/dashboard']);
          return false;
        }
      }
      
      // Authorized, return true
      return true;
    }

    // Not logged in, redirect to login with return url
    this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
}