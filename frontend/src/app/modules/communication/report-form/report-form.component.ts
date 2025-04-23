// src/app/modules/communication/report-form/report-form.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DocumentService } from '../services/document.service';
import { DocumentType } from '../../../core/models/user.model';

@Component({
  selector: 'app-report-form',
  templateUrl: './report-form.component.html',
  styleUrls: ['./report-form.component.scss'],
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
      error: (error) => {
        this.snackBar.open('Erreur lors du chargement du rapport', 'Fermer', {
          duration: 3000,
        });
        this.loading = false;
        this.router.navigate(['/communication/reports']);
      },
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];

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
        event.target.value = '';
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
        event.target.value = '';
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
    const formData = {
      ...this.reportForm.value,
      type: DocumentType.REPORT,
    };

    if (this.isEditMode && this.reportId) {
      // Mode édition
      this.documentService
        .updateDocument(this.reportId, formData, this.selectedFile)
        .subscribe({
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
      this.documentService
        .createDocument(formData, this.selectedFile)
        .subscribe({
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
    }
  }
}
