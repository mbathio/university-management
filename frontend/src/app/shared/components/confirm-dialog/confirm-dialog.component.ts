// src/app/shared/components/confirm-dialog/confirm-dialog.component.ts
import { Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-confirm-dialog',
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>{{ data.message }}</mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button (click)="dialogRef.close(false)">Non</button>
      <button mat-button (click)="dialogRef.close(true)" color="warn">
        Oui
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      mat-dialog-actions {
        justify-content: flex-end;
      }
    `,
  ],
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string; message: string },
  ) {}
}
