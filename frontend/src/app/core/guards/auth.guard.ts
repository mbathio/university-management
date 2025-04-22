// src/app/core/guards/auth.guard.ts
import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { Role } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const user = this.authService.currentUserValue;
    
    // Check if user is logged in
    if (!user) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }
    
    // Check if route has role restriction
    if (route.data['roles'] && !this.checkRoles(route.data['roles'])) {
      this.router.navigate(['/dashboard']);
      return false;
    }
    
    return true;
  }
  
  private checkRoles(routeRoles: Role[]): boolean {
    return this.authService.hasRole(routeRoles);
  }
}