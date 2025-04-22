// src/app/core/auth/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { User, LoginRequest, LoginResponse, Role } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    const storedUser = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(loginRequest: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, loginRequest)
      .pipe(map(response => {
        // Store user details and jwt token in local storage
        const user: User = {
          id: 0, // We don't have id from backend in login response
          username: response.username,
          email: response.email,
          role: response.role
        };
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('token', response.token);
        this.currentUserSubject.next(user);
        return response;
      }));
  }

  logout(): void {
    // Remove user from local storage and set current user to null
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!this.currentUserValue;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  hasRole(roles: Role[]): boolean {
    const user = this.currentUserValue;
    if (!user) return false;
    return roles.includes(user.role);
  }

  isAdmin(): boolean {
    return this.hasRole([Role.ADMIN]);
  }

  isTeacher(): boolean {
    return this.hasRole([Role.TEACHER]);
  }

  isStudent(): boolean {
    return this.hasRole([Role.STUDENT]);
  }

  isFormationManager(): boolean {
    return this.hasRole([Role.FORMATION_MANAGER]);
  }

  isAdministration(): boolean {
    return this.hasRole([Role.ADMINISTRATION]);
  }

  isTutor(): boolean {
    return this.hasRole([Role.TUTOR]);
  }
}