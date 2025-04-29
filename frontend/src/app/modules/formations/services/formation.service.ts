// frontend/src/app/modules/formations/services/formation.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { Formation } from '../../../core/models/user.model';
import { environment } from '../../../../environments/environment';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class FormationService {
  private apiUrl = `${environment.apiUrl}/api/formations`;

  constructor(private http: HttpClient) {}

  /**
   * Get all formations with secure error handling
   */
  getAllFormations(): Observable<Formation[]> {
    return this.http.get<Formation[]>(this.apiUrl)
      .pipe(
        catchError(this.handleError),
        map(formations => this.sanitizeFormationData(formations))
      );
  }

  /**
   * Get formation by ID with secure error handling
   */
  getFormationById(id: number): Observable<Formation> {
    return this.http.get<Formation>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.handleError),
        map(formation => this.sanitizeFormationData(formation))
      );
  }

  /**
   * Create a new formation with secure error handling and proper headers
   */
  createFormation(formation: Partial<Formation>): Observable<Formation> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    
    return this.http.post<Formation>(this.apiUrl, formation, { headers })
      .pipe(
        catchError(this.handleError),
        map(formation => this.sanitizeFormationData(formation))
      );
  }

  /**
   * Update an existing formation with secure error handling and proper headers
   */
  updateFormation(id: number, formation: Partial<Formation>): Observable<Formation> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    
    return this.http.put<Formation>(`${this.apiUrl}/${id}`, formation, { headers })
      .pipe(
        catchError(this.handleError),
        map(formation => this.sanitizeFormationData(formation))
      );
  }

  /**
   * Delete a formation with secure error handling
   */
  deleteFormation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Get formations by type with secure error handling
   */
  getFormationsByType(type: string): Observable<Formation[]> {
    // Encode type parameter to prevent URL injection
    const encodedType = encodeURIComponent(type);
    return this.http.get<Formation[]>(`${this.apiUrl}/type/${encodedType}`)
      .pipe(
        catchError(this.handleError),
        map(formations => this.sanitizeFormationData(formations))
      );
  }

  /**
   * Get formations by level with secure error handling
   */
  getFormationsByLevel(level: string): Observable<Formation[]> {
    // Encode level parameter to prevent URL injection
    const encodedLevel = encodeURIComponent(level);
    return this.http.get<Formation[]>(`${this.apiUrl}/level/${encodedLevel}`)
      .pipe(
        catchError(this.handleError),
        map(formations => this.sanitizeFormationData(formations) as Formation[])
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
   * Get formation trainers with secure error handling
   */
  getFormationTrainers(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${id}/trainers`)
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
   * Handles HTTP errors and returns a meaningful error message
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Une erreur est survenue';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      // Server-side error
      // Don't expose detailed server-side errors to the client
      switch (error.status) {
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
    if (Array.isArray(data)) {
      return data.map(formation => this.sanitizeFormation(formation)) as T;
    } else {
      return this.sanitizeFormation(data) as T;
    }
  }
  
  /**
   * Sanitizes a single formation object to prevent XSS
   */
  private sanitizeFormation(formation: Formation): Formation {
    if (!formation) return formation;
    
    // Create a new object to avoid modifying the original
    const sanitized = { ...formation };
    
    // Sanitize string fields that might contain user-generated content
    if (sanitized.name) sanitized.name = this.sanitizeString(sanitized.name);
    if (sanitized.description) sanitized.description = this.sanitizeString(sanitized.description);
    if (sanitized.type) sanitized.type = this.sanitizeString(sanitized.type);
    if (sanitized.level) sanitized.level = this.sanitizeString(sanitized.level);
    if (sanitized.fundingType) sanitized.fundingType = this.sanitizeString(sanitized.fundingType);
    
    return sanitized;
  }
  
  /**
   * Basic string sanitization helper
   */
  private sanitizeString(value: string): string {
    return value
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}