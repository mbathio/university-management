// src/app/modules/administration/document-management/document-form/document-form.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DocumentService } from '../../../../core/services/document.service';
import { Document, DocumentType } from '../../../../core/models/user.model';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../../core/auth/auth.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

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
  ],
})
export class DocumentFormComponent implements OnInit {
  documentForm!: FormGroup;
  isEditMode = false;
  documentId?: number;
  loading = false;
  selectedFile: File | null = null;
  documentTypes = Object.values(DocumentType);
  visibilityLevels = ['PUBLIC', 'ADMINISTRATION', 'STAFF', 'STUDENTS'];

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
      visibilityLevel: ['PUBLIC', Validators.required],
      file: [''],
    });
  }

  loadDocument(id: number): void {
    this.loading = true;
    this.documentService.getDocumentById(id).subscribe({
      next: (document) => {
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
        this.router.navigate(['/administration/documents']);
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

    const document: Partial<Document> = {
      title: this.documentForm.value.title,
      content: this.documentForm.value.content,
      type: this.documentForm.value.type,
      visibilityLevel: this.documentForm.value.visibilityLevel,
    };

    formData.append(
      'document',
      new Blob([JSON.stringify(document)], { type: 'application/json' }),
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
          this.router.navigate(['/administration/documents']);
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
      const currentUser = this.authService.currentUserValue;

      if (!currentUser || !currentUser.id) {
        this.snackBar.open(
          'Vous devez être connecté pour effectuer cette action',
          'Fermer',
          { duration: 3000 },
        );
        this.loading = false;
        return;
      }

      this.documentService.createDocument(formData, currentUser.id).subscribe({
        next: () => {
          this.snackBar.open('Document créé avec succès', 'Fermer', {
            duration: 3000,
          });
          this.router.navigate(['/administration/documents']);
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
    this.router.navigate(['/administration/documents']);
  }
}
