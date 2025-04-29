// frontend/src/app/modules/formations/trainer-list/trainer-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormationService } from '../services/formation.service';

// Material imports
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-trainer-list',
  templateUrl: './trainer-list.component.html',
  styleUrls: ['./trainer-list.component.scss'],
  standalone: true, // Ajout de standalone: true
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatSnackBarModule,
  ],
})
export class TrainerListComponent implements OnInit {
  formationId!: number;
  trainers: any[] = [];
  loading = true;
  formationName = '';
  displayedColumns: string[] = ['name', 'position', 'department', 'contact'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formationService: FormationService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.formationId = +id;
        this.loadFormationDetails();
        this.loadTrainers();
      } else {
        this.router.navigate(['/formations']);
      }
    });
  }

  private loadFormationDetails(): void {
    this.formationService
      .getFormationById(this.formationId)
      .pipe(
        catchError((error) => {
          this.snackBar.open(
            'Erreur lors du chargement des détails de la formation',
            'Fermer',
            {
              duration: 3000,
            },
          );
          return of(null);
        }),
      )
      .subscribe((formation) => {
        if (formation) {
          this.formationName = formation.name;
        }
      });
  }

  private loadTrainers(): void {
    this.loading = true;
    this.formationService
      .getFormationTrainers(this.formationId)
      .pipe(
        catchError((error) => {
          this.snackBar.open(
            'Erreur lors du chargement des formateurs',
            'Fermer',
            {
              duration: 3000,
            },
          );
          return of([]);
        }),
        finalize(() => {
          this.loading = false;
        }),
      )
      .subscribe((trainers) => {
        this.trainers = trainers;
      });
  }

  goBack(): void {
    this.router.navigate(['/formations', this.formationId]);
  }
}