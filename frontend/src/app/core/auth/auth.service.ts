// src/app/core/auth/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { User, Role } from '../models/user.model';
import { Router } from '@angular/router';

interface AuthResponse {
  token: string;
  user: User;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private tokenKey = 'auth_token';
  private userKey = 'current_user';

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  get currentUser(): Observable<User | null> {
    return this.currentUserSubject.asObservable();
  }

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  autoLogin(): void {
    const token = localStorage.getItem(this.tokenKey);
    const userJson = localStorage.getItem(this.userKey);

    if (token && userJson) {
      try {
        const user: User = JSON.parse(userJson);
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('Error parsing stored user', error);
        this.logout();
      }
    }
  }

  login(username: string, password: string): Observable<User> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/api/auth/login`, {
        username,
        password,
      })
      .pipe(
        map((response) => {
          // Store token and user in localStorage
          localStorage.setItem(this.tokenKey, response.token);
          localStorage.setItem(this.userKey, JSON.stringify(response.user));

          // Update currentUserSubject
          this.currentUserSubject.next(response.user);
          return response.user;
        }),
      );
  }

  register(userData: {
    username: string;
    email: string;
    password: string;
  }): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${environment.apiUrl}/api/auth/register`,
      userData,
    );
  }

  logout(): void {
    // Clear localStorage
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);

    // Reset current user
    this.currentUserSubject.next(null);

    // Navigate to login page
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  hasRole(roles: Role[]): boolean {
    const user = this.currentUserValue;
    return user !== null && roles.includes(user.role);
  }

  validateToken(): Observable<boolean> {
    const token = this.getToken();
    if (!token) {
      return of(false);
    }

    return this.http
      .post<{ valid: boolean }>(`${environment.apiUrl}/api/auth/validate`, {})
      .pipe(
        map((response) => response.valid),
        catchError(() => of(false)),
      );
  }
}
