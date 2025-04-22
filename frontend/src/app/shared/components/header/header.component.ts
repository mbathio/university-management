// src/app/shared/components/header/header.component.ts
import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { AuthService } from '../../../core/auth/auth.service';
import { User } from '../../../core/models/user.model';
import { Observable } from 'rxjs';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  // Si vous utilisez des composants standalone
  standalone: true,
  imports: [
    CommonModule,
    MatMenuModule,
    MatButtonModule, 
    MatToolbarModule,
    MatIconModule,
    MatDividerModule
  ]
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
    window.location.href = '/auth/login';
  }
}