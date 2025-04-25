// src/app/modules/communication/document-form/document-form.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DocumentService } from '../../../core/services/document.service';
import {
  Document,
  DocumentType,
  VisibilityLevel,
} from '../../../core/models/document.model';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/auth/auth.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-document-form',
  templateUrl: './document-form.component.html',
  styleUrls: ['./document-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatIconModule,
    MatTooltipModule,
    RouterModule,
  ],
})
export class DocumentFormComponent implements OnInit {
  documentForm!: FormGroup;
  isEditMode = false;
  documentId?: number;
  loading = false;
  selectedFile: File | null = null;
  documentFilePath: string | null = null;
  document: Document | null = null;
  documentTypes = Object.values(DocumentType);
  visibilityLevels = Object.values(VisibilityLevel);

  clearExistingFile(): void {
    this.documentFilePath = null;
  }

  clearSelectedFile(): void {
    this.selectedFile = null;
  }

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private documentService: DocumentService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
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
    this.documentForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      content: [''],
      type: ['', Validators.required],
      visibilityLevel: [VisibilityLevel.PUBLIC, Validators.required],
      file: [''],
    });
  }

  loadDocument(id: number): void {
    this.loading = true;
    this.documentService.getDocumentById(id).subscribe({
      next: (document) => {
        this.document = document;
        this.documentFilePath = document.filePath || null;

        this.documentForm.patchValue({
          title: document.title,
          content: document.content,
          type: document.type,
          visibilityLevel: document.visibilityLevel,
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement du document', error);
        this.snackBar.open('Erreur lors du chargement du document', 'Fermer', {
          duration: 3000,
        });
        this.loading = false;
        // Fixed navigation path for communication module
        this.router.navigate(['/communication']);
      },
    });
  }

  onFileSelected(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files[0]) {
      this.selectedFile = fileInput.files[0];
    }
  }

  onSubmit(): void {
    if (this.documentForm.invalid) {
      Object.keys(this.documentForm.controls).forEach((key) => {
        this.documentForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading = true;
    const formData = new FormData();

    const documentData: Partial<Document> = {
      title: this.documentForm.value.title,
      content: this.documentForm.value.content,
      type: this.documentForm.value.type,
      visibilityLevel: this.documentForm.value.visibilityLevel,
    };

    formData.append(
      'document',
      new Blob([JSON.stringify(documentData)], { type: 'application/json' }),
    );

    if (this.selectedFile) {
      formData.append('file', this.selectedFile);
    }

    if (this.isEditMode && this.documentId) {
      this.documentService.updateDocument(this.documentId, formData).subscribe({
        next: () => {
          this.snackBar.open('Document mis à jour avec succès', 'Fermer', {
            duration: 3000,
          });
          // Fixed navigation path for communication module
          this.router.navigate(['/communication']);
          this.loading = false;
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour', error);
          this.snackBar.open(
            'Erreur lors de la mise à jour du document',
            'Fermer',
            { duration: 3000 },
          );
          this.loading = false;
        },
      });
    } else {
      this.documentService.createDocument(formData).subscribe({
        next: () => {
          this.snackBar.open('Document créé avec succès', 'Fermer', {
            duration: 3000,
          });
          // Fixed navigation path for communication module
          this.router.navigate(['/communication']);
          this.loading = false;
        },
        error: (error) => {
          console.error('Erreur lors de la création', error);
          this.snackBar.open(
            'Erreur lors de la création du document',
            'Fermer',
            { duration: 3000 },
          );
          this.loading = false;
        },
      });
    }
  }

  cancel(): void {
    // Fixed navigation path for communication module
    this.router.navigate(['/communication']);
  }
}
