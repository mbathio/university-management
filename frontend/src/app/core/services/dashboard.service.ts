import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAcademicProgress(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/academic/progress/${userId}`);
  }

  getUserDocuments(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/documents/user/${userId}`);
  }

  getClassManagement(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/classes/teacher/${userId}`);
  }

  getResearchDocuments(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/research/documents/${userId}`);
  }

  getSystemOverview(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/system-overview`);
  }

  getSystemNotifications(): Observable<any> {
    return this.http.get(`${this.apiUrl}/notifications/system`);
  }
}