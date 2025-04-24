// src/app/modules/communication/report-form/report-form.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { DocumentService } from '../../../core/services/document.service';
import { DocumentType } from '../../../core/models/user.model';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-report-form',
  templateUrl: './report-form.component.html',
  styleUrls: ['./report-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ]
})
export class ReportFormComponent implements OnInit {
  reportForm!: FormGroup;
  isEditMode = false;
  reportId: number | null = null;
  loading = false;
  selectedFile: File | null = null;

  visibilityLevels = ['PUBLIC', 'RESTRICTED', 'PRIVATE'];

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
      this.reportId = +id;
      this.loadReport(this.reportId);
    }
  }

  createForm(): void {
    this.reportForm = this.formBuilder.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      content: ['', Validators.maxLength(5000)],
      visibilityLevel: ['RESTRICTED', Validators.required],
    });
  }

  loadReport(id: number): void {
    this.loading = true;

    this.documentService.getDocumentById(id).subscribe({
      next: (document) => {
        if (document.type !== DocumentType.REPORT) {
          this.snackBar.open("Ce document n'est pas un rapport", 'Fermer', {
            duration: 3000,
          });
          this.router.navigate(['/communication/reports']);
          return;
        }

        this.reportForm.patchValue({
          title: document.title,
          content: document.content,
          visibilityLevel: document.visibilityLevel,
        });
        this.loading = false;
      },
      error: () => {
        this.snackBar.open('Erreur lors du chargement du rapport', 'Fermer', {
          duration: 3000,
        });
        this.loading = false;
        this.router.navigate(['/communication/reports']);
      },
    });
  }

  onFileSelected(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const file = inputElement.files?.[0];

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
        inputElement.value = '';
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
        inputElement.value = '';
        this.selectedFile = null;
        return;
      }

      this.selectedFile = file;
    }
  }

  onSubmit(): void {
    if (this.reportForm.invalid) {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      Object.keys(this.reportForm.controls).forEach((key) => {
        const control = this.reportForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.loading = true;
    const formData = new FormData();
    const documentData = {
      ...this.reportForm.value,
      type: DocumentType.REPORT,
    };

    // Add document data as JSON
    formData.append(
      'document',
      new Blob([JSON.stringify(documentData)], {
        type: 'application/json',
      }),
    );

    // Add file if selected
    if (this.selectedFile) {
      formData.append('file', this.selectedFile, this.selectedFile.name);
    }

    if (this.isEditMode && this.reportId) {
      // Mode édition
      this.documentService.updateDocument(this.reportId, formData).subscribe({
        next: () => {
          this.snackBar.open('Rapport mis à jour avec succès', 'Fermer', {
            duration: 3000,
          });
          this.router.navigate(['/communication/reports']);
        },
        error: () => {
          this.snackBar.open(
            'Erreur lors de la mise à jour du rapport',
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
      this.authService.currentUser.subscribe((user) => {
        const currentUserId = user?.id;
        if (!currentUserId) {
          this.snackBar.open('Utilisateur non authentifié', 'Fermer', {
            duration: 3000,
          });
          this.loading = false;
          return;
        }

        // Add userId to formData
        formData.append('userId', currentUserId.toString());

        this.documentService.createDocument(formData, currentUserId).subscribe({
          next: () => {
            this.snackBar.open('Rapport créé avec succès', 'Fermer', {
              duration: 3000,
            });
            this.router.navigate(['/communication/reports']);
          },
          error: () => {
            this.snackBar.open(
              'Erreur lors de la création du rapport',
              'Fermer',
              {
                duration: 3000,
              },
            );
            this.loading = false;
          },
        });
      });
    }
  }
}
