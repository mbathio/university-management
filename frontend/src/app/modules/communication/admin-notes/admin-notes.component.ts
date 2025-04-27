// src/app/modules/communication/admin-notes/admin-notes.component.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { DocumentService } from '../../../core/services/document.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Document, DocumentType } from '../../../core/models/document.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { VisibilityLevelPipe } from '../pipes/visibility-level.pipe';

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
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule,
    VisibilityLevelPipe
  ]
})
export class AdminNotesComponent implements OnInit {
  adminNotes: Document[] = [];
  dataSource = new MatTableDataSource<Document>([]);
  displayedColumns: string[] = ['title', 'createdAt', 'createdBy', 'visibilityLevel', 'actions'];
  loading = false;
  error = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private documentService: DocumentService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadAdminNotes();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadAdminNotes(): void {
    this.loading = true;
    this.error = '';

    this.documentService.getDocumentsByType(DocumentType.ADMINISTRATIVE_NOTE).subscribe({
      next: (documents) => {
        this.adminNotes = documents;
        this.dataSource.data = this.adminNotes;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des notes administratives:', err);
        this.error = 'Erreur lors du chargement des notes administratives. Veuillez réessayer.';
        this.loading = false;
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

  downloadDocument(documentId: number): void {
    this.documentService.downloadDocument(documentId).subscribe({
      next: (blob) => {
        // Créer une URL pour le blob
        const url = window.URL.createObjectURL(blob);
        
        // Créer un élément <a> pour déclencher le téléchargement
        const a = document.createElement('a');
        a.href = url;
        a.download = `document-${documentId}`;
        
        // Ajouter l'élément au DOM, cliquer dessus et le retirer
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        this.snackBar.open('Téléchargement réussi', 'Fermer', {
          duration: 3000,
        });
      },
      error: (err) => {
        console.error('Erreur lors du téléchargement du document:', err);
        this.snackBar.open('Erreur lors du téléchargement du document', 'Fermer', {
          duration: 3000,
        });
      }
    });
  }

  deleteDocument(documentId: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirmation de suppression',
        message: 'Êtes-vous sûr de vouloir supprimer cette note administrative ?',
        confirmText: 'Supprimer',
        cancelText: 'Annuler'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
        this.documentService.deleteDocument(documentId).subscribe({
          next: () => {
            this.snackBar.open('Note administrative supprimée avec succès', 'Fermer', {
              duration: 3000,
            });
            this.loadAdminNotes();
          },
          error: (err) => {
            console.error('Erreur lors de la suppression de la note administrative:', err);
            this.snackBar.open('Erreur lors de la suppression de la note administrative', 'Fermer', {
              duration: 3000,
            });
            this.loading = false;
          }
        });
      }
    });
  }

  canEdit(document: Document): boolean {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser) return false;
    
    // Vérifier si l'utilisateur est admin ou le créateur du document
    return currentUser.role.includes('ADMIN') || 
           (document.createdBy && document.createdBy.id === currentUser.id);
  }

  canDelete(document: Document): boolean {
    return this.canEdit(document);
  }
}