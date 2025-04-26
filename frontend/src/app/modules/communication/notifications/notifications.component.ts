import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { DocumentService } from '../../../core/services/document.service';
import { Document, DocumentType } from '../../../core/models/document.model';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatBadgeModule,
    MatProgressSpinnerModule
  ]
})
export class NotificationsComponent implements OnInit {
  recentDocuments: Document[] = [];
  loading = true;
  error = '';

  constructor(private documentService: DocumentService) {}

  ngOnInit(): void {
    this.loadRecentDocuments();
  }

  loadRecentDocuments(): void {
    this.loading = true;
    this.error = '';

    // Utilisation du service existant pour récupérer tous les documents
    // Dans un cas réel, vous voudriez avoir un endpoint spécifique pour les notifications récentes
    this.documentService.getAllDocuments().subscribe({
      next: (documents) => {
        // Trier par date de création, plus récent en premier
        this.recentDocuments = documents
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5); // Ne garder que les 5 plus récents
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des notifications';
        this.loading = false;
        console.error('Erreur lors du chargement des notifications:', err);
      }
    });
  }

  getNotificationIcon(document: Document): string {
    // Retourne une icône appropriée en fonction du type de document
    switch (document.type) {
      case DocumentType.MEETING_REPORT:
        return 'groups';
      case DocumentType.SEMINAR_REPORT:
      case DocumentType.WEBINAR_REPORT:
        return 'event';
      case DocumentType.UNIVERSITY_COUNCIL:
        return 'school';
      case DocumentType.NOTE_SERVICE:
      case DocumentType.ADMINISTRATIVE_NOTE:
        return 'note';
      case DocumentType.CIRCULAR:
        return 'announcement';
      default:
        return 'description';
    }
  }

  markAllAsRead(): void {
    // Cette méthode serait implémentée avec un vrai système de notifications
    // Pour l'instant, c'est juste un placeholder
    console.log('Marquer toutes les notifications comme lues');
  }
}