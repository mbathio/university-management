// src/app/modules/communication/report-form/report-form.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';

import { DocumentService } from '../../../core/services/document.service';
import { Document, DocumentType, VisibilityLevel } from '../../../core/models/document.model';
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
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatChipsModule,
    MatDividerModule
  ]
})
export class ReportFormComponent implements OnInit {
  reportForm!: FormGroup;
  isEditMode = false;
  documentId?: number;
  loading = false;
  selectedFile: File | null = null;
  documentFilePath: string | null = null;
  reportTypes = [
    DocumentType.MEETING_REPORT,
    DocumentType.SEMINAR_REPORT,
    DocumentType.WEBINAR_REPORT,
    DocumentType.UNIVERSITY_COUNCIL
  ];
  visibilityLevels = Object.values(VisibilityLevel);
  document: Document | null = null;

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

    const idParam = this.route.snapshot.params['id'];
    if (idParam && !isNaN(+idParam)) {
      this.documentId = +idParam;
      this.isEditMode = true;
      this.loadReport(this.documentId);
    }
  }

  initForm(): void {
    this.reportForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      content: ['', [Validators.required, Validators.maxLength(5000)]],
      type: [DocumentType.MEETING_REPORT, Validators.required],
      visibilityLevel: [VisibilityLevel.PUBLIC, Validators.required],
      meetingDate: [new Date(), Validators.required],
      participants: [''],
      location: [''],
      tags: ['']
    });
  }

  loadReport(id: number): void {
    this.loading = true;
    this.documentService.getDocumentById(id).subscribe({
      next: (document) => {
        // Check if it's a report type
        if (!this.reportTypes.includes(document.type as DocumentType)) {
          this.snackBar.open('Ce document n\'est pas un rapport', 'Fermer', {
            duration: 3000
          });
          this.router.navigate(['/communication']);
          return;
        }

        this.document = document;
        this.documentFilePath = document.filePath || null;

        // Parse additional data from content if available
        let meetingDate = new Date();
        let participants = '';
        let location = '';
        let tags = document.tags ? document.tags.join(', ') : '';

        // In a real app, these would be properly structured in the document
        // For now, assume they're stored in the content or additional metadata fields

        this.reportForm.patchValue({
          title: document.title,
          content: document.content,
          type: document.type,
          visibilityLevel: document.visibilityLevel,
          meetingDate: meetingDate,
          participants: participants,
          location: location,
          tags: tags
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement du rapport', error);
        this.snackBar.open('Erreur lors du chargement du rapport', 'Fermer', {
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
    if (this.reportForm.invalid) {
      return;
    }

    this.loading = true;
    const formData = new FormData();

    // Extract tags from the comma-separated string
    const tagsString = this.reportForm.value.tags;
    const tags = tagsString ? tagsString.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag) : [];

    // Create enriched content with meeting details
    const enrichedContent = `
      <h3>Compte rendu</h3>
      <p><strong>Date:</strong> ${this.reportForm.value.meetingDate.toLocaleDateString()}</p>
      <p><strong>Lieu:</strong> ${this.reportForm.value.location}</p>
      <p><strong>Participants:</strong> ${this.reportForm.value.participants}</p>
      <div class="report-content">
        ${this.reportForm.value.content}
      </div>
    `;

    const documentData: Partial<Document> = {
      title: this.reportForm.value.title,
      content: enrichedContent,
      type: this.reportForm.value.type,
      visibilityLevel: this.reportForm.value.visibilityLevel,
      tags: tags
    };

    formData.append(
      'document',
      new Blob([JSON.stringify(documentData)], { type: 'application/json' })
    );

    if (this.selectedFile) {
      formData.append('file', this.selectedFile);
    }

    if (this.isEditMode && this.documentId) {
      this.documentService.updateDocument(this.documentId, formData).subscribe({
        next: () => {
          this.snackBar.open('Rapport mis à jour avec succès', 'Fermer', {
            duration: 3000
          });
          this.router.navigate(['/communication/report-list']);
          this.loading = false;
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour', error);
          this.snackBar.open('Erreur lors de la mise à jour du rapport', 'Fermer', {
            duration: 3000
          });
          this.loading = false;
        }
      });
    } else {
      this.documentService.createDocument(formData).subscribe({
        next: () => {
          this.snackBar.open('Rapport créé avec succès', 'Fermer', {
            duration: 3000
          });
          this.router.navigate(['/communication/report-list']);
          this.loading = false;
        },
        error: (error) => {
          console.error('Erreur lors de la création', error);
          this.snackBar.open('Erreur lors de la création du rapport', 'Fermer', {
            duration: 3000
          });
          this.loading = false;
        }
      });
    }
  }
}