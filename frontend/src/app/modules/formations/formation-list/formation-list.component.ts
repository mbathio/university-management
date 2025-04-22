// frontend/src/app/modules/formations/formation-list/formation-list.component.ts
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { FormationService } from '../services/formation.service';
import { Formation, Role } from '../../../core/models/user.model';
import { AuthService } from '../../../core/auth/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-formation-list',
  templateUrl: './formation-list.component.html',
  styleUrls: ['./formation-list.component.scss']
})
export class FormationListComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['name', 'type', 'level', 'startDate', 'endDate', 'actions'];
  dataSource = new MatTableDataSource<Formation>();
  loading = true;
  error = '';
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  
  constructor(
    private formationService: FormationService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    this.loadFormations();
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
  
  loadFormations(): void {
    this.loading = true;
    
    this.formationService.getAllFormations()
      .pipe(
        catchError(error => {
          this.error = 'Erreur lors du chargement des formations';
          this.snackBar.open(this.error, 'Fermer', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'bottom'
          });
          return of([]);
        }),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe(formations => {
        this.dataSource.data = formations;
      });
  }
  
  canCreate(): boolean {
    return this.authService.hasRole([Role.ADMIN, Role.FORMATION_MANAGER]);
  }
  
  canEdit(formation: Formation): boolean {
    return this.authService.hasRole([Role.ADMIN, Role.FORMATION_MANAGER]);
  }
  
  canDelete(formation: Formation): boolean {
    return this.authService.hasRole([Role.ADMIN]);
  }
  
  createFormation(): void {
    this.router.navigate(['/formations/add']);
  }
  
  editFormation(id: number): void {
    this.router.navigate(['/formations/edit', id]);
  }
  
  viewFormation(id: number): void {
    this.router.navigate(['/formations', id]);
  }
  
  deleteFormation(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette formation ?')) {
      this.formationService.deleteFormation(id)
        .pipe(
          catchError(error => {
            this.snackBar.open('Erreur lors de la suppression: ' + error, 'Fermer', {
              duration: 3000,
              horizontalPosition: 'end',
              verticalPosition: 'bottom'
            });
            return of(null);
          })
        )
        .subscribe(() => {
          this.loadFormations();
          this.snackBar.open('Formation supprimée avec succès', 'Fermer', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'bottom'
          });
        });
    }
  }
  
  formatDate(date: Date | string | undefined): string {
    if (!date) return 'Non définie';
    return new Date(date).toLocaleDateString();
  }
}