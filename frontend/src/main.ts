// src/main.ts (ajout des fonctions d'intercepteur)

import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AuthInterceptor } from './app/core/auth/auth.interceptor';
import { ErrorInterceptor } from './app/core/error/error.interceptor'; // À créer si elle n'existe pas

// Créer les fonctions d'intercepteur
const jwtInterceptor = (req, next) => {
  // Implementer la logique de l'intercepteur JWT ici
  const authService = inject(AuthService);
  const router = inject(Router);
  
  // Get the token from auth service
  const token = authService.getToken();

  // Clone the request and add authorization header if token exists
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // Handle the request and catch errors
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle 401 Unauthorized or 403 Forbidden errors
      if (error.status === 401 || error.status === 403) {
        // Token might be expired or invalid, redirect to login
        authService.logout();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};

const errorInterceptor = (req, next) => {
  // Implementer la logique de l'intercepteur d'erreur ici
  return next(req).pipe(
    catchError(error => {
      console.error('Erreur HTTP:', error);
      return throwError(() => error);
    })
  );
};

// Utiliser ces fonctions dans le provider
provideHttpClient(
  withInterceptors([jwtInterceptor, errorInterceptor])
)