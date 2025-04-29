// src/app/core/auth/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
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
  private tokenKey = 'token';
  private userKey = 'username';
  private roleKey = 'role';

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

  login(credentials: { username: string, password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/api/auth/login`, credentials).pipe(
      tap(response => {
        console.log('Login Response:', JSON.stringify(response, null, 2));
        if (response.token) {
          localStorage.setItem(this.tokenKey, response.token);
          localStorage.setItem(this.userKey, response.username);
          localStorage.setItem(this.roleKey, response.role.toString());
          console.log('Stored Role:', response.role.toString());
        }
      }),
      catchError(error => {
        console.error('Login error:', error);
        return throwError(() => new Error('Login failed'));
      })
    );
  }

  register(userData: {
    username: string;
    email: string;
    password: string;
    role: Role;
  }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${environment.apiUrl}/api/auth/register`,
      userData,
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
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No token found in localStorage');
      return null;
    }
    return token;
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
      .get<{ valid: boolean }>(`${environment.apiUrl}/api/auth/validate`, {
        headers: new HttpHeaders({
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        })
      })
      .pipe(
        map((response) => {
          console.log('Token validation response:', response);
          return response.valid;
        }),
        catchError((error) => {
          console.error('Token validation error:', error);
          if (error.status === 401 || error.status === 403) {
            this.logout(); // Logout if token is invalid
          }
          return of(false);
        })
      );
  }
}

export interface LoginResponse {
  token: string;
  username: string;
  email: string;
  role: Role;
}