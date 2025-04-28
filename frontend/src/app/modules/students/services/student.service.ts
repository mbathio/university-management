// src/app/modules/students/services/student.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Student } from '../../../core/models/user.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class StudentService {
  private apiUrl = `${environment.apiUrl}/students`;

  constructor(private http: HttpClient) {}

  getAllStudents(): Observable<Student[]> {
    return this.http.get<Student[]>(this.apiUrl);
  }

  getStudentById(id: number): Observable<Student> {
    return this.http.get<Student>(`${this.apiUrl}/${id}`);
  }

  getStudentByStudentId(studentId: string): Observable<Student> {
    return this.http.get<Student>(`${this.apiUrl}/studentId/${studentId}`);
  }

  createStudent(student: any): Observable<Student> {
    return this.http.post<Student>(this.apiUrl, student);
  }

  updateStudent(id: number, student: any): Observable<Student> {
    return this.http.put<Student>(`${this.apiUrl}/${id}`, student);
  }

  deleteStudent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getStudentsByFormation(formationId: number): Observable<Student[]> {
    return this.http.get<Student[]>(`${this.apiUrl}/formation/${formationId}`);
  }

  getStudentsByPromo(promo: string): Observable<Student[]> {
    return this.http.get<Student[]>(`${this.apiUrl}/promo/${promo}`);
  }
}