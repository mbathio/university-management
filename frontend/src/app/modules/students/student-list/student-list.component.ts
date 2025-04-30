// frontend/src/app/modules/students/student-list/student-list.component.ts
import { Component, OnInit, AfterViewInit, ViewChild, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

import { StudentService } from '../services/student.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Student, Role } from '../../../core/models/user.model';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-student-list',
  templateUrl: './student-list.component.html',
  styleUrls: ['./student-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatSnackBarModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class StudentListComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = [
    'studentId',
    'firstName',
    'lastName',
    'formation',
    'promo',
    'actions',
  ];
  dataSource = new MatTableDataSource<Student>();
  isLoading = true;
  error = '';
  isAuthorized = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private studentService: StudentService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Check user authorization
    this.isAuthorized = this.authService.hasRole([Role.ADMIN, Role.FORMATION_MANAGER, Role.ADMINISTRATION]);
    
    if (this.isAuthorized) {
      // Check route parameters for formation or promo filtering
      this.route.paramMap.subscribe(params => {
        const formationId = params.get('formationId');
        const promo = params.get('promo');

        if (formationId) {
          // Load students by formation
          this.loadStudentsByFormation(+formationId);
        } else if (promo) {
          // Load students by promo
          this.loadStudentsByPromo(promo);
        } else {
          // Default: load all students
          this.loadStudents();
        }
      });
    } else {
      this.error = 'Vous n\'êtes pas autorisé à voir la liste des étudiants';
      this.snackBar.open(this.error, 'Fermer', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      this.router.navigate(['/dashboard']);
    }
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadStudents(): void {
    this.isLoading = true;
    this.error = '';

    this.studentService
      .getAllStudents()
      .pipe(
        catchError((err) => {
          console.error('Error loading students:', err);
          this.error = 'Impossible de charger la liste des étudiants';
          this.snackBar.open(this.error, 'Fermer', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
          return of([]);
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe((students) => {
        this.dataSource.data = students;
      });
  }

  loadStudentsByFormation(formationId: number): void {
    this.isLoading = true;
    this.error = '';

    this.studentService.getStudentsByFormation(formationId)
      .pipe(
        catchError((err) => {
          console.error('Error loading students by formation:', err);
          this.error = 'Impossible de charger les étudiants de cette formation';
          this.snackBar.open(this.error, 'Fermer', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
          return of([]);
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe((students) => {
        this.dataSource.data = students;
        
        if (students.length === 0) {
          this.snackBar.open('Aucun étudiant trouvé pour cette formation', 'Fermer', {
            duration: 3000,
            panelClass: ['warning-snackbar']
          });
        }
      });
  }

  loadStudentsByPromo(promo: string): void {
    this.isLoading = true;
    this.error = '';

    this.studentService.getStudentsByPromo(promo)
      .pipe(
        catchError((err) => {
          console.error('Error loading students by promo:', err);
          this.error = 'Impossible de charger les étudiants de cette promotion';
          this.snackBar.open(this.error, 'Fermer', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
          return of([]);
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe((students) => {
        this.dataSource.data = students;
        
        if (students.length === 0) {
          this.snackBar.open('Aucun étudiant trouvé pour cette promotion', 'Fermer', {
            duration: 3000,
            panelClass: ['warning-snackbar']
          });
        }
      });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  canEdit(): boolean {
    return this.authService.hasRole([
      Role.ADMIN,
      Role.FORMATION_MANAGER,
      Role.ADMINISTRATION
    ]);
  }

  canDelete(): boolean {
    return this.authService.hasRole([Role.ADMIN]);
  }

  createStudent(): void {
    if (this.authService.hasRole([Role.ADMIN, Role.FORMATION_MANAGER])) {
      this.router.navigate(['/students/new']);
    } else {
      this.snackBar.open('Vous n\'avez pas les droits pour créer un étudiant', 'Fermer', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
  }

  viewStudentDetails(studentId: number | string): void {
    // Validate student ID
    const validId = this.validateId(studentId);
    
    if (!validId) {
      console.error('Invalid student ID:', studentId);
      this.snackBar.open('ID étudiant invalide', 'Fermer', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    if (this.isAuthorized) {
      this.router.navigate(['/students', validId]);
    } else {
      this.snackBar.open('Accès non autorisé', 'Fermer', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
  }

  viewStudent(id: number): void {
    this.viewStudentDetails(id);
  }

  editStudent(studentId: number | string): void {
    // Validate student ID
    const validId = this.validateId(studentId);
    
    if (!validId) {
      console.error('Invalid student ID:', studentId);
      this.snackBar.open('ID étudiant invalide', 'Fermer', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    if (this.authService.hasRole([Role.ADMIN, Role.FORMATION_MANAGER])) {
      this.router.navigate(['/students', validId, 'edit']);
    } else {
      this.snackBar.open('Vous n\'avez pas les droits pour modifier cet étudiant', 'Fermer', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
  }

  deleteStudent(id: number | string): void {
    // Validate student ID
    const validId = this.validateId(id);
    
    if (!validId) {
      console.error('Invalid student ID:', id);
      this.snackBar.open('ID étudiant invalide', 'Fermer', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    if (confirm('Êtes-vous sûr de vouloir supprimer cet étudiant ?')) {
      this.studentService
        .deleteStudent(validId)
        .pipe(
          catchError((error) => {
            this.snackBar.open(
              'Erreur lors de la suppression de l\'étudiant',
              'Fermer',
              { duration: 3000 }
            );
            return of(null);
          })
        )
        .subscribe((response) => {
          if (response !== null) {
            this.snackBar.open('Étudiant supprimé avec succès', 'Fermer', {
              duration: 3000,
            });
            this.loadStudents();
          }
        });
    }
  }

  // Utility method to validate and convert ID
  private validateId(id: number | string): number | null {
    // Convert to number if string
    const numId = typeof id === 'string' ? parseInt(id, 10) : id;
    
    // Check if valid number and positive
    return (numId !== null && !isNaN(numId) && numId > 0) ? numId : null;
  }

  // Expose Role enum to template
  public readonly Role = Role;

  // Make authService accessible in template
  public get authServicePublic(): AuthService {
    return this.authService;
  }

  // Public method to check role
  public hasRole(roles: Role[]): boolean {
    return this.authService.hasRole(roles);
  }
}