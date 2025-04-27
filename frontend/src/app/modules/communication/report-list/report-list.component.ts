// src/app/modules/communication/report-list/report-list.component.ts
import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

import { DocumentService } from '../../../core/services/document.service';
import { Document, DocumentType } from '../../../core/models/document.model';
import { AuthService } from '../../../core/auth/auth.service';
import { DocumentTypePipe } from '../pipes/document-type.pipe';
import { VisibilityLevelPipe } from '../pipes/visibility-level.pipe';

@Component({
  selector: 'app-report-list',
  templateUrl: './report-list.component.html',
  styleUrls: ['./report-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule,
    DocumentTypePipe,
    VisibilityLevelPipe,
  ],
})
export class ReportListComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = [
    'title',
    'type',
    'createdAt',
    'visibilityLevel',
    'actions',
  ];
  dataSource = new MatTableDataSource<Document>([]);
  loading = false;
  error = '';
  reportTypes = [
    DocumentType.MEETING_REPORT,
    DocumentType.SEMINAR_REPORT,
    DocumentType.WEBINAR_REPORT,
    DocumentType.UNIVERSITY_COUNCIL,
  ];

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private documentService: DocumentService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.loadReports();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  loadReports(): void {
    this.loading = true;
    this.error = '';

    this.documentService.getAllDocuments().subscribe({
      next: (documents: Document[]) => {
        // Filter to only keep reports (not administrative documents)
        const reports = documents.filter((doc) =>
          this.reportTypes.includes(doc.type as DocumentType),
        );
        this.dataSource.data = reports;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading reports:', err);
        this.error =
          'Erreur lors du chargement des rapports. Veuillez réessayer.';
        this.loading = false;
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

 // Extrait de report-list.component.ts - fonction à implémenter ou corriger
downloadDocument(id: number): void {
  this.documentService.downloadDocument(id).subscribe(
    (data: Blob) => {
      // Créer un objet URL pour le blob
      const blob = new Blob([data], { type: 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      
      // Créer un élément a temporaire pour déclencher le téléchargement
      const link = document.createElement('a');
      link.href = url;
      // Vous pourriez aussi obtenir le nom du document depuis la liste si disponible
      link.download = `document-${id}`;
      link.click();
      
      // Nettoyer l'URL object
      window.URL.revokeObjectURL(url);
    },
    (error) => {
      console.error('Erreur lors du téléchargement du document', error);
      // Afficher un message d'erreur à l'utilisateur
      // Par exemple avec MatSnackBar
      this.snackBar.open('Erreur lors du téléchargement du document', 'Fermer', {
        duration: 3000,
        panelClass: 'error-snackbar'
      });
    }
  );
}

  deleteDocument(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
      this.documentService.deleteDocument(id).subscribe({
        next: () => {
          this.snackBar.open('Document supprimé avec succès', 'Fermer', {
            duration: 3000,
          });
          this.loadReports();
        },
        error: (err) => {
          console.error('Error deleting document:', err);
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

  canEdit(document: Document): boolean {
    // Vérifier si l'utilisateur actuel est un administrateur ou le créateur du document
    const currentUser = this.authService.currentUserValue;
    return (
      currentUser !== null &&
      (currentUser.role.includes('ADMIN') ||
        document.createdBy.id === currentUser.id)
    );
  }

  canDelete(document: Document): boolean {
    // Convertir explicitement le résultat de canEdit en un booléen strict
    return !!this.canEdit(document);
  }
}
