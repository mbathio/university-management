// Correction du formation-list.component.ts
// Supprimer l'import des modules Angular Material individuels et utiliser imports correctly
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
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
import { Formation, Role } from '../../../core/models/user.model';
import { FormationService } from '../services/formation.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Router } from '@angular/router';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

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
  ],
})
export class FormationListComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['name', 'description', 'actions'];
  dataSource = new MatTableDataSource<Formation>();
  isLoading = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private formationService: FormationService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadFormations();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadFormations(): void {
    this.isLoading = true;
    this.formationService
      .getAllFormations()
      .pipe(
        finalize(() => (this.isLoading = false)),
        catchError((error) => {
          this.snackBar.open('Failed to load formations', 'Close', {
            duration: 3000,
          });
          return of([]);
        })
      )
      .subscribe((formations) => {
        this.dataSource.data = formations;
      });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  deleteFormation(id: string): void {
    if (confirm('Are you sure you want to delete this formation?')) {
      this.formationService.deleteFormation(Number(id)).subscribe(() => {
        this.snackBar.open('Formation deleted successfully', 'Close', {
          duration: 3000,
        });
        this.loadFormations();
      });
    }
  }

  navigateToDetails(id: string): void {
    this.router.navigate(['/formations', id]);
  }
  // Le reste du code reste inchangé
}
