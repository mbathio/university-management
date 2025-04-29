// src/app/modules/students/services/student.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Student } from '../../../core/models/user.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class StudentService {
  // Update to include /api in the base URL
  private apiUrl = `${environment.apiUrl}/api/students`;

  constructor(private http: HttpClient) {}

  getAllStudents(): Observable<Student[]> {
    return this.http.get<Student[]>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  getStudentById(id: number): Observable<Student> {
    return this.http.get<Student>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  getStudentByStudentId(studentId: string): Observable<Student> {
    return this.http.get<Student>(`${this.apiUrl}/studentId/${studentId}`)
      .pipe(catchError(this.handleError));
  }

  createStudent(student: any): Observable<Student> {
    return this.http.post<Student>(this.apiUrl, student)
      .pipe(catchError(this.handleError));
  }

  updateStudent(id: number, student: any): Observable<Student> {
    return this.http.put<Student>(`${this.apiUrl}/${id}`, student)
      .pipe(catchError(this.handleError));
  }

  deleteStudent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  getStudentsByFormation(formationId: number): Observable<Student[]> {
    return this.http.get<Student[]>(`${this.apiUrl}/formation/${formationId}`)
      .pipe(catchError(this.handleError));
  }

  getStudentsByPromo(promo: string): Observable<Student[]> {
    return this.http.get<Student[]>(`${this.apiUrl}/promo/${promo}`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Une erreur est survenue';
    
    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      // Erreur côté serveur
      errorMessage = `Code: ${error.status}, Message: ${error.error?.message || 'An unexpected error occurred'}`;
    }
    
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}