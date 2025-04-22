// src/app/shared/components/header/header.component.ts
import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { AuthService } from '../../../core/auth/auth.service';
import { User } from '../../../core/models/user.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @Output() toggleSidenav = new EventEmitter<void>();
  currentUser$: Observable<User | null>;

  constructor(private authService: AuthService) {
    this.currentUser$ = this.authService.currentUser;
  }

  ngOnInit(): void {
    // Additional initialization if needed
  }

  logout(): void {
    this.authService.logout();
    window.location.href = '/auth/login';  // Updated to match the pattern used for route checking
  }
}