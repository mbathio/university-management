// src/app/modules/communication/document-detail/document-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { DocumentService } from '../../../core/services/document.service';
import { Document } from '../../../core/models/document.model';
import { AuthService } from '../../../core/auth/auth.service';
import { Role } from '../../../core/models/user.model';
import { DocumentTypePipe } from '../pipes/document-type.pipe';
import { VisibilityLevelPipe } from '../pipes/visibility-level.pipe';

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
    MatChipsModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    DocumentTypePipe,
    VisibilityLevelPipe,
  ],
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
    // Get current user info
    const currentUser = this.authService.currentUserValue;
    if (currentUser) {
      this.currentUsername = currentUser.username;
    }
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.params['id'];
    if (idParam && !isNaN(+idParam)) {
      this.loadDocument(+idParam);
    } else {
      this.error = 'ID de document invalide';
      this.loading = false;
    }
  }

  loadDocument(id: number): void {
    this.loading = true;
    this.error = '';

    this.documentService.getDocumentById(id).subscribe({
      next: (document) => {
        this.document = document;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement du document';
        this.loading = false;
        console.error('Erreur lors du chargement du document:', err);
        this.snackBar.open('Erreur lors du chargement du document', 'Fermer', {
          duration: 3000,
        });
      },
    });
  }

  canEdit(): boolean {
    if (!this.document) return false;

    if (this.authService.hasRole([Role.ADMIN, Role.ADMINISTRATION])) {
      return true;
    }

    // Si l'utilisateur est le créateur du document
    if (
      this.document.createdBy &&
      this.document.createdBy.username === this.currentUsername
    ) {
      return true;
    }

    return false;
  }

  canDelete(): boolean {
    if (!this.document) return false;

    if (this.authService.hasRole([Role.ADMIN])) {
      return true;
    }

    // Si l'utilisateur est le créateur du document
    if (
      this.document.createdBy &&
      this.document.createdBy.username === this.currentUsername
    ) {
      return true;
    }

    return false;
  }

  downloadDocument(): void {
    if (!this.document || !this.document.id) return;

    this.documentService.downloadDocument(this.document.id).subscribe({
      next: (blob) => {
        const fileName = this.document
          ? `${this.document.title}.pdf`
          : 'document.pdf';

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      },
      error: (err) => {
        console.error('Erreur lors du téléchargement du document:', err);
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

  deleteDocument(): void {
    if (!this.document || !this.document.id) return;

    if (confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
      this.documentService.deleteDocument(this.document.id).subscribe({
        next: () => {
          this.snackBar.open('Document supprimé avec succès', 'Fermer', {
            duration: 3000,
          });
          this.router.navigate(['/communication']);
        },
        error: (err) => {
          console.error('Erreur lors de la suppression du document:', err);
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
}
