// src/app/modules/students/services/student.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Student, StudentDto } from '../../../core/models/user.model';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/auth/auth.service';
import { Role } from '../../../core/models/role.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Formation } from '../../formations/formation.model';

@Injectable({
  providedIn: 'root',
})
export class StudentService {
  // Update to include /api in the base URL
  private apiUrl = `${environment.apiUrl}/api/students`;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private snackBar: MatSnackBar
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
    return this.http.get<Student[]>(this.apiUrl, { headers: this.getHeaders() }).pipe(
      tap(students => {
        if (students.length === 0) {
          this.snackBar.open('Aucun étudiant trouvé', 'Fermer', {
            duration: 3000,
            panelClass: ['warning-snackbar']
          });
        }
      }),
      catchError(error => {
        console.error('Students retrieval error:', error);
        
        let errorMessage = 'Erreur lors de la récupération des étudiants';
        if (error instanceof HttpErrorResponse) {
          switch (error.status) {
            case 403:
              errorMessage = 'Accès non autorisé aux étudiants';
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
      birthDate: studentDto.birthDate || new Date(), // Provide a default date if undefined
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
    // Validate input to prevent NaN or invalid ID
    if (!formationId || isNaN(formationId) || formationId <= 0) {
      console.error('Invalid formation ID:', formationId);
      return throwError(() => new Error(`ID de formation invalide: ${formationId}`));
    }

    return this.http.get<Student[]>(`${this.apiUrl}/formation/${formationId}`, { 
      headers: this.getHeaders() 
    }).pipe(
      tap(students => {
        if (students.length === 0) {
          this.snackBar.open(`Aucun étudiant trouvé pour la formation (ID: ${formationId})`, 'Fermer', {
            duration: 3000,
            panelClass: ['warning-snackbar']
          });
        }
      }),
      catchError(error => {
        console.error('Students by formation retrieval error:', error);
        
        let errorMessage = 'Erreur lors de la récupération des étudiants par formation';
        if (error instanceof HttpErrorResponse) {
          switch (error.status) {
            case 404:
              errorMessage = `Aucun étudiant trouvé pour la formation (ID: ${formationId})`;
              break;
            case 403:
              errorMessage = 'Accès non autorisé aux étudiants';
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

  getStudentsByPromo(promo: string): Observable<Student[]> {
    // Validate input to prevent empty or invalid promo
    if (!promo || promo.trim() === '') {
      console.error('Invalid promo:', promo);
      return throwError(() => new Error('Promotion invalide'));
    }

    return this.http.get<Student[]>(`${this.apiUrl}/promo/${promo}`, { 
      headers: this.getHeaders() 
    }).pipe(
      tap(students => {
        if (students.length === 0) {
          this.snackBar.open(`Aucun étudiant trouvé pour la promotion ${promo}`, 'Fermer', {
            duration: 3000,
            panelClass: ['warning-snackbar']
          });
        }
      }),
      catchError(error => {
        console.error('Students by promo retrieval error:', error);
        
        let errorMessage = 'Erreur lors de la récupération des étudiants par promotion';
        if (error instanceof HttpErrorResponse) {
          switch (error.status) {
            case 404:
              errorMessage = `Aucun étudiant trouvé pour la promotion ${promo}`;
              break;
            case 403:
              errorMessage = 'Accès non autorisé aux étudiants';
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

    if (!studentDto.username || studentDto.username.length < 3) {
      errors.push('Le nom d\'utilisateur doit contenir au moins 3 caractères');
    }

    if (!studentDto.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(studentDto.email)) {
      errors.push('Adresse email invalide');
    }

    if (!studentDto.firstName) {
      errors.push('Le prénom est requis');
    }

    if (!studentDto.lastName) {
      errors.push('Le nom est requis');
    }

    return errors;
  }

  private handleStudentCreationError = (error: HttpErrorResponse): Observable<never> => {
    let errorMessage = 'Erreur lors de la création de l\'étudiant';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Erreur client: ${error.error.message}`;
    } else {
      // Server-side error
      switch (error.status) {
        case 400:
          errorMessage = 'Données invalides. Vérifiez les informations saisies.';
          break;
        case 401:
          errorMessage = 'Non autorisé. Veuillez vous reconnecter.';
          break;
        case 403:
          errorMessage = 'Accès refusé. Vous n\'avez pas les permissions nécessaires.';
          break;
        case 409:
          errorMessage = 'Un étudiant avec ces informations existe déjà.';
          break;
        case 500:
          errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
          break;
        default:
          errorMessage = `Erreur ${error.status}: ${error.message}`;
      }
    }

    console.error('Student creation error:', error);
    return throwError(() => new Error(errorMessage));
  }
}