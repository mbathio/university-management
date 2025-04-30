// src/app/core/auth/auth.interceptor.ts
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

// Helper function to get CSRF token from cookie
function getCsrfToken(): string | null {
  const csrfCookie = document.cookie.split('; ').find(row => row.startsWith('XSRF-TOKEN='));
  return csrfCookie ? csrfCookie.split('=')[1] : null;
}

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const snackBar = inject(MatSnackBar);

  // Get token with consistent key from localStorage
  const token = localStorage.getItem('access_token');
  
  // Get CSRF token from cookie
  const csrfToken = getCsrfToken();
  
  // Only add token to API requests
  const isApiUrl = req.url.startsWith(environment.apiUrl);

  // Skip token for login and refresh endpoints
  const isAuthUrl = req.url.includes('/auth/login') || req.url.includes('/auth/refresh');

  if (token && isApiUrl && !isAuthUrl) {
    // Clone the request and add headers
    const authReq = req.clone({
      headers: req.headers
        .set('Authorization', `Bearer ${token}`)
        .set('X-XSRF-TOKEN', csrfToken || '')
        .set('XSRF-TOKEN', csrfToken || '')
    });

    return next(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('HTTP Interceptor Error:', {
          status: error.status,
          message: error.message,
          url: req.url
        });

        // Handle specific error scenarios
        if (error.status === 0) {
          // Network or connection error
          snackBar.open(
            'Impossible de se connecter au serveur. Vérifiez votre connexion réseau.', 
            'Fermer', 
            { duration: 5000, panelClass: ['error-snackbar'] }
          );
        } else if (error.status === 401) {
          // Unauthorized - attempt token refresh or redirect to login
          handleUnauthorizedError(error, authService, router, snackBar);
        } else if (error.status === 403) {
          // Forbidden - insufficient permissions
          snackBar.open(
            'Vous n\'avez pas les permissions nécessaires.', 
            'Fermer', 
            { duration: 5000, panelClass: ['warning-snackbar'] }
          );
        } else if (error.status === 500) {
          // Server error
          snackBar.open(
            'Une erreur interne du serveur s\'est produite.', 
            'Fermer', 
            { duration: 5000, panelClass: ['error-snackbar'] }
          );
        }

        // Re-throw the error to allow component-level error handling
        return throwError(() => error);
      })
    );
  }

  // If no token or not an API request, proceed normally
  return next(req);
};

function handleUnauthorizedError(error: HttpErrorResponse, authService: AuthService, router: Router, snackBar: MatSnackBar): void {
  // Attempt token refresh or redirect to login
  authService.logout();
  router.navigate(['/login'], {
    queryParams: { 
      returnUrl: router.url,
      error: 'Votre session a expiré. Veuillez vous reconnecter.'
    }
  });
}