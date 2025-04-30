// src/app/core/auth/auth.interceptor.ts
import { HttpInterceptorFn, HttpRequest, HttpEvent, HttpHandler, HttpHeaders } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  // Get token with consistent key from localStorage
  const token = localStorage.getItem('access_token');
  
  // Get CSRF token from cookie
  const csrfToken = getCsrfToken();
  
  // Only add token to API requests
  const isApiUrl = req.url.startsWith(environment.apiUrl);

  if (token && isApiUrl) {
    // Clone the request and add headers
    const authReq = req.clone({
      headers: req.headers
        .set('Authorization', `Bearer ${token}`)
        // Add CSRF token to header
        .set('X-CSRF-TOKEN', csrfToken || '')
    });

    return next(authReq).pipe(
      catchError((error) => {
        if (error.status === 401) {
          console.log('Unauthorized access attempt - redirecting to login');
          
          // Clear auth data and redirect to login
          authService.logout();
          router.navigate(['/login'], {
            queryParams: { 
              returnUrl: router.url,
              reason: 'session_expired' 
            }
          });
        }
        
        // Rethrow the error for other error handlers
        return throwError(() => error);
      })
    );
  }
  
  // Pass through requests without authentication
  return next(req);
};

// Helper function to extract CSRF token from cookies
function getCsrfToken(): string | null {
  const cookies = document.cookie.split(';');
  const csrfCookie = cookies.find(cookie => cookie.trim().startsWith('XSRF-TOKEN='));
  
  if (csrfCookie) {
    return csrfCookie.split('=')[1];
  }
  
  return null;
};