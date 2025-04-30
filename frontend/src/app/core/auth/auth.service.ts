// src/app/core/auth/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpContext, HttpEvent, HttpResponse, HttpEventType } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { User, Role } from '../models/user.model';
import { Router } from '@angular/router';

interface AuthResponse {
  token: string;
  username: string;
  email: string;
  role: Role;
}

interface TokenRefreshResponse {
  token: string;
}

interface LoginResponse {
  token: string;
  username: string;
  email: string;
  role: Role;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private tokenKey = 'access_token';
  private refreshTokenKey = 'refresh_token';
  private userKey = 'username';
  private roleKey = 'role';
  private tokenExpiryKey = 'token_expiry';

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {
    this.autoLogin();
  }

  // Decode JWT token to get expiration
  private decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace('-', '+').replace('_', '/');
      return JSON.parse(window.atob(base64));
    } catch (error) {
      console.error('Token decoding error:', error);
      return null;
    }
  }

  // Check if token is valid and not expired
  private isTokenValid(token: string): boolean {
    if (!token) return false;

    const decoded = this.decodeToken(token);
    if (!decoded) return false;

    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp > currentTime;
  }

  // Validate token with backend
  private validateToken(): Observable<boolean> {
    return this.http.post<{valid: boolean}>(`${environment.apiUrl}/api/auth/validate`, {})
      .pipe(
        map(response => response.valid),
        catchError(() => of(false))
      );
  }

  // Auto login on app startup
  autoLogin(): void {
    const token = localStorage.getItem(this.tokenKey);
    const username = localStorage.getItem(this.userKey);
    const role = localStorage.getItem(this.roleKey);

    if (token && username && role && this.isTokenValid(token)) {
      const user: User = {
        username,
        role: role as Role,
        id: 0,
        email: ''
      };
      this.currentUserSubject.next(user);

      // Silently validate token in background
      this.validateToken().subscribe(isValid => {
        if (!isValid) {
          this.logout();
        }
      });
    }
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    const token = localStorage.getItem(this.tokenKey);
    return !!token && this.isTokenValid(token);
  }

  // Get current token
  getToken(): string | null {
    const token = localStorage.getItem(this.tokenKey);
    return this.isTokenValid(token || '') ? token : null;
  }

  // Refresh token mechanism
  refreshToken(): Observable<string> {
    const refreshToken = localStorage.getItem(this.refreshTokenKey);
    
    if (!refreshToken) {
      console.warn('No refresh token available');
      return this.handleRefreshError();
    }

    return this.http.post<TokenRefreshResponse>(`${environment.apiUrl}/api/auth/refresh`, { 
      refreshToken 
    }).pipe(
      map(response => {
        if (!response || !response.token) {
          throw new Error('Invalid refresh response');
        }
        
        // Validate new token
        if (!this.isTokenValid(response.token)) {
          throw new Error('New token is invalid');
        }

        // Store new token
        localStorage.setItem(this.tokenKey, response.token);
        
        return response.token;
      }),
      catchError(error => this.handleRefreshError(error))
    );
  }

  private handleRefreshError(error?: any): Observable<never> {
    console.error('Token refresh failed', error);
    
    // Clear all authentication-related data
    this.logout();
    
    // Redirect to login page
    this.router.navigate(['/login'], {
      queryParams: { 
        sessionExpired: 'true' 
      }
    });

    // Throw error to be caught by interceptor
    return throwError(() => new Error('Authentication failed. Please log in again.'));
  }

  // Authenticated request wrapper
  authenticatedRequest<T>(requestFn: () => Observable<T>): Observable<T> {
    if (!this.isLoggedIn()) {
      this.logout();
      return throwError(() => new Error('Not authenticated'));
    }

    return requestFn().pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          return this.refreshToken().pipe(
            switchMap(() => requestFn()),
            catchError(() => {
              this.logout();
              return throwError(() => error);
            })
          );
        }
        return throwError(() => error);
      })
    );
  }

  // Store authentication data
  private storeAuthData(response: LoginResponse): void {
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 24);

    localStorage.setItem(this.tokenKey, response.token);
    localStorage.setItem(this.refreshTokenKey, response.token);
    localStorage.setItem(this.userKey, response.username);
    localStorage.setItem(this.roleKey, response.role);
    localStorage.setItem(this.tokenExpiryKey, expiry.toISOString());

    const user: User = {
      username: response.username,
      role: response.role,
      id: 0,
      email: response.email
    };
    this.currentUserSubject.next(user);
  }

  // Login method
  login(credentials: { username: string, password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/api/auth/login`, credentials)
      .pipe(
        tap((response: LoginResponse) => {
          if (response && response.token) {
            this.storeAuthData(response);
          }
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('Login error:', error);
          
          if (error.status === 401) {
            return throwError(() => new Error('Invalid username or password'));
          } else if (error.status === 403) {
            return throwError(() => new Error('Account not authorized'));
          } else if (error.status === 0) {
            return throwError(() => new Error('Unable to connect to the server'));
          }
          
          return throwError(() => new Error('Login failed'));
        })
      );
  }

  // Logout method
  logout(): void {
    // Clear local storage
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.userKey);
    localStorage.removeItem(this.roleKey);
    localStorage.removeItem(this.tokenExpiryKey);

    // Reset current user
    this.currentUserSubject.next(null);

    // Optional: Call backend logout endpoint
    this.http.post(`${environment.apiUrl}/api/auth/logout`, {})
      .pipe(
        catchError(error => {
          console.warn('Logout backend call failed', error);
          return of(null);
        })
      )
      .subscribe();
  }

  // Role-based authorization
  hasRole(roles: Role[]): boolean {
    const user = this.currentUserSubject.value;
    return user !== null && roles.includes(user.role);
  }

  // Getters
  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  get currentUser(): Observable<User | null> {
    return this.currentUserSubject.asObservable();
  }

  // Add authenticated headers with token
  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    if (!token) {
      console.warn('No authentication token found');
      return new HttpHeaders({
        'Content-Type': 'application/json'
      });
    }
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  register(userData: {
    username: string;
    email: string;
    password: string;
    role: Role;
  }): Observable<any> {
    return this.http.post(`${environment.apiUrl}/api/auth/register`, userData)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Registration error in service:', error);
          return throwError(() => error);
        })
      );
  }
}