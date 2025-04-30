// src/app/modules/administration/document-management/document-management.component.ts
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DocumentService } from '../../../core/services/document.service';
import { Document, DocumentType } from '../../../core/models/document.model';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

// Add a simple confirm dialog component if it doesn't exist
@Component({
  selector: 'app-confirm-dialog',
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>{{ data.message }}</mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button mat-dialog-close>Non</button>
      <button mat-button [mat-dialog-close]="true" color="warn">Oui</button>
    </mat-dialog-actions>
  `,
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
})
export class ConfirmDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { title: string; message: string },
  ) {}
}

import { Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-document-management',
  templateUrl: './document-management.component.html',
  styleUrls: ['./document-management.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule,
  ],
})
export class DocumentManagementComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = [
    'title',
    'type',
    'createdAt',
    'visibilityLevel',
    'createdBy',
    'actions',
  ];
  dataSource = new MatTableDataSource<Document>([]);
  loading = true;
  documentTypes = Object.values(DocumentType);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private documentService: DocumentService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.loadDocuments();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadDocuments(): void {
    this.loading = true;
    this.documentService.getAllDocuments().subscribe({
      next: (documents) => {
        this.dataSource.data = documents;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading documents', error);
        this.loading = false;
        this.snackBar.open(
          'Erreur lors du chargement des documents',
          'Fermer',
          {
            duration: 3000,
          },
        );
      },
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  addDocument(): void {
    this.router.navigate(['/administration/documents/add']);
  }

  editDocument(document: Document): void {
    this.router.navigate(['/administration/documents/edit', document.id]);
  }

  deleteDocument(document: Document, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        title: 'Confirmer la suppression',
        message: `Êtes-vous sûr de vouloir supprimer le document "${document.title}" ?`,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (document.id !== undefined) {
          this.documentService.deleteDocument(document.id).subscribe({
            next: () => {
              this.loadDocuments();
              this.snackBar.open('Document supprimé avec succès', 'Fermer', {
                duration: 3000,
              });
            },
            error: (error) => {
              console.error('Error deleting document', error);
              this.snackBar.open(
                'Erreur lors de la suppression du document',
                'Fermer',
                {
                  duration: 3000,
                },
              );
            },
          });
        }
      }
    });
  }

  getDocumentTypeLabel(type: DocumentType): string {
    return type.replace('_', ' ');
  }
}
