// frontend/src/app/modules/formations/formation-list/formation-list.component.ts
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Formation } from '../../../core/models/user.model';
import { Role } from '../../../core/models/role.model';
import { FormationService } from '../services/formation.service';
import { AuthService } from '../../../core/auth/auth.service';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-formation-list',
  templateUrl: './formation-list.component.html',
  styleUrls: ['./formation-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatSnackBarModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
  ],
})
export class FormationListComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = [
    'name',
    'type',
    'level',
    'startDate',
    'endDate',
    'actions',
  ];
  dataSource = new MatTableDataSource<Formation>();
  isLoading = true;
  error = '';
  isAuthorized = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private formationService: FormationService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    // Check user authorization
    this.isAuthorized = this.authService.hasRole([Role.ADMIN, Role.FORMATION_MANAGER, Role.ADMINISTRATION]);
    
    if (this.isAuthorized) {
      this.loadFormations();
    } else {
      this.error = 'Vous n\'êtes pas autorisé à voir la liste des formations';
      this.snackBar.open(this.error, 'Fermer', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      this.router.navigate(['/dashboard']);
    }
  }

  ngAfterViewInit(): void {
    if (this.dataSource) {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }

  loadFormations(): void {
    this.isLoading = true;
    this.error = '';
    this.formationService
      .getAllFormations()
      .pipe(
        catchError((err) => {
          // More detailed error logging
          console.error('Formation loading error:', err);
          
          // Specific error messages based on error type
          if (err instanceof HttpErrorResponse) {
            switch (err.status) {
              case 401:
                this.error = 'Vous n\'êtes pas authentifié';
                break;
              case 403:
                this.error = 'Vous n\'avez pas les permissions nécessaires';
                break;
              case 404:
                this.error = 'Aucune formation trouvée';
                break;
              case 500:
                this.error = 'Erreur serveur. Veuillez réessayer plus tard.';
                break;
              default:
                this.error = 'Impossible de charger les formations';
            }
          } else {
            this.error = 'Une erreur inattendue s\'est produite';
          }

          // Log error to console for debugging
          console.error(this.error, err);

          // Show snackbar notification
          this.snackBar.open(this.error, 'Fermer', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });

          // Return an empty array to prevent the observable from erroring out
          return of([]);
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (formations) => {
          // Additional validation
          if (!formations || formations.length === 0) {
            this.error = 'Aucune formation disponible';
            this.snackBar.open(this.error, 'Fermer', {
              duration: 3000,
              panelClass: ['warning-snackbar']
            });
          }
          this.dataSource.data = formations;
        },
        error: (err) => {
          console.error('Unexpected error in formations subscription:', err);
        }
      });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  deleteFormation(id: number | string): void {
    // Validate formation ID
    const validId = this.validateId(id);
    
    if (!validId) {
      console.error('Invalid formation ID:', id);
      this.snackBar.open('ID de formation invalide', 'Fermer', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    if (confirm('Êtes-vous sûr de vouloir supprimer cette formation ?')) {
      this.formationService
        .deleteFormation(validId)
        .pipe(
          catchError((error) => {
            this.snackBar.open(
              'Erreur lors de la suppression de la formation',
              'Fermer',
              { duration: 3000 }
            );
            return of(null);
          })
        )
        .subscribe((response) => {
          if (response !== null) {
            this.snackBar.open('Formation supprimée avec succès', 'Fermer', {
              duration: 3000,
            });
            this.loadFormations();
          }
        });
    }
  }

  viewFormationDetails(formationId: number | string): void {
    // Validate formation ID
    const validId = this.validateId(formationId);
    
    if (!validId) {
      console.error('Invalid formation ID:', formationId);
      this.snackBar.open('ID de formation invalide', 'Fermer', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    if (this.isAuthorized) {
      this.router.navigate(['/formations', validId]);
    } else {
      this.snackBar.open('Accès non autorisé', 'Fermer', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
  }

  editFormation(formationId: number | string): void {
    // Validate formation ID
    const validId = this.validateId(formationId);
    
    if (!validId) {
      console.error('Invalid formation ID:', formationId);
      this.snackBar.open('ID de formation invalide', 'Fermer', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    if (this.authService.hasRole([Role.ADMIN, Role.FORMATION_MANAGER])) {
      this.router.navigate(['/formations', validId, 'edit']);
    } else {
      this.snackBar.open('Vous n\'avez pas les droits pour modifier cette formation', 'Fermer', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
  }

  createFormation(): void {
    if (this.authService.hasRole([Role.ADMIN, Role.FORMATION_MANAGER])) {
      this.router.navigate(['/formations/new']);
    } else {
      this.snackBar.open('Vous n\'avez pas les droits pour créer une formation', 'Fermer', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
  }

  canCreate(): boolean {
    return this.authService.hasRole([Role.ADMIN, Role.FORMATION_MANAGER]);
  }

  canEdit(formation?: Formation): boolean {
    return this.authService.hasRole([Role.ADMIN, Role.FORMATION_MANAGER]);
  }

  canDelete(formation?: Formation): boolean {
    return this.authService.hasRole([Role.ADMIN]);
  }

  // Expose Role enum to template
  public readonly Role = Role;

  // Make authService accessible in template
  public get authServicePublic(): AuthService {
    return this.authService;
  }

  // Public method to check role
  public hasRole(roles: Role[]): boolean {
    return this.authService.hasRole(roles);
  }

  // Utility method to validate and convert ID
  private validateId(id: number | string): number | null {
    // Convert to number if string
    const numId = typeof id === 'string' ? parseInt(id, 10) : id;
    
    // Check if valid number and positive
    return (numId !== null && !isNaN(numId) && numId > 0) ? numId : null;
  }
}