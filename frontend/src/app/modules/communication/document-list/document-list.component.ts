// src/app/modules/communication/document-list/document-list.component.ts
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';

import { DocumentService } from '../../../core/services/document.service';
import { Document, DocumentType, VisibilityLevel } from '../../../core/models/document.model';
import { AuthService } from '../../../core/auth/auth.service';
import { Role } from '../../../core/models/role.model';
import { DocumentTypePipe } from '../pipes/document-type.pipe';
import { VisibilityLevelPipe } from '../pipes/visibility-level.pipe';

// Temporary placeholder for bulk update dialog
@Component({
  selector: 'app-bulk-update-dialog',
  template: '<div>Bulk Update Dialog</div>',
  standalone: true
})
export class BulkUpdateDialogComponent {}

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
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    DocumentTypePipe,
    VisibilityLevelPipe,
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

  // Advanced search parameters
  searchTerm = '';
  selectedTypes: DocumentType[] = [];
  selectedVisibilityLevels: VisibilityLevel[] = [];
  startDate: Date | null = null;
  endDate: Date | null = null;

  // Bulk selection
  selectedDocuments: Document[] = [];
  isAllSelected = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private documentService: DocumentService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
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

  applyAdvancedSearch(): void {
    this.loading = true;
    // Temporary implementation until service method is added
    this.documentService.getAllDocuments().subscribe({
      next: (documents) => {
        const filteredDocuments = documents.filter(doc => 
          (!this.searchTerm || doc.title.toLowerCase().includes(this.searchTerm.toLowerCase())) &&
          (!this.selectedTypes.length || this.selectedTypes.includes(doc.type)) &&
          (!this.selectedVisibilityLevels.length || this.selectedVisibilityLevels.includes(doc.visibilityLevel))
        );
        
        this.dataSource.data = filteredDocuments;
        this.loading = false;
      },
      error: (error: Error) => {
        this.error = 'Erreur lors de la recherche des documents';
        this.loading = false;
        this.snackBar.open(this.error, 'Fermer', { duration: 3000 });
      }
    });
  }

  masterToggle(): void {
    this.isAllSelected = !this.isAllSelected;
    this.selectedDocuments = this.isAllSelected ? [...this.dataSource.data] : [];
  }

  toggleDocumentSelection(document: Document): void {
    const index = this.selectedDocuments.findIndex(d => d.id === document.id);
    if (index > -1) {
      this.selectedDocuments.splice(index, 1);
    } else {
      this.selectedDocuments.push(document);
    }
    this.isAllSelected = this.selectedDocuments.length === this.dataSource.data.length;
  }

  bulkUpdateDocuments(): void {
    if (this.selectedDocuments.length === 0) {
      this.snackBar.open('Aucun document sélectionné', 'Fermer', { duration: 3000 });
      return;
    }

    const dialogRef = this.dialog.open(BulkUpdateDialogComponent, {
      width: '400px',
      data: { documents: this.selectedDocuments }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Temporary implementation - update each document individually
        const updatePromises = this.selectedDocuments.map(doc => 
          this.documentService.updateDocument(doc.id, new FormData()).toPromise()
        );

        Promise.all(updatePromises)
          .then(() => {
            this.snackBar.open('Documents mis à jour avec succès', 'Fermer', { duration: 3000 });
            this.loadDocuments();
            this.selectedDocuments = [];
            this.isAllSelected = false;
          })
          .catch((error: Error) => {
            this.snackBar.open('Erreur lors de la mise à jour des documents', 'Fermer', { duration: 3000 });
          });
      }
    });
  }

  bulkDeleteDocuments(): void {
    if (this.selectedDocuments.length === 0) {
      this.snackBar.open('Aucun document sélectionné', 'Fermer', { duration: 3000 });
      return;
    }

    const confirmDelete = confirm(`Êtes-vous sûr de vouloir supprimer ${this.selectedDocuments.length} document(s) ?`);
    if (confirmDelete) {
      // Temporary implementation - delete documents one by one
      const deletePromises = this.selectedDocuments.map(doc => 
        this.documentService.deleteDocument(doc.id).toPromise()
      );

      Promise.all(deletePromises)
        .then(() => {
          this.snackBar.open('Documents supprimés avec succès', 'Fermer', { duration: 3000 });
          this.loadDocuments();
          this.selectedDocuments = [];
          this.isAllSelected = false;
        })
        .catch((error: Error) => {
          this.snackBar.open('Erreur lors de la suppression des documents', 'Fermer', { duration: 3000 });
        });
    }
  }

  downloadDocument(document: Document): void {
    this.documentService.downloadDocument(document.id).subscribe({
      next: (blob: Blob) => {
        const link = window.document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = document.title || 'document';
        window.document.body.appendChild(link);
        link.click();
        window.document.body.removeChild(link);
      },
      error: (error: Error) => {
        this.snackBar.open('Erreur lors du téléchargement du document', 'Fermer', { duration: 3000 });
      }
    });
  }

  resetAdvancedSearch(): void {
    this.searchTerm = '';
    this.selectedTypes = [];
    this.selectedVisibilityLevels = [];
    this.startDate = null;
    this.endDate = null;
    this.loadDocuments();
  }
}