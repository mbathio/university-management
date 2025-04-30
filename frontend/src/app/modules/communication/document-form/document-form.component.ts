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
import { HttpErrorResponse } from '@angular/common/http';

interface ValidationResult {
  valid: boolean;
  errors?: string[];
}

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
  validationErrors: string[] = [];

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
    private documentService: { validateDocument: (formValues: any) => any; updateDocument: (id: number, formData: FormData) => any; uploadDocument: (formData: FormData, metadata: any) => any; deleteDocument: (id: number) => any; getDocumentById: (id: number) => any },
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
      next: (document: Document) => {
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
      error: (error: HttpErrorResponse) => {
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
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // File type validation
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword'];
      if (!allowedTypes.includes(file.type)) {
        this.snackBar.open('Type de fichier non autorisé', 'Fermer', { duration: 3000 });
        return;
      }

      // File size validation (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        this.snackBar.open('La taille du fichier ne doit pas dépasser 10 Mo', 'Fermer', { duration: 3000 });
        return;
      }

      this.selectedFile = file;
      this.documentForm.patchValue({ file: file.name });
    }
  }

  submitDocument(): void {
    if (this.documentForm.invalid) {
      this.documentForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.validationErrors = [];

    // Prepare form data
    const formData = new FormData();
    const formValues = this.documentForm.value;

    // Validate document first
    this.documentService.validateDocument(formValues).subscribe({
      next: (validationResult: ValidationResult) => {
        if (!validationResult.valid) {
          this.validationErrors = validationResult.errors || [];
          this.loading = false;
          return;
        }

        // Add form fields to FormData
        Object.keys(formValues).forEach(key => {
          if (formValues[key] !== null && formValues[key] !== undefined) {
            formData.append(key, formValues[key]);
          }
        });

        // Add file if selected
        if (this.selectedFile) {
          formData.append('documentFile', this.selectedFile, this.selectedFile.name);
        }

        // Additional metadata
        const metadata = {
          uploadedBy: this.authService.currentUserValue?.username,
          uploadedAt: new Date().toISOString()
        };

        // Submit document
        const submitMethod = this.isEditMode 
          ? this.documentService.updateDocument(this.documentId!, formData)
          : this.documentService.uploadDocument(formData, metadata);

        submitMethod.subscribe({
          next: (document: Document) => {
            this.snackBar.open(
              this.isEditMode 
                ? 'Document mis à jour avec succès' 
                : 'Document ajouté avec succès', 
              'Fermer', 
              { duration: 3000 }
            );
            this.router.navigate(['/communication/documents']);
          },
          error: (error: HttpErrorResponse) => {
            this.loading = false;
            this.snackBar.open(
              'Erreur lors de la soumission du document', 
              'Fermer', 
              { duration: 3000 }
            );
            console.error('Document submission error:', error);
          }
        });
      },
      error: (error: unknown) => {
        console.error('Validation error', error);
        this.loading = false;
      }
    });
  }

  cancel(): void {
    // Fixed navigation path for communication module
    this.router.navigate(['/communication']);
  }

  deleteDocument(): void {
    if (!this.documentId) return;

    const confirmDelete = confirm('Êtes-vous sûr de vouloir supprimer ce document ?');
    if (confirmDelete) {
      this.loading = true;
      this.documentService.deleteDocument(this.documentId).subscribe({
        next: () => {
          this.snackBar.open(
            'Document supprimé avec succès', 
            'Fermer', 
            { duration: 3000 }
          );
          this.router.navigate(['/communication/documents']);
        },
        error: (error: Error | any) => {
          this.loading = false;
          this.snackBar.open(
            'Erreur lors de la suppression du document', 
            'Fermer', 
            { duration: 3000 }
          );
          console.error('Document deletion error:', error);
        }
      });
    }
  }
}
