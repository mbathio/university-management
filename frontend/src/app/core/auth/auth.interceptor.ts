// src/app/core/interceptors/auth.interceptor.ts
import { HttpInterceptorFn, HttpRequest, HttpEvent, HttpHandler, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  // Only add token to API requests
  const isApiUrl = req.url.startsWith(environment.apiUrl);
  const token = authService.getToken();
  
  // Get CSRF token from cookie for non-GET requests
  const csrfToken = getCsrfToken();
  
  if (token && isApiUrl) {
    // Clone the request with Authorization header
    let headers = req.headers.set('Authorization', `Bearer ${token}`);
    
    // Add CSRF token to header for non-GET requests
    if (req.method !== 'GET' && csrfToken) {
      headers = headers.set('X-CSRF-TOKEN', csrfToken);
    }
    
    const authReq = req.clone({ headers });

    return next(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
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
}