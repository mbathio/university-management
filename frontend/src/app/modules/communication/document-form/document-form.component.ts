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
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DocumentService } from '../services/document.service';
import {
  DocumentType,
  VisibilityLevel,
} from '../../../core/models/document.model';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-document-form',
  templateUrl: './document-form.component.html',
  styleUrls: ['./document-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
})
export class DocumentFormComponent implements OnInit {
  documentForm!: FormGroup;
  isEditMode = false;
  documentId: number | null = null;
  loading = false;
  selectedFile: File | null = null;

  documentTypes = Object.values(DocumentType);
  visibilityLevels = Object.values(VisibilityLevel);

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private documentService: DocumentService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.createForm();

    // Vérifier si c'est un mode édition
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.documentId = +id;
      this.loadDocument(this.documentId);
    }
  }

  createForm(): void {
    this.documentForm = this.formBuilder.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      content: ['', Validators.maxLength(5000)],
      type: ['', Validators.required],
      visibilityLevel: ['PUBLIC', Validators.required],
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
      error: () => {
        this.snackBar.open('Erreur lors du chargement du document', 'Fermer', {
          duration: 3000,
        });
        this.loading = false;
        this.router.navigate(['/communication']);
      },
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    // Vérifier si un fichier a été sélectionné
    if (file) {
      // Vérifier la taille (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        this.snackBar.open(
          'Le fichier est trop volumineux. Maximum 10MB.',
          'Fermer',
          {
            duration: 3000,
          },
        );
        // Réinitialiser l'input file
        if (input) {
          input.value = '';
        }
        this.selectedFile = null;
        return;
      }

      // Vérifier l'extension du fichier
      const allowedExtensions = [
        'pdf',
        'doc',
        'docx',
        'xls',
        'xlsx',
        'ppt',
        'pptx',
        'txt',
        'zip',
        'jpg',
        'jpeg',
        'png',
        'gif',
      ];
      const fileExt = file.name.split('.').pop()?.toLowerCase();

      if (!fileExt || !allowedExtensions.includes(fileExt)) {
        this.snackBar.open('Type de fichier non autorisé', 'Fermer', {
          duration: 3000,
        });
        // Réinitialiser l'input file
        if (event.target) {
          (event.target as HTMLInputElement).value = '';
        }
        this.selectedFile = null;
        return;
      }

      this.selectedFile = file;
    }
  }

  onSubmit(): void {
    if (this.documentForm.invalid) {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      Object.keys(this.documentForm.controls).forEach((key) => {
        const control = this.documentForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.loading = true;
    const formData = new FormData();
    const documentData = this.documentForm.value;

    // Ajouter le document comme JSON blob
    formData.append(
      'document',
      new Blob([JSON.stringify(documentData)], { type: 'application/json' }),
    );

    // Ajouter le fichier si présent
    if (this.selectedFile) {
      formData.append(
        'file',
        this.selectedFile ?? undefined,
        this.selectedFile.name,
      );
    }

    if (this.isEditMode && this.documentId) {
      // Mode édition
      this.documentService
        .updateDocument(this.documentId, documentData)
        .subscribe({
          next: () => {
            this.snackBar.open('Document mis à jour avec succès', 'Fermer', {
              duration: 3000,
            });
            this.router.navigate(['/communication']);
          },
          error: () => {
            this.snackBar.open(
              'Erreur lors de la mise à jour du document',
              'Fermer',
              {
                duration: 3000,
              },
            );
            this.loading = false;
          },
        });
    } else {
      // Mode création
      const userId = this.authService.currentUserValue?.id;
      if (!userId) {
        this.snackBar.open('Utilisateur non authentifié', 'Fermer', {
          duration: 3000,
        });
        this.loading = false;
        return;
      }

      this.documentService.createDocument(documentData).subscribe({
        next: () => {
          this.snackBar.open('Document créé avec succès', 'Fermer', {
            duration: 3000,
          });
          this.router.navigate(['/communication']);
        },
        error: () => {
          this.snackBar.open(
            'Erreur lors de la création du document',
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
