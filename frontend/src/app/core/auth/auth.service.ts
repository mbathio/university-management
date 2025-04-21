// src/app/core/auth/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse } from '../models/auth.model';
import { Router } from '@angular/router';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  constructor(private http: HttpClient, private router: Router) {
    const storedUser = localStorage.getItem(environment.jwt.userKey);
    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(loginRequest: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, loginRequest)
      .pipe(
        tap(response => {
          // store jwt token and user info in local storage
          localStorage.setItem(environment.jwt.tokenKey, response.token);
          
          const user: User = {
            username: response.username,
            email: response.email,
            role: response.role
          };
          
          localStorage.setItem(environment.jwt.userKey, JSON.stringify(user));
          this.currentUserSubject.next(user);
        })
      );
  }

  register(user: User): Observable<User> {
    return this.http.post<User>(`${environment.apiUrl}/auth/register`, user);
  }

  logout(): void {
    // remove user from local storage
    localStorage.removeItem(environment.jwt.tokenKey);
    localStorage.removeItem(environment.jwt.userKey);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    return localStorage.getItem(environment.jwt.tokenKey);
  }

  validateToken(): Observable<boolean> {
    if (!this.getToken()) {
      return of(false);
    }
    
    return this.http.get<string>(`${environment.apiUrl}/auth/validate`)
      .pipe(
        map(() => true),
        catchError(() => {
          this.logout();
          return of(false);
        })
      );
  }

  hasRole(role: string | string[]): boolean {
    const user = this.currentUserValue;
    if (!user) return false;

    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    return user.role === role;
  }
}