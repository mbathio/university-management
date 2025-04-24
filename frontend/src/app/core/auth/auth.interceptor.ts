// src/app/core/auth/auth.interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
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
        // Redirect to login if 401 Unauthorized response
        if (error.status === 401) {
          authService.logout();
          router.navigate(['/login']);
        }
        return throwError(() => error);
      }),
    );
  }

  return next(req);
};
