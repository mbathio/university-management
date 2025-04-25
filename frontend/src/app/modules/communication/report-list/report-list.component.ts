// src/app/modules/communication/report-list/report-list.component.ts
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { DocumentService } from '../../../core/services/document.service';
import { Document, DocumentType } from '../../../core/models/document.model';
import { Role } from '../../../core/models/user.model';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-report-list',
  templateUrl: './report-list.component.html',
  styleUrls: ['./report-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatInputModule,
    MatTooltipModule,
    MatSnackBarModule,
  ],
})
export class ReportListComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['title', 'createdAt', 'createdBy', 'actions'];
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
    this.loadReports();
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

  loadReports(): void {
    this.loading = true;
    this.error = '';

    this.documentService.getDocumentsByType(DocumentType.REPORT).subscribe({
      next: (documents) => {
        this.dataSource.data = documents;
        this.loading = false;
      },
      error: () => {
        this.error = 'Erreur lors du chargement des rapports';
        this.loading = false;
        this.snackBar.open('Erreur lors du chargement des rapports', 'Fermer', {
          duration: 3000,
        });
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
      document.createdBy.email === this.currentUsername
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
      document.createdBy.email === this.currentUsername
    ) {
      return true;
    }

    return false;
  }

  deleteReport(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce rapport ?')) {
      this.documentService.deleteDocument(id).subscribe({
        next: () => {
          this.loadReports();
          this.snackBar.open('Rapport supprimé avec succès', 'Fermer', {
            duration: 3000,
          });
        },
        error: () => {
          this.snackBar.open(
            'Erreur lors de la suppression du rapport',
            'Fermer',
            {
              duration: 3000,
            },
          );
        },
      });
    }
  }

  downloadReport(id: number): void {
    // Find the document in the list to get its filename
    const reportDocument = this.dataSource.data.find((doc) => doc.id === id);

    if (!reportDocument || !reportDocument.filePath) {
      this.snackBar.open('Aucun fichier associé à ce rapport', 'Fermer', {
        duration: 3000,
      });
      return;
    }

    // Extract filename from filePath
    const filename = reportDocument.filePath.split('/').pop() || `report-${id}`;

    this.documentService.downloadDocument(filename).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = window.document.createElement('a');
        a.href = url;
        a.download = reportDocument.title
          ? `${reportDocument.title}.pdf`
          : filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      },
      error: () => {
        this.snackBar.open(
          'Erreur lors du téléchargement du rapport',
          'Fermer',
          {
            duration: 3000,
          },
        );
      },
    });
  }
}
