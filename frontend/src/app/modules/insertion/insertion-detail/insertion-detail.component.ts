import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  InsertionService,
  Insertion,
  InsertionStatus,
} from '../services/insertion.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Role } from '../../../core/models/user.model';
import { StudentService } from '../../students/services/student.service';
import { catchError, finalize, switchMap } from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';

// Import Angular Material Components
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-insertion-detail',
  templateUrl: './insertion-detail.component.html',
  styleUrls: ['./insertion-detail.component.scss'],
  // Add imports for standalone components (in Angular 14+ with standalone components)
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
})
export class InsertionDetailComponent implements OnInit {
  insertion: Insertion | null = null;
  student: any | null = null;
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private insertionService: InsertionService,
    private studentService: StudentService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
  ) {}

  // Le reste du code reste inchangé
  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.loadInsertionDetails(+id);
      } else {
        this.error = "ID d'insertion non fourni";
        this.loading = false;
      }
    });
  }

  private loadInsertionDetails(id: number): void {
    this.loading = true;

    this.insertionService
      .getInsertionById(id)
      .pipe(
        switchMap((insertion) => {
          this.insertion = insertion;
          return this.studentService.getStudentById(insertion.studentId);
        }),
        catchError((error) => {
          this.error = "Erreur lors du chargement des détails d'insertion";
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
    return this.authService.hasRole([
      Role.ADMIN,
      Role.FORMATION_MANAGER,
      Role.ADMINISTRATION,
    ]);
  }

  canDelete(): boolean {
    return this.authService.hasRole([Role.ADMIN]);
  }

  editInsertion(): void {
    if (this.insertion) {
      this.router.navigate(['/insertion/edit', this.insertion.id]);
    }
  }

  deleteInsertion(): void {
    if (!this.insertion) return;

    if (
      confirm("Êtes-vous sûr de vouloir supprimer cette donnée d'insertion ?")
    ) {
      this.insertionService
        .deleteInsertion(this.insertion.id)
        .pipe(
          catchError((error) => {
            this.snackBar.open(
              'Erreur lors de la suppression: ' + error,
              'Fermer',
              {
                duration: 3000,
              },
            );
            return of(null);
          }),
        )
        .subscribe(() => {
          this.snackBar.open(
            "Donnée d'insertion supprimée avec succès",
            'Fermer',
            {
              duration: 3000,
            },
          );
          this.router.navigate(['/insertion']);
        });
    }
  }

  getStatusLabel(status: InsertionStatus | undefined): string {
    if (!status) return 'Statut inconnu';
    switch (status) {
      case InsertionStatus.HIRED:
        return 'Embauché';
      case InsertionStatus.OFFER_RECEIVED:
        return 'Offre reçue';
      case InsertionStatus.INTERVIEW_PROCESS:
        return "En processus d'entretien";
      case InsertionStatus.SEARCHING:
        return 'En recherche';
      case InsertionStatus.CONTINUING_STUDIES:
        return "Poursuite d'études";
      default:
        return 'Autre';
    }
  }

  getStatusColor(status: InsertionStatus | undefined): string {
    if (!status) return 'gray';
    switch (status) {
      case InsertionStatus.HIRED:
        return 'green';
      case InsertionStatus.OFFER_RECEIVED:
        return 'blue';
      case InsertionStatus.INTERVIEW_PROCESS:
        return 'orange';
      case InsertionStatus.SEARCHING:
        return 'red';
      case InsertionStatus.CONTINUING_STUDIES:
        return 'purple';
      default:
        return 'gray';
    }
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return 'Non définie';
    return new Date(date).toLocaleDateString();
  }

  goBack(): void {
    this.router.navigate(['/insertion']);
  }
}
