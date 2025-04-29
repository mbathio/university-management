// src/app/modules/students/services/student.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Student, StudentDto, Formation } from '../../../core/models/user.model';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/auth/auth.service';
import { Role } from '../../../core/models/role.model';

@Injectable({
  providedIn: 'root',
})
export class StudentService {
  // Update to include /api in the base URL
  private apiUrl = `${environment.apiUrl}/api/students`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getAllStudents(): Observable<Student[]> {
    return this.http.get<Student[]>(this.apiUrl, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getStudentById(id: number): Observable<Student> {
    return this.http.get<Student>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getStudentByStudentId(studentId: string): Observable<Student> {
    return this.http.get<Student>(`${this.apiUrl}/studentId/${studentId}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  createStudent(studentDto: StudentDto): Observable<Student> {
    console.log('Creating student with role:', localStorage.getItem('role'));
    console.log('Student data:', JSON.stringify(studentDto, null, 2));
    
    // Create a complete Student object from StudentDto
    const studentToCreate: Student = {
      ...studentDto,
      id: 0, // Backend will assign the actual ID
      role: Role.STUDENT, // Default role for new students
      user: {
        id: 0, // Backend will assign the actual user ID
        username: studentDto.username,
        email: studentDto.email,
        role: Role.STUDENT
      },
      currentFormation: studentDto.formationId 
      ? ({ id: studentDto.formationId } as Formation) 
      : undefined
    };
    
    return this.http.post<Student>(this.apiUrl, studentToCreate, { 
      headers: this.getHeaders(),
      observe: 'response'  // Capture full HTTP response
    }).pipe(
      map(response => {
        console.log('Student creation response:', response);
        if (!response.body) {
          throw new Error('No student data returned from server');
        }
        return response.body;
      }),
      catchError(error => {
        console.error('Student creation error details:', {
          status: error.status,
          message: error.message,
          headers: error.headers,
          body: error.error
        });
        
        if (error.status === 403) {
          console.error('Access Forbidden: Detailed error information', {
            currentRole: localStorage.getItem('role'),
            requiredRole: 'ADMIN'
          });
        }
        
        return throwError(() => new Error(`Student creation failed: ${error.message}`));
      })
    );
  }

  updateStudent(id: number, student: any): Observable<Student> {
    return this.http.put<Student>(`${this.apiUrl}/${id}`, student, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  deleteStudent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(
        catchError((error: HttpErrorResponse) => {
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
        })
      );
  }

  getStudentsByFormation(formationId: number): Observable<Student[]> {
    return this.http.get<Student[]>(`${this.apiUrl}/formation/${formationId}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getStudentsByPromo(promo: string): Observable<Student[]> {
    return this.http.get<Student[]>(`${this.apiUrl}/promo/${promo}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 403) {
      console.error('Access Forbidden: You do not have permission to perform this action.');
      // Optionally, show a user-friendly notification
      // this.notificationService.showError('You do not have permission to create a student.');
    }
    return throwError(() => new Error('An error occurred: ' + error.message));
  }
}