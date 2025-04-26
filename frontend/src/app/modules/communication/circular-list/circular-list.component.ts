// src/app/modules/communication/circular-list/circular-list.component.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { DocumentService } from '../../../core/services/document.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Document, DocumentType } from '../../../core/models/document.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { DocumentTypePipe } from '../pipes/document-type.pipe';
import { VisibilityLevelPipe } from '../pipes/visibility-level.pipe';

@Component({
  selector: 'app-circular-list',
  templateUrl: './circular-list.component.html',
  styleUrls: ['./circular-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule,
    DocumentTypePipe,
    VisibilityLevelPipe
  ]
})
export class CircularListComponent implements OnInit {
  displayedColumns: string[] = ['title', 'type', 'createdAt', 'visibilityLevel', 'actions'];
  dataSource = new MatTableDataSource<Document>([]);
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

  isAdminOrAdministration(): boolean {
    const currentUser = this.authService.currentUserValue;
    return currentUser?.role.includes('ADMIN') || 
           currentUser?.role.includes('ADMINISTRATION');
  }

  ngOnInit(): void {
    this.loadCirculars();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadCirculars() {
    this.loading = true;
    this.error = '';

    // Define the types of administrative documents to load
    const adminTypes = [
      DocumentType.NOTE_SERVICE, 
      DocumentType.CIRCULAR, 
      DocumentType.ADMINISTRATIVE_NOTE
    ];

   this.documentService.getDocumentsByType(DocumentType.CIRCULAR).subscribe({
     next: (documents: Document[]) => {
       const administrativeDocuments = this.documentService.getDocumentsByType(DocumentType.ADMINISTRATIVE_NOTE).subscribe({
         next: (additionalDocuments: Document[]) => {
           this.dataSource.data = [...documents, ...additionalDocuments];
           this.loading = false;
         }
       });
     },
     error: (err: any) => {
       console.error('Erreur lors du chargement des circulaires:', err);
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

  canEdit(document: Document): boolean {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser) return false;

    // Check if user is admin or the creator of the document
    return currentUser.role.includes('ADMIN') || 
           document.createdBy.id === currentUser.id;
  }

  canDelete(document: Document): boolean {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser) return false;

    // Only admins or the creator can delete
    return currentUser.role.includes('ADMIN') || 
           document.createdBy.id === currentUser.id;
  }

  downloadDocument(documentId: number): void {
    this.documentService.downloadDocument(documentId).subscribe({
      next: (blob) => {
        // Create a URL for the blob
        const url = window.URL.createObjectURL(blob);
        
        // Create a link element
        const a = document.createElement('a');
        a.href = url;
        a.download = `document-${documentId}.pdf`; // Default filename
        
        // Append to the document and trigger the download
        document.body.appendChild(a);
        a.click();
        
        // Cleanup
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      },
      error: (error) => {
        console.error('Erreur lors du téléchargement du document', error);
        this.snackBar.open('Erreur lors du téléchargement du document', 'Fermer', {
          duration: 3000
        });
      }
    });
  }

  deleteDocument(documentId: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirmation de suppression',
        message: 'Êtes-vous sûr de vouloir supprimer ce document ?',
        confirmButton: 'Supprimer',
        cancelButton: 'Annuler'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.documentService.deleteDocument(documentId).subscribe({
          next: () => {
            this.snackBar.open('Document supprimé avec succès', 'Fermer', {
              duration: 3000
            });
            this.loadCirculars(); // Reload the data
          },
          error: (error) => {
            console.error('Erreur lors de la suppression du document', error);
            this.snackBar.open('Erreur lors de la suppression du document', 'Fermer', {
              duration: 3000
            });
          }
        });
      }
    });
  }
}