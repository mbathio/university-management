// src/app/modules/communication/document-detail/document-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

import { DocumentService } from '../../../core/services/document.service';
import { Document, DocumentType } from '../../../core/models/document.model';
import { AuthService } from '../../../core/auth/auth.service';
import { Role } from '../../../core/models/user.model';

@Component({
  selector: 'app-document-detail',
  templateUrl: './document-detail.component.html',
  styleUrls: ['./document-detail.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatChipsModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
})
export class DocumentDetailComponent implements OnInit {
  document: Document | null = null;
  loading = true;
  error = '';
  documentId = 0;
  DocumentType = DocumentType;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private documentService: DocumentService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.documentId = +idParam;
      this.loadDocument();
    } else {
      this.error = 'ID de document non valide';
      this.loading = false;
    }
  }

  loadDocument(): void {
    this.loading = true;
    this.documentService.getDocumentById(this.documentId).subscribe({
      next: (doc) => {
        this.document = doc;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement du document';
        this.loading = false;
        this.snackBar.open(
          'Erreur: Impossible de charger le document',
          'Fermer',
          {
            duration: 3000,
          },
        );
        console.error('Error loading document:', err);
      },
    });
  }

  downloadDocument(): void {
    if (!this.document || !this.document.filePath) {
      this.snackBar.open(
        "Aucun fichier n'est associé à ce document",
        'Fermer',
        {
          duration: 3000,
        },
      );
      return;
    }

    this.documentService.downloadDocument(this.documentId).subscribe({
      next: (blob) => {
        const fileName = this.document?.title
          ? `${this.document.title}.pdf`
          : `document-${this.documentId}.pdf`;

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
          },
        );
      },
    });
  }

  canEdit(): boolean {
    if (!this.document) return false;

    if (this.authService.hasRole([Role.ADMIN])) {
      return true;
    }

    // Check if current user is document creator
    const currentUser = this.authService.currentUserValue;
    return this.document.createdBy?.username === currentUser?.username;
  }

  canDelete(): boolean {
    return this.canEdit();
  }

  editDocument(): void {
    this.router.navigate(['/communication/edit', this.documentId]);
  }

  deleteDocument(): void {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
      return;
    }

    this.documentService.deleteDocument(this.documentId).subscribe({
      next: () => {
        this.snackBar.open('Document supprimé avec succès', 'Fermer', {
          duration: 3000,
        });
        this.router.navigate(['/communication']);
      },
      error: () => {
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

  getDocumentTypeLabel(type: DocumentType): string {
    switch (type) {
      case DocumentType.MEETING_REPORT:
        return 'Compte-rendu de réunion';
      case DocumentType.SEMINAR_REPORT:
        return 'Compte-rendu de séminaire';
      case DocumentType.WEBINAR_REPORT:
        return 'Compte-rendu de webinaire';
      case DocumentType.UNIVERSITY_COUNCIL:
        return "Conseil d'Université";
      case DocumentType.NOTE_SERVICE:
        return 'Note de service';
      case DocumentType.CIRCULAR:
        return 'Circulaire';
      case DocumentType.ADMINISTRATIVE_NOTE:
        return 'Note administrative';
      case DocumentType.OTHER:
        return 'Autre';
      default:
        return type;
    }
  }

  goBack(): void {
    this.router.navigate(['/communication']);
  }
}
