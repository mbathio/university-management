// Correction du schedule.component.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormationService } from '../services/formation.service';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

interface Schedule {
  id: number;
  name: string;
  period: string;
  startDate: Date;
  endDate: Date;
  totalParticipants: number;
  totalFormations: number;
}

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSnackBarModule,
    MatPaginatorModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
})
export class ScheduleComponent implements OnInit {
  formationId!: number;
  schedules: Schedule[] = [];
  loading = true;
  formationName = '';
  totalSchedules = 0;
  pageSize = 10;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

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
        // Assuming the API returns the appropriate format
        this.schedules = scheduleItems;
        this.totalSchedules = scheduleItems.length;
      });
  }

  canCreateSchedule(): boolean {
    // Implement authorization logic
    return true;
  }

  canEditSchedule(schedule: Schedule): boolean {
    // Implement authorization logic
    return true;
  }

  createNewSchedule(): void {
    // Implement navigation to schedule creation
    console.log('Create new schedule');
  }

  viewScheduleDetails(scheduleId: number): void {
    // Implement navigation to schedule details
    console.log('View schedule', scheduleId);
  }

  editSchedule(scheduleId: number): void {
    // Implement navigation to schedule edit
    console.log('Edit schedule', scheduleId);
  }

  onPageChange(event: PageEvent): void {
    // Handle pagination
    console.log('Page event', event);
  }

  goBack(): void {
    this.router.navigate(['/formations', this.formationId]);
  }
}
