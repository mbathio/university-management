// src/app/modules/communication/circular-form/circular-form.component.ts
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { DocumentService } from '../../../core/services/document.service';
import { Document, DocumentType, VisibilityLevel } from '../../../core/models/document.model';

@Component({
  selector: 'app-circular-form',
  templateUrl: './circular-form.component.html',
  styleUrls: ['./circular-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ]
})
export class CircularFormComponent implements OnInit {
  circularForm!: FormGroup;
  isEditMode = false;
  documentId?: number;
  loading = false;
  selectedFile: File | null = null;
  documentTypes = [
    DocumentType.NOTE_SERVICE,
    DocumentType.CIRCULAR,
    DocumentType.ADMINISTRATIVE_NOTE
  ];
  visibilityLevels = Object.values(VisibilityLevel);

  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private documentService: DocumentService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initForm();

    const idParam = this.route.snapshot.params['id'];
    if (idParam && !isNaN(+idParam)) {
      this.documentId = +idParam;
      this.isEditMode = true;
      this.loadDocument(this.documentId);
    }
  }

  initForm(): void {
    this.circularForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      content: ['', [Validators.required, Validators.maxLength(5000)]],
      type: [DocumentType.CIRCULAR, Validators.required],
      visibilityLevel: [VisibilityLevel.PUBLIC, Validators.required],
      file: ['']
    });
  }

  loadDocument(id: number): void {
    this.loading = true;
    this.documentService.getDocumentById(id).subscribe({
      next: (document) => {
        // Check if it's an admin document type
        if (!this.documentTypes.includes(document.type as DocumentType)) {
          this.snackBar.open('Ce document n\'est pas une circulaire ou une note administrative', 'Fermer', {
            duration: 3000
          });
          this.router.navigate(['/communication']);
          return;
        }

        this.circularForm.patchValue({
          title: document.title,
          content: document.content,
          type: document.type,
          visibilityLevel: document.visibilityLevel
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement du document', error);
        this.snackBar.open('Erreur lors du chargement du document', 'Fermer', {
          duration: 3000
        });
        this.loading = false;
        this.router.navigate(['/communication']);
      }
    });
  }

  onFileSelected(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files[0]) {
      this.selectedFile = fileInput.files[0];
    }
  }

  onSubmit(): void {
    if (this.circularForm.invalid) {
      Object.keys(this.circularForm.controls).forEach(key => {
        this.circularForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading = true;
    const formData = new FormData();

    const documentData: Partial<Document> = {
      title: this.circularForm.value.title,
      content: this.circularForm.value.content,
      type: this.circularForm.value.type,
      visibilityLevel: this.circularForm.value.visibilityLevel
    };

    formData.append('document', new Blob([JSON.stringify(documentData)], { type: 'application/json' }));

    if (this.selectedFile) {
      formData.append('file', this.selectedFile);
    }

    if (this.isEditMode && this.documentId) {
      this.documentService.updateDocument(this.documentId, formData).subscribe({
        next: () => {
          this.snackBar.open('Document mis à jour avec succès', 'Fermer', {
            duration: 3000
          });
          this.router.navigate(['/communication']);
          this.loading = false;
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour', error);
          this.snackBar.open('Erreur lors de la mise à jour du document', 'Fermer', {
            duration: 3000
          });
          this.loading = false;
        }
      });
    } else {
      this.documentService.createDocument(formData).subscribe({
        next: () => {
          this.snackBar.open('Document créé avec succès', 'Fermer', {
            duration: 3000
          });
          this.router.navigate(['/communication']);
          this.loading = false;
        },
        error: (error) => {
          console.error('Erreur lors de la création', error);
          this.snackBar.open('Erreur lors de la création du document', 'Fermer', {
            duration: 3000
          });
          this.loading = false;
        }
      });
    }
  }
}