// frontend/src/app/modules/formations/services/formation.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Formation } from '../../../core/models/user.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FormationService {
  private apiUrl = `${environment.apiUrl}/formations`;

  constructor(private http: HttpClient) {}

  getAllFormations(): Observable<Formation[]> {
    return this.http.get<Formation[]>(this.apiUrl);
  }

  getFormationById(id: number): Observable<Formation> {
    return this.http.get<Formation>(`${this.apiUrl}/${id}`);
  }

  createFormation(formation: any): Observable<Formation> {
    return this.http.post<Formation>(this.apiUrl, formation);
  }

  updateFormation(id: number, formation: any): Observable<Formation> {
    return this.http.put<Formation>(`${this.apiUrl}/${id}`, formation);
  }

  deleteFormation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getFormationSchedule(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${id}/schedule`);
  }

  getFormationTrainers(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${id}/trainers`);
  }

  getMyFormation(): Observable<Formation> {
    return this.http.get<Formation>(`${this.apiUrl}/my-formation`);
  }

  getFormationsByType(type: string): Observable<Formation[]> {
    return this.http.get<Formation[]>(`${this.apiUrl}/by-type/${type}`);
  }

  getFormationsByLevel(level: string): Observable<Formation[]> {
    return this.http.get<Formation[]>(`${this.apiUrl}/by-level/${level}`);
  }
}
