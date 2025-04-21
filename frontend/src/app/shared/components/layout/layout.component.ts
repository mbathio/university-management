// src/app/shared/components/layout/layout.component.ts
import { Component, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { BreakpointObserver } from '@angular/cdk/layout';
import { AuthService } from '../../../core/auth/auth.service';
import { User } from '../../../core/models/user.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent {
  @ViewChild('sidenav') sidenav!: MatSidenav;
  currentUser$: Observable<User | null>;
  
  constructor(
    private breakpointObserver: BreakpointObserver,
    private authService: AuthService
  ) {
    this.currentUser$ = this.authService.currentUser;
  }
  
  get isMobile(): boolean {
    return this.breakpointObserver.isMatched('(max-width: 768px)');
  }
  
  toggleSidenav(): void {
    this.sidenav.toggle();
  }
  
  closeSidenav(): void {
    if (this.isMobile) {
      this.sidenav.close();
    }
  }
}