// frontend/src/app/modules/formations/services/formation.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { Formation } from '../../../core/models/user.model';
import { environment } from '../../../../environments/environment';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class FormationService {
  private apiUrl = `${environment.apiUrl}/formations`;

  constructor(private http: HttpClient) {}

  getAllFormations(): Observable<Formation[]> {
    return this.http.get<Formation[]>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  getFormationById(id: number): Observable<Formation> {
    return this.http.get<Formation>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  createFormation(formation: Partial<Formation>): Observable<Formation> {
    return this.http.post<Formation>(this.apiUrl, formation)
      .pipe(catchError(this.handleError));
  }

  updateFormation(id: number, formation: Partial<Formation>): Observable<Formation> {
    return this.http.put<Formation>(`${this.apiUrl}/${id}`, formation)
      .pipe(catchError(this.handleError));
  }

  deleteFormation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  getFormationSchedule(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${id}/schedule`)
      .pipe(catchError(this.handleError));
  }

  getFormationTrainers(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${id}/trainers`)
      .pipe(catchError(this.handleError));
  }

  getMyFormation(): Observable<Formation> {
    return this.http.get<Formation>(`${this.apiUrl}/my-formation`)
      .pipe(catchError(this.handleError));
  }

  getFormationsByType(type: string): Observable<Formation[]> {
    return this.http.get<Formation[]>(`${this.apiUrl}/by-type/${type}`)
      .pipe(catchError(this.handleError));
  }

  getFormationsByLevel(level: string): Observable<Formation[]> {
    return this.http.get<Formation[]>(`${this.apiUrl}/by-level/${level}`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Une erreur est survenue';
    
    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      // Erreur côté serveur
      errorMessage = `Code: ${error.status}, Message: ${error.error?.message || error.statusText}`;
    }
    
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}