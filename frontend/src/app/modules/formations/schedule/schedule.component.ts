import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';

import { AuthService } from '../../../core/auth/auth.service';
import { Role } from '../../../core/models/role.model';
import { FormationService } from '../services/formation.service';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

interface ScheduleEvent {
  id: number;
  title: string;
  startDateTime: Date;
  endDateTime: Date;
  location: string;
  trainer: string;
  type: string;
}

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatSnackBarModule,
    MatCardModule,
  ]
})
export class ScheduleComponent implements OnInit {
  formationId!: number;
  formation: any = null;
  loading = false;
  error: string | null = null;

  scheduleEvents: ScheduleEvent[] = [];
  displayedColumns: string[] = ['title', 'date', 'time', 'location', 'trainer', 'type', 'actions'];

  // Weekly calendar properties
  weekDays: string[] = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  timeSlots: string[] = [
    '08:00', '09:00', '10:00', '11:00', '12:00', 
    '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formationService: FormationService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.formationId = +params['id'];
      this.loadFormationSchedule();
    });
  }

  loadFormationSchedule(): void {
    this.loading = true;
    this.error = null;

    this.formationService.getFormationSchedule(this.formationId)
      .pipe(
        catchError((err) => {
          this.error = 'Impossible de charger l\'emploi du temps';
          this.loading = false;
          return of([]);
        }),
        finalize(() => this.loading = false)
      )
      .subscribe((scheduleItems) => {
        this.scheduleEvents = scheduleItems.map(item => ({
          ...item,
          startDateTime: new Date(item.startDateTime),
          endDateTime: new Date(item.endDateTime)
        }));
      });
  }

  formatDateTime(date: Date): string {
    return date ? date.toLocaleDateString('fr-FR') : '';
  }

  formatTime(date: Date): string {
    return date ? date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '';
  }

  canManageSchedule(): boolean {
    return this.authService.hasRole([Role.ADMIN, Role.FORMATION_MANAGER]);
  }

  getEventsForTimeSlot(timeSlot: string, dayIndex: number): ScheduleEvent[] {
    return this.scheduleEvents.filter(event => {
      const eventDay = event.startDateTime.getDay();
      const eventTime = event.startDateTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      return eventDay === dayIndex && eventTime === timeSlot;
    });
  }

  goBack(): void {
    this.router.navigate(['/formations', this.formationId]);
  }
}