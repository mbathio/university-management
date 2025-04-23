// frontend/src/app/modules/formations/schedule/schedule.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormationService } from '../services/formation.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.scss'],
})
export class ScheduleComponent implements OnInit {
  formationId!: number;
  scheduleItems: any[] = [];
  loading = true;
  formationName = '';

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
        this.loadSchedule();
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

  private loadSchedule(): void {
    this.loading = true;
    this.formationService
      .getFormationSchedule(this.formationId)
      .pipe(
        catchError((error) => {
          this.snackBar.open(
            'Erreur lors du chargement du planning',
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
      .subscribe((scheduleItems) => {
        this.scheduleItems = scheduleItems;
      });
  }

  goBack(): void {
    this.router.navigate(['/formations', this.formationId]);
  }
}
