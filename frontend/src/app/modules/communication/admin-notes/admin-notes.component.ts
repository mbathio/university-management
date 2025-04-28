// src/app/modules/communication/admin-notes/admin-notes.component.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';

import { Document, DocumentType } from '../../../core/models/document.model';
import { DocumentService } from '../../../core/services/document.service';
import { AuthService } from '../../../core/auth/auth.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { VisibilityLevelPipe } from '../pipes/visibility-level.pipe';
import { Role } from '../../../core/models/role.model';

@Component({
  selector: 'app-admin-notes',
  templateUrl: './admin-notes.component.html',
  styleUrls: ['./admin-notes.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    VisibilityLevelPipe
  ]
})
export class AdminNotesComponent implements OnInit {
  displayedColumns: string[] = ['title', 'createdAt', 'createdBy', 'visibilityLevel', 'actions'];
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
    this.loadAdminNotes();
  }

  ngAfterViewInit(): void {
    if (this.dataSource) {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }

  loadAdminNotes(): void {
    this.loading = true;
    this.error = null;

    const types = [
      DocumentType.ADMINISTRATIVE_NOTE,
      DocumentType.NOTE_SERVICE
    ];

    this.documentService.getReportsByType(types).subscribe({
      next: (documents) => {
        this.dataSource = new MatTableDataSource(documents);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading administrative notes', err);
        this.error = 'Impossible de charger les notes administratives. Veuillez réessayer plus tard.';
        this.loading = false;
      }
    });
  }

  downloadDocument(id: number): void {
    this.loading = true;
    
    this.documentService.downloadDocument(id).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `document-${id}.pdf`;
        document.body.appendChild(a);
        a.click();
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
        message: 'Voulez-vous vraiment supprimer cette note administrative ?',
        confirmText: 'Supprimer',
        cancelText: 'Annuler'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
        this.documentService.deleteDocument(id).subscribe({
          next: () => {
            this.snackBar.open('Note administrative supprimée avec succès', 'Fermer', {
              duration: 3000
            });
            this.loadAdminNotes(); // Reload the list
          },
          error: (err) => {
            console.error('Error deleting document', err);
            this.snackBar.open('Erreur lors de la suppression de la note administrative', 'Fermer', {
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

  canEdit(document: Document): boolean {
    if (this.authService.hasRole([Role.ADMIN as Role])) return true;
    
    const currentUser = this.authService.currentUserValue;
    if (!currentUser) return false;
    
    return document.createdBy.id === currentUser.id;
  }

  canDelete(document: Document): boolean {
    return this.canEdit(document);
  }
}