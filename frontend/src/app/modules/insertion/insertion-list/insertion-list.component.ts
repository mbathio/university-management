// src/app/modules/insertion/insertion-list/insertion-list.component.ts
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import {
  InsertionService,
  Insertion,
  InsertionStatus,
} from '../services/insertion.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Role } from '../../../core/models/user.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { CommonModule } from '@angular/common';

// Import Angular Material Modules
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-insertion-list',
  templateUrl: './insertion-list.component.html',
  styleUrls: ['./insertion-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
})
export class InsertionListComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = [
    'studentName',
    'companyName',
    'position',
    'startDate',
    'status',
    'actions',
  ];
  dataSource = new MatTableDataSource<Insertion>();
  loading = true;
  error = '';
  insertionStatuses = Object.values(InsertionStatus);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private insertionService: InsertionService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadInsertions();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  loadInsertions(): void {
    this.loading = true;

    this.insertionService
      .getAllInsertions()
      .pipe(
        catchError((error) => {
          this.error = "Erreur lors du chargement des données d'insertion";
          this.snackBar.open(this.error, 'Fermer', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'bottom',
          });
          return of([]);
        }),
        finalize(() => {
          this.loading = false;
        }),
      )
      .subscribe((insertions) => {
        this.dataSource.data = insertions;
      });
  }

  canCreate(): boolean {
    return this.authService.hasRole([
      Role.ADMIN,
      Role.FORMATION_MANAGER,
      Role.ADMINISTRATION,
    ]);
  }

  canEdit(insertion: Insertion): boolean {
    return this.authService.hasRole([
      Role.ADMIN,
      Role.FORMATION_MANAGER,
      Role.ADMINISTRATION,
    ]);
  }

  canDelete(insertion: Insertion): boolean {
    return this.authService.hasRole([Role.ADMIN]);
  }

  createInsertion(): void {
    this.router.navigate(['/insertion/add']);
  }

  editInsertion(id: number): void {
    this.router.navigate(['/insertion/edit', id]);
  }

  viewInsertion(id: number): void {
    this.router.navigate(['/insertion', id]);
  }

  deleteInsertion(id: number): void {
    if (
      confirm("Êtes-vous sûr de vouloir supprimer cette donnée d'insertion ?")
    ) {
      this.insertionService
        .deleteInsertion(id)
        .pipe(
          catchError((error) => {
            this.snackBar.open(
              'Erreur lors de la suppression: ' + error,
              'Fermer',
              {
                duration: 3000,
                horizontalPosition: 'end',
                verticalPosition: 'bottom',
              },
            );
            return of(null);
          }),
        )
        .subscribe(() => {
          this.loadInsertions();
          this.snackBar.open(
            "Donnée d'insertion supprimée avec succès",
            'Fermer',
            {
              duration: 3000,
              horizontalPosition: 'end',
              verticalPosition: 'bottom',
            },
          );
        });
    }
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return 'Non définie';
    return new Date(date).toLocaleDateString();
  }

  getStatusColor(status: InsertionStatus): string {
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

  viewStatistics(): void {
    this.router.navigate(['/insertion/statistics']);
  }
}
