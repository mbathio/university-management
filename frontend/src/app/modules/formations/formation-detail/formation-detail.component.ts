// frontend/src/app/modules/formations/formation-detail/formation-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

// Material Modules
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';

// Services and Models
import { FormationService } from '../services/formation.service';
import { StudentService } from '../../students/services/student.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Formation } from '../formation.model';
import { Student } from '../../../core/models/user.model';
import { Role } from '../../../core/models/role.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-formation-detail',
  templateUrl: './formation-detail.component.html',
  styleUrls: ['./formation-detail.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatCardModule,
    MatTabsModule,
  ],
})
export class FormationDetailComponent implements OnInit {
  formation!: Formation;
  students: Student[] = [];
  loading = true;
  isMyFormationView = false;
  isNewFormation = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formationService: FormationService,
    private studentService: StudentService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.route.data.subscribe((data) => {
      this.isMyFormationView = data['myFormation'] || false;
      this.isNewFormation = data['newFormation'] || false;
    });

    if (this.isMyFormationView) {
      this.loadMyFormation();
    } else if (this.isNewFormation) {
      // Handle new formation creation view
      this.formation = {
        id: null!,  // Non-null assertion operator tells TypeScript we know what we're doing
        name: '',
        description: '',
        startDate: new Date(),
        endDate: new Date(),
        type: '',
        level: ''
      };
      // Do NOT load students for a new formation
      this.loading = false;
    } else {
      this.route.paramMap.subscribe((params) => {
        const idParam = params.get('id');
        const parsedId = idParam ? parseInt(idParam, 10) : NaN;

        if (!isNaN(parsedId) && parsedId > 0) {
          this.loadFormation(parsedId);
        } else {
          this.snackBar.open(
            'ID de formation invalide',
            'Fermer',
            {
              duration: 3000,
              panelClass: ['error-snackbar']
            }
          );
          this.router.navigate(['/formations']);
        }
      });
    }
  }

  loadFormation(id: number): void {
    this.loading = true;
    this.formationService
      .getFormationById(id)
      .pipe(
        catchError((error) => {
          this.snackBar.open(
            'Erreur lors du chargement de la formation',
            'Fermer',
            {
              duration: 3000,
              panelClass: ['error-snackbar']
            },
          );
          this.router.navigate(['/formations']);
          return of(null);
        }),
        finalize(() => {
          this.loading = false;
        }),
      )
      .subscribe((formation) => {
        if (formation) {
          this.formation = formation;
          this.loadStudents(id);
        }
      });
  }

  loadMyFormation(): void {
    this.loading = true;
    this.formationService
      .getMyFormation()
      .pipe(
        catchError((error) => {
          this.snackBar.open(
            'Erreur lors du chargement de votre formation',
            'Fermer',
            {
              duration: 3000,
            },
          );
          this.router.navigate(['/dashboard']);
          return of(null);
        }),
        finalize(() => {
          this.loading = false;
        }),
      )
      .subscribe((formation) => {
        if (formation) {
          this.formation = formation;
          if (formation.id) {
            this.loadStudents(formation.id);
          }
        }
      });
  }

  loadStudents(formationId: number): void {
    if (this.canViewStudents()) {
      this.studentService
        .getStudentsByFormation(formationId)
        .pipe(
          catchError((error) => {
            this.snackBar.open(
              'Erreur lors du chargement des étudiants',
              'Fermer',
              {
                duration: 3000,
              },
            );
            return of([]);
          }),
        )
        .subscribe((students) => {
          this.students = students;
        });
    }
  }

  canEdit(): boolean {
    return this.authService.hasRole([Role.ADMIN, Role.FORMATION_MANAGER]);
  }

  canDelete(): boolean {
    return this.authService.hasRole([Role.ADMIN]);
  }

  canViewStudents(): boolean {
    return this.authService.hasRole([
      Role.ADMIN,
      Role.FORMATION_MANAGER,
      Role.TEACHER,
      Role.TUTOR,
    ]);
  }

  onEdit(): void {
    this.router.navigate(['/formations/edit', this.formation.id]);
  }

  onDelete(): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette formation ?')) {
      if (this.formation?.id) {
        this.formationService
          .deleteFormation(this.formation.id)
          .pipe(
            catchError((error) => {
              this.snackBar.open(
                'Erreur lors de la suppression de la formation',
                'Fermer',
                {
                  duration: 3000,
                },
              );
              return of(null);
            }),
          )
          .subscribe(() => {
            this.snackBar.open('Formation supprimée avec succès', 'Fermer', {
              duration: 3000,
            });
            this.router.navigate(['/formations']);
          });
      } else {
        this.snackBar.open(
          'Impossible de supprimer la formation: ID non défini',
          'Fermer',
          {
            duration: 3000,
          }
        );
      }
    }
  }
}
