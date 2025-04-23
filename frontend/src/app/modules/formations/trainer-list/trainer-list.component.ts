// frontend/src/app/modules/formations/trainer-list/trainer-list.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormationService } from '../services/formation.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-trainer-list',
  templateUrl: './trainer-list.component.html',
  styleUrls: ['./trainer-list.component.scss'],
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
