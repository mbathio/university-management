// frontend/src/app/modules/formations/services/formation.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, tap } from 'rxjs';
import { Formation } from '../../../core/models/user.model';
import { environment } from '../../../../environments/environment';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from '../../../core/auth/auth.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class FormationService {
  private apiUrl = `${environment.apiUrl}/api/formations`;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  /**
   * Get all formations with secure error handling
   */
  getAllFormations(): Observable<Formation[]> {
    return this.http.get<Formation[]>(this.apiUrl).pipe(
      tap(formations => {
        if (formations.length === 0) {
          this.snackBar.open('Aucune formation trouvée', 'Fermer', {
            duration: 3000,
            panelClass: ['warning-snackbar']
          });
        }
      }),
      catchError(error => {
        console.error('Formations retrieval error:', error);
        
        let errorMessage = 'Erreur lors de la récupération des formations';
        if (error instanceof HttpErrorResponse) {
          switch (error.status) {
            case 403:
              errorMessage = 'Accès non autorisé aux formations';
              break;
            case 500:
              errorMessage = 'Erreur interne du serveur';
              break;
          }
        }

        this.snackBar.open(errorMessage, 'Fermer', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });

        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Get formation by ID with secure error handling
   */
  getFormationById(id: number): Observable<Formation> {
    // Validate input to prevent NaN or invalid ID
    if (!id || isNaN(id) || id <= 0) {
      console.error('Invalid formation ID:', id);
      return throwError(() => new Error(`ID de formation invalide: ${id}`));
    }

    return this.http.get<Formation>(`${this.apiUrl}/${id}`).pipe(
      tap(formation => {
        if (!formation) {
          console.warn(`Aucune formation trouvée pour l'ID: ${id}`);
        }
      }),
      catchError(error => {
        console.error('Formation retrieval error:', error);
        
        let errorMessage = 'Erreur lors de la récupération de la formation';
        if (error instanceof HttpErrorResponse) {
          switch (error.status) {
            case 404:
              errorMessage = `Formation non trouvée (ID: ${id})`;
              break;
            case 403:
              errorMessage = 'Accès non autorisé à la formation';
              break;
            case 500:
              errorMessage = 'Erreur interne du serveur';
              break;
          }
        }

        this.snackBar.open(errorMessage, 'Fermer', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });

        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Get formations by type with secure error handling
   */
  getFormationsByType(type: string): Observable<Formation[]> {
    const encodedType = encodeURIComponent(type);
    return this.authenticatedRequest(() => 
      this.http.get<Formation[]>(`${this.apiUrl}/type/${encodedType}`)
    ).pipe(
      map(formations => this.sanitizeFormationData(formations)),
      catchError(this.handleError)
    );
  }

  /**
   * Get formations by level with secure error handling
   */
  getFormationsByLevel(level: string): Observable<Formation[]> {
    const encodedLevel = encodeURIComponent(level);
    return this.authenticatedRequest(() => 
      this.http.get<Formation[]>(`${this.apiUrl}/level/${encodedLevel}`)
    ).pipe(
      map(formations => this.sanitizeFormationData(formations)),
      catchError(this.handleError)
    );
  }

  /**
   * Get formation trainers with secure error handling
   */
  getFormationTrainers(id: number): Observable<any[]> {
    return this.authenticatedRequest(() => 
      this.http.get<any[]>(`${this.apiUrl}/${id}/trainers`)
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Create a new formation
   */
  createFormation(formation: Formation): Observable<Formation> {
    return this.authenticatedRequest(() => 
      this.http.post<Formation>(this.apiUrl, formation)
    ).pipe(
      map(newFormation => this.sanitizeFormationData(newFormation)),
      catchError(this.handleError)
    );
  }

  /**
   * Update an existing formation
   */
  updateFormation(formation: Formation): Observable<Formation> {
    return this.authenticatedRequest(() => 
      this.http.put<Formation>(`${this.apiUrl}/${formation.id}`, formation)
    ).pipe(
      map(updatedFormation => this.sanitizeFormationData(updatedFormation)),
      catchError(this.handleError)
    );
  }

  /**
   * Delete a formation
   */
  deleteFormation(id: number): Observable<void> {
    return this.authenticatedRequest(() => 
      this.http.delete<void>(`${this.apiUrl}/${id}`)
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get formation schedule with secure error handling
   */
  getFormationSchedule(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${id}/schedule`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Get current user's formation with secure error handling
   */
  getMyFormation(): Observable<Formation> {
    return this.http.get<Formation>(`${this.apiUrl}/my-formation`)
      .pipe(
        catchError(this.handleError),
        map(formation => this.sanitizeFormationData(formation) as Formation)
      );
  }

  /**
   * Authenticated request wrapper
   */
  private authenticatedRequest<T>(requestFn: () => Observable<T>): Observable<T> {
    if (!this.authService.isLoggedIn()) {
      this.snackBar.open('Vous devez vous connecter', 'Fermer', { duration: 3000 });
      this.router.navigate(['/login']);
      return throwError(() => new Error('Not authenticated'));
    }

    return requestFn().pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 || error.status === 403) {
          this.authService.logout();
          this.router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }

  /**
   * Handle HTTP errors with detailed error messages
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Une erreur est survenue';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      // Server-side error
      switch (error.status) {
        case 400:
          errorMessage = 'Requête invalide. Vérifiez vos données.';
          break;
        case 401:
          errorMessage = 'Non autorisé. Veuillez vous connecter.';
          break;
        case 403:
          errorMessage = 'Accès refusé. Vous n\'avez pas les droits nécessaires.';
          break;
        case 404:
          errorMessage = 'Ressource non trouvée.';
          break;
        case 500:
          errorMessage = 'Erreur interne du serveur. Veuillez réessayer plus tard.';
          break;
        default:
          errorMessage = `Erreur: ${error.status}`;
          break;
      }
    }

    console.error('Formation service error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Sanitizes formation data to prevent XSS
   * Can be applied to a single formation or an array
   */
  private sanitizeFormationData<T extends Formation | Formation[]>(data: T): T {
    const sanitize = (formation: Formation): Formation => ({
      ...formation,
      name: this.sanitizeString(formation.name),
      description: this.sanitizeString(formation.description)
    });

    if (Array.isArray(data)) {
      return data.map(sanitize) as T;
    } else {
      return sanitize(data as Formation) as T;
    }
  }

  /**
   * Basic string sanitization to prevent XSS
   */
  private sanitizeString(input: string | undefined): string {
    if (!input) return '';
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}