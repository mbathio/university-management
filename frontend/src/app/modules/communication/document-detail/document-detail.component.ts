// src/app/modules/communication/document-detail/document-detail.component.ts
import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';

// Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

// Service and Model Imports
import { DocumentService } from '../services/document.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Document } from '../../../core/models/document.model';
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
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DocumentDetailComponent implements OnInit {
  document: Document | null = null;
  loading = true;
  error = '';
  currentUsername = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private documentService: DocumentService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
  ) {
    if (this.authService.currentUserValue) {
      this.currentUsername = this.authService.currentUserValue.username;
    }
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadDocument(+id);
    } else {
      this.handleError('ID de document invalide.');
    }
  }

  loadDocument(id: number): void {
    this.loading = true;
    this.documentService.getDocumentById(id).subscribe({
      next: (document) => {
        this.document = document;
        this.loading = false;
      },
      error: () => {
        this.handleError('Erreur lors du chargement du document.');
      },
    });
  }

  canEdit(): boolean {
    if (!this.document) return false;

    if (this.authService.hasRole([Role.ADMIN, Role.ADMINISTRATION])) {
      return true;
    }

    return (
      this.document.createdBy !== undefined &&
      this.document.createdBy.username === this.currentUsername
    );
  }

  canDelete(): boolean {
    if (!this.document) return false;

    if (this.authService.hasRole([Role.ADMIN])) {
      return true;
    }

    return (
      !!this.document.createdBy &&
      this.document.createdBy.username === this.currentUsername
    );
  }

  deleteDocument(): void {
    if (!this.document) {
      this.snackBar.open('Aucun document à supprimer.', 'Fermer', {
        duration: 3000,
      });
      return;
    }

    if (confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
      this.documentService.deleteDocument(this.document.id).subscribe({
        next: () => {
          this.snackBar.open('Document supprimé avec succès.', 'Fermer', {
            duration: 3000,
          });
          this.router.navigate(['/communication']);
        },
        error: () => {
          this.snackBar.open(
            'Erreur lors de la suppression du document.',
            'Fermer',
            { duration: 3000 },
          );
        },
      });
    }
  }

  downloadDocument(): void {
    if (!this.document || !this.document.filePath) {
      this.snackBar.open('Aucun fichier à télécharger.', 'Fermer', {
        duration: 3000,
      });
      return;
    }

    this.documentService.downloadDocument(this.document.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = this.document?.title || 'document';
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.snackBar.open(
          'Erreur lors du téléchargement du document.',
          'Fermer',
          { duration: 3000 },
        );
      },
    });
  }

  private handleError(message: string): void {
    this.error = message;
    this.loading = false;
    this.snackBar.open(this.error, 'Fermer', { duration: 3000 });
  }
}
