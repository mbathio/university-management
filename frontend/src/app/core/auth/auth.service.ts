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
  user: User;
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
  private tokenKey = 'token';
  private userKey = 'username';
  private roleKey = 'role';

  refreshToken(): Observable<string> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      console.error('No refresh token available');
      this.logout();
      return throwError(() => new Error('No refresh token'));
    }

    return this.http.post<TokenRefreshResponse>(`${environment.apiUrl}/api/auth/refresh`, 
      { refreshToken }, 
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    ).pipe(
      tap(response => {
        if (response.token) {
          localStorage.setItem(this.tokenKey, response.token);
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

  private handleAuthError<T>(observable: Observable<HttpEvent<T>>): Observable<HttpEvent<T>> {
    return observable.pipe(
      catchError((error: HttpErrorResponse) => {
        // Check if the error is an unauthorized error (401)
        if (error.status === 401) {
          return this.refreshToken().pipe(
            switchMap(() => {
              // Use HttpContext to retrieve the original request
              const originalRequest = error.error.originalRequest || error.error.request;
              
              if (!originalRequest) {
                // If no original request is found, logout
                this.logout();
                return throwError(() => error);
              }
              
              // Retry the original request with the new token
              return observable;
            }),
            catchError(() => {
              this.logout();
              return throwError(() => error);
            })
          );
        }
        
        // For non-401 errors, simply rethrow
        return throwError(() => error);
      })
    );
  }

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

    if (token && userJson) {
      try {
        const user: User = {
          username: userJson,
          role: localStorage.getItem(this.roleKey) as Role,
          id: 0,
          email: ''
        };
        this.currentUserSubject.next(user);
        // Validate the token silently in background
        this.validateToken().subscribe();
      } catch (error) {
        console.error('Error parsing stored user', error);
        this.logout();
      }
    }
  }

  login(credentials: { username: string, password: string }): Observable<HttpEvent<LoginResponse>> {
    return this.handleAuthError(
      this.http.post<LoginResponse>(`${environment.apiUrl}/api/auth/login`, credentials, { observe: 'events' })
    ).pipe(
      tap((event: HttpEvent<LoginResponse>) => {
        if (event.type === HttpEventType.Response) {
          const response = event.body;
          // Add null check before accessing response properties
          if (response) {
            // Store token in localStorage with the correct key
            localStorage.setItem('access_token', response.token);
            localStorage.setItem('refresh_token', response.token); // Consider using a separate refresh token if available
            
            // Store user details
            localStorage.setItem('username', response.username);
            localStorage.setItem('role', response.role);
            
            console.log('Login Response:', JSON.stringify(response, null, 2));
            
            // Update current user subject
            const user: User = {
              username: response.username,
              role: response.role,
              id: 0, // You might want to include user ID from the response
              email: response.email
            };
            this.currentUserSubject.next(user);
          } else {
            console.error('Login response is null');
            // Optionally handle the error case, e.g., show a notification
          }
        }
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Login error:', error);
        
        // Detailed error handling
        if (error.status === 401) {
          // Unauthorized - invalid credentials
          return throwError(() => new Error('Invalid username or password'));
        } else if (error.status === 0) {
          // Network error or server unreachable
          return throwError(() => new Error('Unable to connect to the server. Please check your network connection.'));
        } else {
          // Other HTTP errors
          return throwError(() => new Error(`Login failed: ${error.message}`));
        }
      })
    );
  }

  register(userData: {
    username: string;
    email: string;
    password: string;
    role: Role;
  }): Observable<HttpEvent<AuthResponse>> {
    return this.handleAuthError(
      this.http.post<AuthResponse>(`${environment.apiUrl}/api/auth/register`, userData, { observe: 'events' })
    ).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Registration error in service:', error);
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    // Clear localStorage
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    localStorage.removeItem(this.roleKey);

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
    const user = this.currentUserSubject.value;
    return user !== null && roles.includes(user.role);
  }

  validateToken(): Observable<boolean> {
    const token = this.getToken();
    if (!token) {
      return of(false);
    }

    // Use the backend endpoint to validate the token
    return this.http.get<boolean>(`${environment.apiUrl}/auth/validate-token`).pipe(
      map(isValid => {
        if (!isValid) {
          this.logout(); // Clear token if invalid
        }
        return isValid;
      }),
      catchError(() => {
        this.logout(); // Logout on any error
        return of(false);
      })
    );
  }

  // Add authenticated headers with token
  private getAuthHeaders(): HttpHeaders {
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

  // Validate token before making requests
  private ensureValidToken(): Observable<boolean> {
    return this.validateToken().pipe(
      tap(isValid => {
        if (!isValid) {
          console.error('Token is invalid. Logging out.');
          this.logout();
        }
      })
    );
  }

  // Wrapper method for authenticated requests
  authenticatedRequest<T>(request: Observable<T>): Observable<T> {
    return this.ensureValidToken().pipe(
      switchMap(isValid => {
        if (!isValid) {
          return throwError(() => new Error('Invalid authentication token'));
        }
        return request;
      })
    );
  }
}