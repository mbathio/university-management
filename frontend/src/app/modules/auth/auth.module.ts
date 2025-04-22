// src/app/core/auth/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { User, LoginRequest, LoginResponse, Role } from '../models/user.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  
  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.currentUserSubject = new BehaviorSubject<User | null>(null);
    this.currentUser = this.currentUserSubject.asObservable();
  }
  
  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }
  
  login(loginRequest: LoginRequest): Observable<User> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, loginRequest)
      .pipe(
        map(response => {
          // Store user details and token in local storage
          localStorage.setItem('user', JSON.stringify({
            username: response.username,
            email: response.email,
            role: response.role
          }));
          localStorage.setItem('token', response.token);
          
          const user: User = {
            id: 0, // This will be populated when user details are fetched
            username: response.username,
            email: response.email,
            role: response.role
          };
          
          this.currentUserSubject.next(user);
          return user;
        })
      );
  }
  
  logout(): void {
    // Remove user from local storage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }
  
  autoLogin(): void {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!userData || !token) {
      return;
    }
    
    try {
      const user: User = JSON.parse(userData);
      this.currentUserSubject.next(user);
    } catch (e) {
      this.logout();
    }
  }
  
  getToken(): string | null {
    return localStorage.getItem('token');
  }
  
  hasRole(roles: Role[]): boolean {
    const user = this.currentUserValue;
    if (!user) return false;
    return roles.includes(user.role);
  }
}