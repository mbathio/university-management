// src/app/modules/formations/formation-list/formation-list.component.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { FormationService } from '../services/formation.service';
import { Formation } from '../../../core/models/user.model';
import { AuthService } from '../../../core/auth/auth.service';
import { Role } from '../../../core/models/user.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-formation-list',
  templateUrl: './formation-list.component.html',
  styleUrls: ['./formation-list.component.scss']
})
export class FormationListComponent implements OnInit {
  displayedColumns: string[] = ['name', 'type', 'level', 'startDate', 'endDate', 'actions'];
  dataSource = new MatTableDataSource<Formation>();
  loading = true;
  error = '';
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  
  constructor(
    private formationService: FormationService,
    private authService: AuthService,
    private snackBar: MatSnackBar
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
    
    this.formationService.getAllFormations().subscribe({
      next: (formations) => {
        this.dataSource.data = formations;
        this.loading = false;
      },
      error: (error) => {
        this.error = error;
        this.loading = false;
        this.snackBar.open('Erreur lors du chargement des formations', 'Fermer', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'bottom'
        });
      }
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
  
  deleteFormation(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette formation ?')) {
      this.formationService.deleteFormation(id).subscribe({
        next: () => {
          this.loadFormations();
          this.snackBar.open('Formation supprimée avec succès', 'Fermer', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'bottom'
          });
        },
        error: (error) => {
          this.snackBar.open('Erreur lors de la suppression: ' + error, 'Fermer', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'bottom'
          });
        }
      });
    }
  }
}