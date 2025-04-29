// src/app/app.component.ts - updated version
import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from './core/auth/auth.service';
import { Observable } from 'rxjs';
import { User, Role } from './core/models/user.model';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles?: Role[];
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
})
export class AppComponent implements OnInit {
  title = 'Université Cheikh Hamidou Kane';
  isLoginPage = false;
  currentUser$: Observable<User | null>;
  navItems: NavItem[] = [];

  constructor(
    private router: Router,
    private authService: AuthService,
  ) {
    this.currentUser$ = this.authService.currentUser;
  }

  ngOnInit(): void {
    // Auto login from localStorage if token exists
    this.authService.autoLogin();

    // Check if current route is login page
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.isLoginPage =
          event.url.includes('/login') || event.url.includes('/auth');
        this.setupNavItems();
      });
  }

  private setupNavItems(): void {
    const currentUser = this.authService.currentUser;
    if (!currentUser || this.isLoginPage) {
      this.navItems = [];
      return;
    }

    this.navItems = [
      {
        label: 'Tableau de bord',
        icon: 'dashboard',
        route: '/dashboard',
      },
      {
        label: 'Administration',
        icon: 'admin_panel_settings',
        route: '/admin',
        roles: [Role.ADMIN],
      },
      {
        label: 'Communications',
        icon: 'forum',
        route: '/communication',
      },
      {
        label: 'Formations',
        icon: 'school',
        route: '/formations',
      },
      {
        label: 'Étudiants',
        icon: 'people',
        route: '/students',
      },
      {
        label: 'Insertion professionnelle',
        icon: 'work',
        route: '/insertion',
        roles: [Role.ADMIN, Role.FORMATION_MANAGER, Role.ADMINISTRATION],
      },
    ].filter((item) => !item.roles || this.authService.hasRole(item.roles));
  }

  logout(): void {
    console.log('User logged out');
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
