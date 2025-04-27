// src/app/modules/communication/admin-form/admin-note-form.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { DocumentService } from '../../../core/services/document.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Document, VisibilityLevel } from '../../../core/models/document.model';

@Component({
  selector: 'app-admin-note-form',
  templateUrl: './admin-note-form.component.html',
  styleUrls: ['./admin-note-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSnackBarModule,
  ],
})
export class AdminNoteFormComponent implements OnInit {
  noteForm!: FormGroup;
  isEditMode = false;
  documentId?: number;
  loading = false;
  selectedFile: File | null = null;
  currentFilePath = '';
  visibilityLevels = [
    VisibilityLevel.PUBLIC,
    VisibilityLevel.ADMINISTRATION,
    VisibilityLevel.TEACHERS,
    VisibilityLevel.STUDENTS,
    VisibilityLevel.RESTRICTED,
  ];
  noteTypes = ['NOTE_ADMINISTRATIVE', 'NOTE_SERVICE'];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private documentService: DocumentService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.isEditMode = true;
        this.documentId = +params['id'];
        this.loadDocument(this.documentId);
      }
    });
  }

  createForm(): void {
    this.noteForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      reference: ['', [Validators.maxLength(50)]],
      type: ['NOTE_ADMINISTRATIVE', [Validators.required]],
      content: ['', [Validators.maxLength(5000)]],
      visibilityLevel: [VisibilityLevel.ADMINISTRATION, [Validators.required]],
      tags: [''],
    });
  }

  loadDocument(id: number): void {
    this.loading = true;
    this.documentService.getDocumentById(id).subscribe({
      next: (document) => {
        // Vérifier si l'utilisateur a le droit de modifier ce document
        const currentUser = this.authService.currentUserValue;
        if (
          !currentUser ||
          (!currentUser.role.includes('ADMIN') &&
            document.createdBy.id !== currentUser.id)
        ) {
          this.snackBar.open(
            "Vous n'êtes pas autorisé à modifier ce document",
            'Fermer',
            {
              duration: 3000,
            },
          );
          this.router.navigate(['/communication/admin-notes']);
          return;
        }

        // Remplir le formulaire avec les données existantes
        this.noteForm.patchValue({
          title: document.title,
          content: document.content,
          visibilityLevel: document.visibilityLevel,
          reference: document.reference || '',
        });

        if (document.filePath) {
          this.currentFilePath = document.filePath;
        }

        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement du document:', err);
        this.snackBar.open('Erreur lors du chargement du document', 'Fermer', {
          duration: 3000,
        });
        this.loading = false;
        this.router.navigate(['/communication/admin-notes']);
      },
    });
  }

  onFileSelected(event: Event): void {
    const element = event.target as HTMLInputElement;
    if (element.files && element.files.length > 0) {
      this.selectedFile = element.files[0];
    }
  }

  onSubmit(): void {
    if (this.noteForm.invalid) return;

    this.loading = true;
    const formData = new FormData();

    const tagsString = this.noteForm.value.tags;
    const tags = tagsString
      ? tagsString
          .split(',')
          .map((tag: string) => tag.trim())
          .filter((tag: string) => tag)
      : [];

    const documentData: Partial<Document> = {
      title: this.noteForm.value.title,
      content: this.noteForm.value.content,
      type: this.noteForm.value.type,
      visibilityLevel: this.noteForm.value.visibilityLevel,
      reference: this.noteForm.value.reference,
      tags: tags,
    };
    // Convertir l'objet document en JSON et l'ajouter au FormData
    formData.append(
      'document',
      new Blob([JSON.stringify(documentData)], {
        type: 'application/json',
      }),
    );

    const currentUser = this.authService.currentUserValue;
    const userId = currentUser?.id;

    formData.append('userId', userId?.toString() || '');

    if (this.selectedFile) {
      formData.append('file', this.selectedFile);
    }

    if (this.isEditMode && this.documentId) {
      this.documentService.updateDocument(this.documentId, formData).subscribe({
        next: () => {
          this.snackBar.open('Note mise à jour avec succès', 'Fermer', {
            duration: 3000,
          });
          this.router.navigate(['/communication/admin-notes']);
          this.loading = false;
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour', error);
          this.snackBar.open(
            'Erreur lors de la mise à jour de la note',
            'Fermer',
            {
              duration: 3000,
            },
          );
          this.loading = false;
        },
      });
    } else {
      this.documentService.createDocument(formData).subscribe({
        next: () => {
          this.snackBar.open('Note créée avec succès', 'Fermer', {
            duration: 3000,
          });
          this.router.navigate(['/communication/admin-notes']);
          this.loading = false;
        },
        error: (error) => {
          console.error('Erreur lors de la création', error);
          this.snackBar.open(
            'Erreur lors de la création de la note',
            'Fermer',
            {
              duration: 3000,
            },
          );
          this.loading = false;
        },
      });
    }
  }
}
