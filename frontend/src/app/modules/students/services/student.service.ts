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
    const token = localStorage.getItem('access_token');
    const csrfToken = this.getCsrfToken();
    
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    
    if (csrfToken) {
      headers = headers.set('X-CSRF-TOKEN', csrfToken);
    }
    
    return headers;
  }

  // Helper method to get CSRF token from cookies
  private getCsrfToken(): string | null {
    const cookies = document.cookie.split(';');
    const csrfCookie = cookies.find(cookie => cookie.trim().startsWith('XSRF-TOKEN='));
    
    if (csrfCookie) {
      return csrfCookie.split('=')[1];
    }
    
    return null;
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
    
    // Validate input before sending
    const validationErrors = this.validateStudentDto(studentDto);
    if (validationErrors.length > 0) {
      return throwError(() => new Error(`Validation failed: ${validationErrors.join(', ')}`));
    }
    
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
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleStudentCreationError)
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
    console.error('An error occurred:', error);
    let errorMessage = 'Une erreur inconnue est survenue';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Code d'erreur: ${error.status}\nMessage: ${error.error?.message || error.statusText}`;
    }
    
    return throwError(() => new Error(errorMessage));
  }

  private validateStudentDto(studentDto: StudentDto): string[] {
    const errors: string[] = [];

    // Username validation
    if (!studentDto.username || studentDto.username.length < 3 || studentDto.username.length > 50) {
      errors.push('Username must be between 3 and 50 characters');
    }

    // Password validation
    if (!studentDto.password || studentDto.password.length < 6) {
      errors.push('Password must be at least 6 characters');
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!studentDto.email || !emailRegex.test(studentDto.email)) {
      errors.push('Invalid email format');
    }

    // Student ID validation
    const studentIdRegex = /^[a-zA-Z0-9]+$/;
    if (!studentDto.studentId || !studentIdRegex.test(studentDto.studentId)) {
      errors.push('Student ID must be alphanumeric');
    }

    // First name validation
    if (!studentDto.firstName || studentDto.firstName.length < 2 || studentDto.firstName.length > 50) {
      errors.push('First name must be between 2 and 50 characters');
    }

    // Last name validation
    if (!studentDto.lastName || studentDto.lastName.length < 2 || studentDto.lastName.length > 50) {
      errors.push('Last name must be between 2 and 50 characters');
    }

    // Birth date validation (optional)
    if (studentDto.birthDate && new Date(studentDto.birthDate) > new Date()) {
      errors.push('Birth date must be in the past');
    }

    // Formation ID validation
    if (studentDto.formationId && studentDto.formationId <= 0) {
      errors.push('Formation ID must be a positive number');
    }

    // Promo validation
    if (studentDto.promo && studentDto.promo.length > 10) {
      errors.push('Promo must be less than 10 characters');
    }

    // Start year validation
    if (studentDto.startYear && (studentDto.startYear < 1900 || studentDto.startYear > 2100)) {
      errors.push('Start year must be between 1900 and 2100');
    }

    // End year validation
    if (studentDto.endYear && (studentDto.endYear < 1900 || studentDto.endYear > 2100)) {
      errors.push('End year must be between 1900 and 2100');
    }

    return errors;
  }

  private handleStudentCreationError(error: HttpErrorResponse) {
    console.error('Student creation error:', error);
    
    let errorMessage = 'An unknown error occurred';
    
    if (error.status === 409) {
      errorMessage = 'A student with this username already exists';
    } else if (error.status === 400) {
      errorMessage = error.error?.message || 'Invalid student data';
    }
    
    return throwError(() => new Error(errorMessage));
  }
}