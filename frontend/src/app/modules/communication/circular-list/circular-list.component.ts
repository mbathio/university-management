// src/app/modules/communication/circular-list/circular-list.component.ts
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { Document, DocumentType } from '../../../core/models/document.model';
import { DocumentService } from '../../../core/services/document.service';
import { AuthService } from '../../../core/auth/auth.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { Role } from '../../../core/models/user.model';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DocumentTypePipe } from '../pipes/document-type.pipe';
import { VisibilityLevelPipe } from '../pipes/visibility-level.pipe';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-circular-list',
  templateUrl: './circular-list.component.html',
  styleUrls: ['./circular-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatPaginatorModule,
    MatSnackBarModule,
    MatDialogModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatSortModule,
    MatButtonModule,
    DocumentTypePipe,
    VisibilityLevelPipe
  ]
})
export class CircularListComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['title', 'type', 'createdAt', 'visibilityLevel', 'actions'];
  dataSource: MatTableDataSource<Document> = new MatTableDataSource<Document>([]);
  loading = false;
  error: string | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private documentService: DocumentService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadCirculars();
  }

  ngAfterViewInit(): void {
    if (this.dataSource) {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }

  loadCirculars(): void {
    this.loading = true;
    this.error = null;

    // Updated to use appropriate document types for circulars and notes
    const types = [
      DocumentType.CIRCULAR,
      DocumentType.NOTE_SERVICE,
      DocumentType.ADMINISTRATIVE_NOTE
    ];

    // Use the correct method to get documents by types
    this.documentService.getDocumentsByTypes(types).subscribe({
      next: (documents) => {
        this.dataSource = new MatTableDataSource(documents);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading circulars', err);
        this.error = 'Impossible de charger les documents. Veuillez réessayer plus tard.';
        this.loading = false;
      }
    });
  }

  downloadDocument(id: number): void {
    this.loading = true;
    
    this.documentService.downloadDocument(id).subscribe({
      next: (blob: Blob) => {
        // Create a URL for the blob
        const url = window.URL.createObjectURL(blob);
        
        // Create a link element to trigger the download
        const a = document.createElement('a');
        a.href = url;
        a.download = `document-${id}.pdf`; // Default name, will be replaced by Content-Disposition if available
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        this.loading = false;
        this.snackBar.open('Téléchargement réussi', 'Fermer', { duration: 3000 });
      },
      error: (err) => {
        console.error('Error downloading document', err);
        this.loading = false;
        this.snackBar.open('Erreur lors du téléchargement du document', 'Fermer', { 
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  deleteDocument(id: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirmation de suppression',
        message: 'Voulez-vous vraiment supprimer ce document ?',
        confirmText: 'Supprimer',
        cancelText: 'Annuler'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
        this.documentService.deleteDocument(id).subscribe({
          next: () => {
            this.snackBar.open('Document supprimé avec succès', 'Fermer', {
              duration: 3000
            });
            this.loadCirculars(); // Reload the list
          },
          error: (err) => {
            console.error('Error deleting document', err);
            this.snackBar.open('Erreur lors de la suppression du document', 'Fermer', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
            this.loading = false;
          }
        });
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

  isAdminOrAdministration(): boolean {
    return this.authService.hasRole([Role.ADMIN, Role.ADMINISTRATION]);
  }

  canEdit(document: Document): boolean {
    // Admin can edit any document
    if (this.authService.hasRole([Role.ADMIN])) return true;
    
    // Administration can edit administrative documents
    if (this.authService.hasRole([Role.ADMINISTRATION])) return true;
    
    // Document creator can edit their own documents
    const currentUser = this.authService.currentUserValue;
    if (!currentUser) return false;
    
    return document.createdBy.id === currentUser.id;
  }

  canDelete(document: Document): boolean {
    // Use the same permission logic as edit for consistency
    return this.canEdit(document);
  }
}