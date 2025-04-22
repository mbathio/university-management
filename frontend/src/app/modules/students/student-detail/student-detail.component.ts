// frontend/src/app/modules/students/student-detail/student-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StudentService } from '../services/student.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Student, Role } from '../../../core/models/user.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-student-detail',
  templateUrl: './student-detail.component.html',
  styleUrls: ['./student-detail.component.scss']
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
    private snackBar: MatSnackBar
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
        this.error = 'Identifiant de l\'étudiant manquant';
        this.loading = false;
      }
    }
  }
  
  loadStudentById(id: number): void {
    this.loading = true;
    
    this.studentService.getStudentById(id)
      .pipe(
        catchError(error => {
          this.error = 'Erreur lors du chargement des informations de l\'étudiant';
          this.snackBar.open(this.error, 'Fermer', {
            duration: 3000
          });
          return of(null);
        }),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe(student => {
        if (student) {
          this.student = student;
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
      this.snackBar.open('Vous n\'êtes pas un étudiant', 'Fermer', {
        duration: 3000
      });
      this.router.navigate(['/dashboard']);
      return;
    }
    
    // Find the student by the current user's username
    this.studentService.getStudentByStudentId(currentUser.username)
      .pipe(
        catchError(error => {
          this.error = 'Erreur lors du chargement de votre profil';
          this.snackBar.open(this.error, 'Fermer', {
            duration: 3000
          });
          return of(null);
        }),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe(student => {
        if (student) {
          this.student = student;
        }
      });
  }
  
  canEdit(): boolean {
    if (this.isCurrentUserProfile) {
      return true; // Allow students to edit their own profile
    }
    
    return this.authService.hasRole([Role.ADMIN, Role.FORMATION_MANAGER, Role.ADMINISTRATION]);
  }
  
  canDelete(): boolean {
    return this.authService.hasRole([Role.ADMIN]);
  }
  
  editStudent(): void {
    if (this.student) {
      this.router.navigate(['/students/edit', this.student.id]);
    }
  }
  
  deleteStudent(): void {
    if (!this.student) return;
    
    if (confirm('Êtes-vous sûr de vouloir supprimer cet étudiant ? Cette action est irréversible.')) {
      this.loading = true;
      
      this.studentService.deleteStudent(this.student.id)
        .pipe(
          catchError(error => {
            this.snackBar.open('Erreur lors de la suppression de l\'étudiant', 'Fermer', {
              duration: 3000
            });
            return of(null);
          }),
          finalize(() => {
            this.loading = false;
          })
        )
        .subscribe(() => {
          this.snackBar.open('Étudiant supprimé avec succès', 'Fermer', {
            duration: 3000
          });
          this.router.navigate(['/students']);
        });
    }
  }
  
  goBack(): void {
    this.router.navigate(['/students']);
  }
  
  getFormationName(): string {
    return this.student?.currentFormation ? this.student.currentFormation.name : 'Non assigné';
  }
}