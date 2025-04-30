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
  private tokenKey = 'access_token'; // Match key with what's used in login()
  private refreshTokenKey = 'refresh_token';
  private userKey = 'username';
  private roleKey = 'role';
  private tokenExpiryKey = 'token_expiry';

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  get currentUser(): Observable<User | null> {
    return this.currentUserSubject.asObservable();
  }

  autoLogin(): void {
    const token = localStorage.getItem(this.tokenKey);
    const userJson = localStorage.getItem(this.userKey);
    const expiry = localStorage.getItem(this.tokenExpiryKey);

    // Check token expiration
    if (token && userJson && expiry) {
      const expiryDate = new Date(expiry);
      const now = new Date();
      
      // If token is expired or will expire soon (within 5 minutes), attempt refresh
      if (expiryDate <= now) {
        console.log('Token has expired, clearing session');
        this.logout();
        return;
      }
      
      try {
        const user: User = {
          username: userJson,
          role: localStorage.getItem(this.roleKey) as Role,
          id: 0,
          email: ''
        };
        this.currentUserSubject.next(user);
        
        // Validate the token silently in background
        this.validateToken().subscribe({
          next: (isValid) => {
            if (!isValid) {
              this.logout();
            }
          },
          error: () => {
            this.logout();
          }
        });
      } catch (error) {
        console.error('Error parsing stored user', error);
        this.logout();
      }
    }
  }

  login(credentials: { username: string, password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/api/auth/login`, credentials)
      .pipe(
        tap((response: LoginResponse) => {
          if (response && response.token) {
            // Store token securely
            this.storeAuthData(response);
            
            // Update current user subject
            const user: User = {
              username: response.username,
              role: response.role,
              id: 0,
              email: response.email
            };
            this.currentUserSubject.next(user);
          } else {
            console.error('Login response missing token');
            throw new Error('Invalid login response');
          }
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('Login error:', error);
          
          // Detailed error handling
          if (error.status === 401) {
            return throwError(() => new Error('Invalid username or password'));
          } else if (error.status === 429) {
            return throwError(() => new Error('Too many login attempts. Please try again later.'));
          } else if (error.status === 0) {
            return throwError(() => new Error('Unable to connect to the server. Please check your network connection.'));
          } else {
            return throwError(() => new Error(`Login failed: ${error.message}`));
          }
        })
      );
  }

  private storeAuthData(response: LoginResponse): void {
    // Calculate expiry based on server-side token expiration (24 hours)
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 24);
    
    localStorage.setItem(this.tokenKey, response.token);
    localStorage.setItem(this.refreshTokenKey, response.token); // In a real app, use a separate refresh token
    localStorage.setItem(this.userKey, response.username);
    localStorage.setItem(this.roleKey, response.role);
    localStorage.setItem(this.tokenExpiryKey, expiry.toISOString());
  }

  refreshToken(): Observable<string> {
    const refreshToken = localStorage.getItem(this.refreshTokenKey);
    if (!refreshToken) {
      console.error('No refresh token available');
      this.logout();
      return throwError(() => new Error('No refresh token'));
    }

    return this.http.post<TokenRefreshResponse>(
      `${environment.apiUrl}/api/auth/refresh`, 
      { refreshToken }, 
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    ).pipe(
      tap(response => {
        if (response.token) {
          // Update token and expiry
          const expiry = new Date();
          expiry.setHours(expiry.getHours() + 24);
          
          localStorage.setItem(this.tokenKey, response.token);
          localStorage.setItem(this.tokenExpiryKey, expiry.toISOString());
          console.log('Token refreshed successfully');
        } else {
          console.error('Token refresh failed');
          this.logout();
        }
      }),
      map(response => response.token),
      catchError(error => {
        console.error('Token refresh error:', error);
        this.logout();
        return throwError(() => new Error('Token refresh failed'));
      })
    );
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

  logout(): void {
    // Clear localStorage
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.userKey);
    localStorage.removeItem(this.roleKey);
    localStorage.removeItem(this.tokenExpiryKey);

    // Reset current user
    this.currentUserSubject.next(null);

    // Navigate to login page
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    const token = localStorage.getItem(this.tokenKey);
    const expiry = localStorage.getItem(this.tokenExpiryKey);
    
    if (!token || !expiry) {
      return false;
    }
    
    // Check if token is expired
    const expiryDate = new Date(expiry);
    if (expiryDate <= new Date()) {
      this.logout();
      return false;
    }
    
    return true;
  }

  getToken(): string | null {
    // Check if token is expired before returning
    if (!this.isLoggedIn()) {
      return null;
    }
    return localStorage.getItem(this.tokenKey);
  }

  hasRole(roles: Role[]): boolean {
    const user = this.currentUserSubject.value;
    return user !== null && roles.includes(user.role);
  }

  validateToken(): Observable<boolean> {
    return this.http.get<{ valid: boolean }>(`${environment.apiUrl}/api/auth/validate`).pipe(
      map(response => response.valid),
      catchError(() => {
        this.logout();
        return of(false);
      })
    );
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

  // Safe request wrapper that checks token validity
  authenticatedRequest<T>(requestFn: () => Observable<T>): Observable<T> {
    if (!this.isLoggedIn()) {
      console.error('Not logged in');
      this.router.navigate(['/login']);
      return throwError(() => new Error('Not authenticated'));
    }
    
    return requestFn().pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.error('Authentication failed during request');
          this.logout();
          this.router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }
}