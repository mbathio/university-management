// frontend/src/app/modules/students/student-detail/student-detail.component.ts
import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Location } from '@angular/common';

// Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

// Service and Model Imports
import { StudentService } from '../services/student.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Role } from '../../../core/models/user.model';

// RxJS Imports
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { DatePipe } from '@angular/common';

export interface Student {
  id: number; // Added id property
  firstName: string;
  lastName: string;
  studentId: string;
  birthDate?: Date;
  promo?: string;
  startYear?: number;
  endYear?: number;
  user?: {
    email: string;
  };
  username?: string; // Added username property
  role?: Role; // Added role property
  formationName?: string; // Added formationName property
}

@Component({
  selector: 'app-student-detail',
  templateUrl: './student-detail.component.html',
  styleUrls: ['./student-detail.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    RouterModule,
    DatePipe,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class StudentDetailComponent implements OnInit {
  student: Student | null = null;
  loading = true;
  error = '';
  isCurrentUserProfile = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private studentService: StudentService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private location: Location,
  ) {}

  ngOnInit(): void {
    // Check if this is the current user's profile
    if (this.router.url === '/students/profile') {
      this.isCurrentUserProfile = true;
      this.loadCurrentUserProfile();
    } else {
      // Otherwise load the student by ID from the route parameter
      const studentId = this.route.snapshot.paramMap.get('id');
      if (studentId) {
        this.loadStudentById(+studentId);
      } else {
        this.error = "Identifiant de l'étudiant manquant";
        this.loading = false;
      }
    }
  }

  loadStudentById(id: number): void {
    this.loading = true;

    this.studentService
      .getStudentById(id)
      .pipe(
        catchError(() => {
          this.error =
            "Erreur lors du chargement des informations de l'étudiant";
          this.snackBar.open(this.error, 'Fermer', {
            duration: 3000,
          });
          return of(null);
        }),
        finalize(() => {
          this.loading = false;
        }),
      )
      .subscribe((student) => {
        if (student) {
          this.student = {
            ...student,
            username: student?.username || 'Unknown',
            role: student?.role || Role.STUDENT,
          };
        }
      });
  }

  loadCurrentUserProfile(): void {
    this.loading = true;
    const currentUser = this.authService.currentUserValue;

    if (!currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    if (currentUser.role !== Role.STUDENT) {
      this.snackBar.open("Vous n'êtes pas un étudiant", 'Fermer', {
        duration: 3000,
      });
      this.router.navigate(['/dashboard']);
      return;
    }

    // Find the student by the current user's username
    this.studentService
      .getStudentByStudentId(currentUser.username)
      .pipe(
        catchError(() => {
          this.error = 'Erreur lors du chargement de votre profil';
          this.snackBar.open(this.error, 'Fermer', {
            duration: 3000,
          });
          return of(null);
        }),
        finalize(() => {
          this.loading = false;
        }),
      )
      .subscribe((student) => {
        if (student) {
          this.student = student;
        }
      });
  }

  canEdit(): boolean {
    if (this.isCurrentUserProfile) {
      return true; // Allow students to edit their own profile
    }

    return this.authService.hasRole([
      Role.ADMIN,
      Role.FORMATION_MANAGER,
      Role.ADMINISTRATION,
    ]);
  }

  canDelete(): boolean {
    return this.authService.hasRole([Role.ADMIN]);
  }

  editStudent(): void {
    if (this.student) {
      this.router.navigate(['/students/edit', this.student.id]);
    }
  }
  file = false;

  // Method to get the formation name
  getFormationName(): string {
    return this.student?.formationName || 'Non renseigné';
  }

  deleteStudent(): void {
    if (!this.student) return;

    if (
      confirm(
        'Êtes-vous sûr de vouloir supprimer cet étudiant ? Cette action est irréversible.',
      )
    ) {
      this.loading = true;

      this.studentService
        .deleteStudent(this.student.id)
        .pipe(
          catchError(() => {
            this.snackBar.open(
              "Erreur lors de la suppression de l'étudiant",
              'Fermer',
              {
                duration: 3000,
              },
            );
            return of(null);
          }),
          finalize(() => {
            this.loading = false;
          }),
        )
        .subscribe(() => {
          this.snackBar.open(
            "L'étudiant a été supprimé avec succès",
            'Fermer',
            {
              duration: 3000,
            },
          );
          this.router.navigate(['/students']);
        });
    }
    this.loading = false;
    this.router.navigate(['/students']);

    this.snackBar.open("L'étudiant a été supprimé avec succès", 'Fermer', {
      duration: 3000,
    });
  }

  goBack(): void {
    this.location.back();
  }
}

@NgModule({
  declarations: [
    // other components
  ],
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    // other modules
  ],
})
export class StudentsModule {}
