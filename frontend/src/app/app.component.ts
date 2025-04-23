// src/app/app.component.ts
import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from './core/auth/auth.service';
import { Observable } from 'rxjs';
import { User } from './core/models/user.model';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './core/components/header/header.component'; // Adjust path if needed
import { SidenavComponent } from './core/components/sidenav/sidenav.component'; // Adjust path if needed

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [
    CommonModule,
    RouterModule,
    HeaderComponent,
    SidenavComponent
  ],
  standalone: true
})
export class AppComponent implements OnInit {
  title = 'Université Cheikh Hamidou Kane';
  isLoginPage = false;
  currentUser$: Observable<User | null>;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    this.currentUser$ = this.authService.currentUser;
  }

  ngOnInit(): void {
    // Auto login from localStorage if token exists
    this.authService.autoLogin();
    
    // Check if current route is login page
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.isLoginPage = event.url.includes('/auth');
      });
  }
}