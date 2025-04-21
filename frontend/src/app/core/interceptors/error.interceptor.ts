// src/app/core/interceptors/error.interceptor.ts
import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService, private router: Router) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if ([401, 403].includes(error.status) && this.authService.currentUserValue) {
          // auto logout if 401 or 403 response returned from api
          this.authService.logout();
        }
        
        // Custom error handling for user-friendly messages
        const errorMessage = error.error?.message || error.statusText || 'Une erreur est survenue';
        return throwError(() => errorMessage);
      })
    );
  }
}