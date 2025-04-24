// frontend/src/app/modules/students/student-list/student-list.component.ts
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

// Material Imports
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

// Service and Model Imports
import { StudentService } from '../services/student.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Student, Role } from '../../../core/models/user.model';

// RxJS Imports
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
  ],
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
  loading = true;
  error = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private studentService: StudentService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.loadStudents();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  loadStudents(): void {
    this.loading = true;

    this.studentService
      .getAllStudents()
      .pipe(
        catchError((error) => {
          this.error = 'Erreur lors du chargement des étudiants';
          this.snackBar.open(this.error, 'Fermer', {
            duration: 3000,
          });
          return of([]);
        }),
        finalize(() => {
          this.loading = false;
        }),
      )
      .subscribe((students) => {
        this.dataSource.data = students;
      });
  }

  canCreate(): boolean {
    return this.authService.hasRole([Role.ADMIN, Role.ADMINISTRATION]);
  }

  canEdit(student: Student): boolean {
    return this.authService.hasRole([Role.ADMIN, Role.ADMINISTRATION]);
  }

  canDelete(student: Student): boolean {
    return this.authService.hasRole([Role.ADMIN]);
  }

  createStudent(): void {
    this.router.navigate(['/students/add']);
  }

  editStudent(id: number): void {
    this.router.navigate(['/students/edit', id]);
  }

  viewStudent(id: number): void {
    this.router.navigate(['/students', id]);
  }

  deleteStudent(id: number): void {
    // Confirmation dialog would typically go here
    if (
      confirm(
        'Êtes-vous sûr de vouloir supprimer cet étudiant ? Cette action est irréversible.',
      )
    ) {
      this.loading = true;
      this.studentService
        .deleteStudent(id)
        .pipe(
          catchError((error) => {
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
          this.snackBar.open('Étudiant supprimé avec succès', 'Fermer', {
            duration: 3000,
          });
          this.loadStudents();
        });
    }
  }

  getFormationName(student: Student): string {
    return student.currentFormation
      ? student.currentFormation.name
      : 'Non assigné';
  }
}
