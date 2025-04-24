// src/app/modules/communication/notifications/notifications.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DocumentType } from '../../../core/models/document.model';
import { Document } from '../../../core/models/document.model';
import { DocumentService } from '../services/document.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
  ],
})
export class NotificationsComponent implements OnInit {
  announcements: Document[] = [];
  loading = true;
  error = '';

  constructor(
    private documentService: DocumentService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.loadAnnouncements();
  }

  loadAnnouncements(): void {
    this.loading = true;

    this.documentService
      .getDocumentsByType(DocumentType.ANNOUNCEMENT)
      .subscribe({
        next: (documents) => {
          this.announcements = documents;
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Erreur lors du chargement des annonces';
          this.loading = false;
          this.snackBar.open(
            'Erreur lors du chargement des annonces',
            'Fermer',
            {
              duration: 3000,
            },
          );
        },
      });
  }

  downloadDocument(documentId: number): void {
    this.documentService.downloadDocument(documentId).subscribe({
      next: (response) => {
        // Gérer le téléchargement du fichier
        const url = window.URL.createObjectURL(response);
        const a = document.createElement('a');
        a.href = url;

        // Trouver le document correspondant pour utiliser son titre comme nom de fichier
        const doc = this.announcements.find((a) => a.id === documentId);
        const fileName = doc
          ? `${doc.title}.pdf`
          : `document-${documentId}.pdf`;

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
}
