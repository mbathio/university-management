// src/app/modules/insertion/statistics/statistics.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { InsertionService } from '../services/insertion.service';
import { FormationService } from '../../formations/services/formation.service';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

// Import Angular Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';

interface StatData {
  name: string;
  value: number;
}

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
})
export class StatisticsComponent implements OnInit {
  filterForm!: FormGroup;
  loading = true;
  error = '';
  years: number[] = [];
  formations: { id: number; name: string }[] = [];

  // Statistics data
  statusStats: StatData[] = [];
  contractTypeStats: StatData[] = [];
  industryStats: StatData[] = [];
  salaryRangeStats: StatData[] = [];
  hiringRatePerFormation: StatData[] = [];

  constructor(
    private fb: FormBuilder,
    private insertionService: InsertionService,
    private formationService: FormationService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.initYears();
    this.loadFormations();
    this.loadStatistics();
  }

  private initForm(): void {
    this.filterForm = this.fb.group({
      year: [null],
      formationId: [null],
    });

    // Subscribe to value changes to reload statistics
    this.filterForm.valueChanges.subscribe(() => {
      this.loadStatistics();
    });
  }

  private initYears(): void {
    const currentYear = new Date().getFullYear();
    for (let i = 0; i < 10; i++) {
      this.years.push(currentYear - i);
    }
  }

  private loadFormations(): void {
    this.formationService
      .getAllFormations()
      .pipe(
        catchError(() => {
          this.snackBar.open(
            'Erreur lors du chargement des formations',
            'Fermer',
            {
              duration: 3000,
              horizontalPosition: 'end',
              verticalPosition: 'bottom',
            },
          );
          return of([]);
        }),
      )
      .subscribe((formations) => {
        this.formations = formations;
      });
  }

  private loadStatistics(): void {
    this.loading = true;
    this.error = '';

    const year = this.filterForm.get('year')?.value;
    const formationId = this.filterForm.get('formationId')?.value;

    let statsObservable = this.insertionService.getInsertionStatistics();

    if (year && formationId) {
      // Si l'année et l'ID de formation sont définis, récupérer les statistiques par formation
      statsObservable = this.insertionService
        .getInsertionStatisticsByFormation(formationId)
        .pipe(
          // En cas d'erreur, récupérer toutes les statistiques comme solution de secours
          catchError(() => this.insertionService.getInsertionStatistics()),
        );
    } else if (year) {
      // Filter by year only
      statsObservable =
        this.insertionService.getInsertionStatisticsByYear(year);
    } else if (formationId) {
      // Filter by formation only
      statsObservable =
        this.insertionService.getInsertionStatisticsByFormation(formationId);
    }

    statsObservable
      .pipe(
        catchError(() => {
          this.error = 'Erreur lors du chargement des statistiques';
          this.snackBar.open(this.error, 'Fermer', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'bottom',
          });
          return of({
            statusStats: [],
            contractTypeStats: [],
            industryStats: [],
            salaryRangeStats: [],
            hiringRatePerFormation: [],
          });
        }),
        finalize(() => {
          this.loading = false;
        }),
      )
      .subscribe((stats) => {
        // If backend returns these stats
        this.statusStats =
          'statusStats' in stats
            ? stats.statusStats
            : this.generateMockStatusStats();
        this.contractTypeStats =
          'contractTypeStats' in stats ? stats.contractTypeStats : [];
        this.industryStats =
          'industryStats' in stats ? stats.industryStats : [];
        this.salaryRangeStats =
          'salaryRangeStats' in stats ? stats.salaryRangeStats : [];
        this.hiringRatePerFormation =
          'hiringRatePerFormation' in stats ? stats.hiringRatePerFormation : [];
      });
  }

  // Generate mock data for preview
  private generateMockStatusStats(): StatData[] {
    return [
      { name: 'Embauché', value: 65 },
      { name: 'Offre reçue', value: 10 },
      { name: "En processus d'entretien", value: 8 },
      { name: 'En recherche', value: 12 },
      { name: "Poursuite d'études", value: 5 },
    ];
  }

  resetFilters(): void {
    this.filterForm.reset();
    this.loadStatistics();
  }

  exportToPDF(): void {
    // Implement PDF export functionality
    this.snackBar.open("Fonctionnalité d'export PDF à implémenter", 'Fermer', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Embauché':
        return 'green';
      case 'Offre reçue':
        return 'blue';
      case "En processus d'entretien":
        return 'orange';
      case 'En recherche':
        return 'red';
      case "Poursuite d'études":
        return 'purple';
      default:
        return 'gray';
    }
  }
}
