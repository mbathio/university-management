// src/app/modules/communication/document-list/document-list.component.ts
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { DocumentService } from '../../../core/services/document.service';
import { Document } from '../../../core/models/document.model';
import { AuthService } from '../../../core/auth/auth.service';
import { Role } from '../../../core/models/role.model';
import { DocumentTypePipe } from '../pipes/document-type.pipe';
import { VisibilityLevelPipe } from '../pipes/visibility-level.pipe';

@Component({
  selector: 'app-document-list',
  templateUrl: './document-list.component.html',
  styleUrls: ['./document-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    VisibilityLevelPipe,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    DocumentTypePipe,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
  ],
})
export class DocumentListComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = [
    'title',
    'type',
    'createdAt',
    'visibilityLevel',
    'actions',
  ];
  dataSource = new MatTableDataSource<Document>();
  loading = true;
  error = '';
  currentUsername = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private documentService: DocumentService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
  ) {
    // Get current user info
    if (this.authService.currentUserValue) {
      this.currentUsername = this.authService.currentUserValue.username;
    }
  }

  ngOnInit(): void {
    this.loadDocuments();
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

  loadDocuments(): void {
    this.loading = true;
    this.error = '';

    this.documentService.getAllDocuments().subscribe({
      next: (documents) => {
        this.dataSource.data = documents;
        this.loading = false;
      },
      error: () => {
        this.error = 'Erreur lors du chargement des documents';
        this.loading = false;
        this.snackBar.open(
          'Erreur lors du chargement des documents',
          'Fermer',
          {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'bottom',
          },
        );
      },
    });
  }

  canEdit(document: Document): boolean {
    if (this.authService.hasRole([Role.ADMIN, Role.ADMINISTRATION])) {
      return true;
    }

    // Si le document existe et l'utilisateur en est le créateur
    if (
      document &&
      document.createdBy &&
      document.createdBy.username === this.currentUsername
    ) {
      return true;
    }

    return false;
  }

  canDelete(document: Document): boolean {
    if (this.authService.hasRole([Role.ADMIN])) {
      return true;
    }

    // Si le document existe et l'utilisateur en est le créateur
    if (
      document &&
      document.createdBy &&
      document.createdBy.username === this.currentUsername
    ) {
      return true;
    }

    return false;
  }

  deleteDocument(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
      this.documentService.deleteDocument(id).subscribe({
        next: () => {
          this.loadDocuments();
          this.snackBar.open('Document supprimé avec succès', 'Fermer', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'bottom',
          });
        },
        error: () => {
          this.snackBar.open(
            'Erreur lors de la suppression du document',
            'Fermer',
            {
              duration: 3000,
              horizontalPosition: 'end',
              verticalPosition: 'bottom',
            },
          );
        },
      });
    }
  }

  downloadDocument(id: number): void {
    this.documentService.downloadDocument(id).subscribe({
      next: (blob) => {
        // Trouver le document dans la liste pour obtenir son titre
        const doc = this.dataSource.data.find((d) => d.id === id);
        const fileName = doc ? `${doc.title}.pdf` : `document-${id}.pdf`;

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      },
      error: () => {
        this.snackBar.open(
          'Erreur lors du téléchargement du document',
          'Fermer',
          {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'bottom',
          },
        );
      },
    });
  }
}