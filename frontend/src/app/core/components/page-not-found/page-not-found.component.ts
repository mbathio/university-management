// src/app/core/components/page-not-found/page-not-found.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-page-not-found',
  template: `
    <div class="page-not-found">
      <mat-icon class="error-icon">error_outline</mat-icon>
      <h1>404 - Page non trouvée</h1>
      <p>La page que vous recherchez n'existe pas ou a été déplacée.</p>
      <button mat-raised-button color="primary" routerLink="/dashboard">
        Retour au tableau de bord
      </button>
    </div>
  `,
  styles: [
    `
      .page-not-found {
        text-align: center;
        padding: 2rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 70vh;
      }
      .error-icon {
        font-size: 5rem;
        width: 5rem;
        height: 5rem;
        color: #f44336;
        margin-bottom: 1rem;
      }
      h1 {
        margin-bottom: 1rem;
      }
      p {
        margin-bottom: 2rem;
        color: #666;
      }
    `,
  ],
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule],
})
export class PageNotFoundComponent {}
