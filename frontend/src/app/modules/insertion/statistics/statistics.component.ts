// src/app/modules/insertion/statistics/statistics.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import {
  InsertionService,
  InsertionStatus,
} from '../services/insertion.service';
import { FormationService } from '../../formations/services/formation.service';
import { catchError, finalize } from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';

interface StatData {
  name: string;
  value: number;
}

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss'],
})
export class StatisticsComponent implements OnInit {
  filterForm!: FormGroup;
  loading = true;
  error = '';
  years: number[] = [];
  formations: any[] = [];

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
        catchError((error) => {
          return of([]);
        }),
      )
      .subscribe((formations) => {
        this.formations = formations;
      });
  }

  private loadStatistics(): void {
    this.loading = true;

    const year = this.filterForm.get('year')?.value;
    const formationId = this.filterForm.get('formationId')?.value;

    let statsObservable = this.insertionService.getInsertionStatistics();

    if (year && formationId) {
      // Filter by both year and formation
      statsObservable = this.insertionService
        .getInsertionStatisticsByFormation(formationId)
        .pipe(catchError(() => this.insertionService.getInsertionStatistics()));
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
        catchError((error) => {
          this.error = 'Erreur lors du chargement des statistiques';
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
        this.statusStats = stats.statusStats || this.generateMockStatusStats();
        this.contractTypeStats = stats.contractTypeStats || [];
        this.industryStats = stats.industryStats || [];
        this.salaryRangeStats = stats.salaryRangeStats || [];
        this.hiringRatePerFormation = stats.hiringRatePerFormation || [];
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
  }

  exportToPDF(): void {
    // Implement PDF export functionality
    alert("Fonctionnalité d'export PDF à implémenter");
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
