// src/app/modules/communication/notifications/notifications.component.ts
import { Component, OnInit } from '@angular/core';
import { Document, DocumentType } from '../../../core/models/user.model';
import { DocumentService } from '../services/document.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
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
}
