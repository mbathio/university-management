import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User, LoginRequest, LoginResponse, Role } from '../models/user.model';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  private apiUrl = `${environment.apiUrl}/auth`;
  private tokenExpirationTimer: any;

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {
    const storedUser = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null,
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(username: string, password: string): Observable<LoginResponse> {
    const loginRequest: LoginRequest = { username, password };
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/login`, loginRequest)
      .pipe(
        map((response) => {
          // Store user details and jwt token in local storage to keep user logged in
          const user: User = {
            id: 0, // We don't have the ID in the response
            username: response.username,
            email: response.email,
            role: response.role,
          };

          // Store token with expiration (assuming JWT has standard exp claim)
          this.storeUserData(user, response.token);

          this.currentUserSubject.next(user);
          return response;
        }),
      );
  }

  logout(): void {
    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('tokenExpiration');
    localStorage.removeItem('currentUser');

    // Clear any timeout
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }

    // Reset the current user subject
    this.currentUserSubject.next(null);

    // Navigate to login page
    this.router.navigate(['/login']);
  }

  hasRole(requiredRoles: Role[]): boolean {
    const currentUser = this.currentUserValue;
    return (
      !!currentUser && requiredRoles.some((role) => role === currentUser.role)
    );
  }

  isLoggedIn(): boolean {
    return !!this.getToken() && !!this.currentUserValue;
  }

  getToken(): string | null {
    const expiration = localStorage.getItem('tokenExpiration');
    const token = localStorage.getItem('token');

    if (!expiration || !token) {
      return null;
    }

    // Check if token is expired
    if (new Date(expiration) <= new Date()) {
      this.logout();
      return null;
    }

    return token;
  }

  private storeUserData(user: User, token: string): void {
    // Set token expiration to 1 hour from now (adjust based on your JWT config)
    const expirationDate = new Date(new Date().getTime() + 3600 * 1000);

    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('token', token);
    localStorage.setItem('tokenExpiration', expirationDate.toISOString());

    // Auto logout when token expires
    this.autoLogoutOnExpiration(3600 * 1000);
  }

  private autoLogoutOnExpiration(expirationDuration: number): void {
    this.tokenExpirationTimer = setTimeout(() => {
      this.logout();
    }, expirationDuration);
  }

  autoLogin(): void {
    const token = this.getToken(); // This already checks expiration
    const storedUser = localStorage.getItem('currentUser');
    const expiration = localStorage.getItem('tokenExpiration');

    if (token && storedUser && expiration) {
      try {
        const user: User = JSON.parse(storedUser);
        this.currentUserSubject.next(user);

        // Set timer for auto logout
        const expirationDate = new Date(expiration);
        const expirationDuration =
          expirationDate.getTime() - new Date().getTime();
        if (expirationDuration > 0) {
          this.autoLogoutOnExpiration(expirationDuration);
        }
      } catch (error) {
        console.error('Failed to parse stored user', error);
        this.logout();
      }
    }
  }
}
