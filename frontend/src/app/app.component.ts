import { Component, OnInit } from '@angular/core';
import {
  Router,
  NavigationEnd,
  RouterModule,
  Event as NavigationEvent,
  RouterOutlet,
} from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from './core/auth/auth.service';
import { Observable } from 'rxjs';
import { User } from './core/models/user.model';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './shared/components/header/header.component';
import { SidenavComponent } from './shared/components/sidenav/sidenav.component';
import { Role } from './core/models/user.model';

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
  imports: [
    CommonModule,
    RouterModule,
    RouterOutlet,
    HeaderComponent,
    SidenavComponent,
  ],
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
      .pipe(
        filter(
          (event: NavigationEvent): event is NavigationEnd =>
            event instanceof NavigationEnd,
        ),
      )
      .subscribe((event: NavigationEnd) => {
        this.isLoginPage = event.url.includes('/auth');
        this.setupNavItems();
      });
  }

  private setupNavItems(): void {
    const currentUser = this.authService.currentUserValue;
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
        route: '/administration',
        roles: [Role.ADMIN, Role.ADMINISTRATION],
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
}
