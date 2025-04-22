// src/app/modules/administration/document-management/document-form/document-form.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DocumentService } from '../../../../core/services/document.service';
import { Document, DocumentType } from '../../../../core/models/user.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-document-form',
  templateUrl: './document-form.component.html',
  styleUrls: ['./document-form.component.scss']
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
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.documentId = +this.route.snapshot.params['id'];
    
    if (this.documentId) {
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
      file: ['']
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
          visibilityLevel: document.visibilityLevel
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading document', error);
        this.loading = false;
        this.snackBar.open('Erreur lors du chargement du document', 'Fermer', {
          duration: 3000
        });
        this.router.navigate(['/administration/documents']);
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
    if (this.documentForm.invalid) {
      return;
    }

    this.loading = true;
    const formData = new FormData();
    const document: Partial<Document> = {
      title: this.documentForm.value.title,
      content: this.documentForm.value.content,
      type: this.documentForm.value.type,
      visibilityLevel: this.documentForm.value.visibilityLevel
    };

    // Add document JSON as a blob
    formData.append('document', new Blob([JSON.stringify(document)], {
      type: 'application/json'
    }));

    // Add file if selected
    if (this.selectedFile) {
      formData.append('file', this.selectedFile);
    }

    if (this.isEditMode && this.documentId) {
      this.documentService.updateDocument(this.documentId, formData).subscribe({
        next: () => {
          this.loading = false;
          this.snackBar.open('Document mis à jour avec succès', 'Fermer', {
            duration: 3000
          });
          this.router.navigate(['/administration/documents']);
        },
        error: (error) => {
          console.error('Error updating document', error);
          this.loading = false;
          this.snackBar.open('Erreur lors de la mise à jour du document', 'Fermer', {
            duration: 3000
          });
        }
      });
    } else {
      // Add user ID
      const userId = this.authService.currentUserValue?.id;
      if (userId) {
        this.documentService.createDocument(formData, userId).subscribe({
          next: () => {
            this.loading = false;
            this.snackBar.open('Document créé avec succès', 'Fermer', {
              duration: 3000
            });
            this.router.navigate(['/administration/documents']);
          },
          error: (error) => {
            console.error('Error creating document', error);
            this.loading = false;
            this.snackBar.open('Erreur lors de la création du document', 'Fermer', {
              duration: 3000
            });
          }
        });
      }
    }
  }

  cancel(): void {
    this.router.navigate(['/administration/documents']);
  }
}