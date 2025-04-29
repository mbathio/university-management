// src/app/core/auth/auth.interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { catchError, switchMap } from 'rxjs/operators';
import { throwError, of } from 'rxjs';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  // Add token only for API requests
  const isApiUrl = req.url.startsWith(environment.apiUrl);

  if (token && isApiUrl) {
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });

    return next(clonedRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        // Handle different types of authentication errors
        if (error.status === 401) {
          // Try to refresh the token
          return authService.refreshToken().pipe(
            switchMap((newToken) => {
              // If token refresh is successful, retry the original request
              const retryRequest = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${newToken}`,
                },
              });
              return next(retryRequest);
            }),
            catchError((refreshError) => {
              // If token refresh fails, logout and redirect to login
              console.error('Token refresh failed', refreshError);
              authService.logout();
              router.navigate(['/login'], {
                queryParams: { 
                  returnUrl: router.url,
                  reason: 'session_expired' 
                }
              });
              return throwError(() => refreshError);
            })
          );
        }
        
        // For other errors, just rethrow
        return throwError(() => error);
      })
    );
  }

  return next(req);
};