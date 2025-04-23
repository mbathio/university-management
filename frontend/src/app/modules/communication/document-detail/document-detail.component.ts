// src/app/modules/communication/document-detail/document-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DocumentService } from '../services/document.service';
import { Document } from '../../../core/models/user.model';
import { AuthService } from '../../../core/auth/auth.service';
import { Role } from '../../../core/models/user.model';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
@Component({
  selector: 'app-document-detail',
  templateUrl: './document-detail.component.html',
  styleUrls: ['./document-detail.component.scss'],
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
    if (this.authService.currentUserValue) {
      this.currentUsername = this.authService.currentUserValue.username;
    }
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadDocument(+id);
    } else {
      this.router.navigate(['/communication']);
    }
  }

  loadDocument(id: number): void {
    this.loading = true;

    this.documentService.getDocumentById(id).subscribe({
      next: (document) => {
        this.document = document;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Erreur lors du chargement du document';
        this.loading = false;
        this.snackBar.open('Erreur lors du chargement du document', 'Fermer', {
          duration: 3000,
        });
        this.router.navigate(['/communication']);
      },
    });
  }

  canEdit(): boolean {
    if (!this.document) return false;

    if (this.authService.hasRole([Role.ADMIN, Role.ADMINISTRATION])) {
      return true;
    }

    // Si le document existe et l'utilisateur en est le créateur
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

    // Si le document existe et l'utilisateur en est le créateur
    if (
      this.document.createdBy &&
      this.document.createdBy.username === this.currentUsername
    ) {
      return true;
    }

    return false;
  }

  deleteDocument(): void {
    if (!this.document) return;
    if (confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
      this.documentService.deleteDocument(this.document.id).subscribe({
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
  }

  downloadDocument(): void {
    if (!this.document) return;
    this.documentService.downloadDocument(this.document.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = this.document?.title ? this.document.title : 'document';
        a.click();
        window.URL.revokeObjectURL(url);
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
}
