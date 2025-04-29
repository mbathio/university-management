// src/app/modules/communication/report-form/report-form.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
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

// Import Document types
import { Document, DocumentType, VisibilityLevel } from '../../../core/models/document.model';
import { DocumentService } from '../../../core/services/document.service';
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
    MatDividerModule,
  ],
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
    DocumentType.UNIVERSITY_COUNCIL,
  ];
  visibilityLevels = Object.values(VisibilityLevel);
  document: Document | null = null;

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
      tags: [''],
    });
  }

  loadReport(id: number): void {
    this.loading = true;
    this.documentService.getDocumentById(id).subscribe({
      next: (document) => {
        // Check if it's a report type
        if (!this.reportTypes.includes(document.type as DocumentType)) {
          this.snackBar.open("Ce document n'est pas un rapport", 'Fermer', {
            duration: 3000,
          });
          this.router.navigate(['/communication']);
          return;
        }

        this.document = document;
        this.documentFilePath = document.filePath || null;

        // Parse additional data from content if available
        const meetingDate = new Date();
        const participants = '';
        const location = '';
        const tags = document.tags ? document.tags.join(', ') : '';

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
          tags: tags,
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement du rapport', error);
        this.snackBar.open('Erreur lors du chargement du rapport', 'Fermer', {
          duration: 3000,
        });
        this.loading = false;
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
    if (this.reportForm.invalid) {
      return;
    }

    this.loading = true;
    const formData = new FormData();

    // Extract tags from the comma-separated string
    const tagsString = this.reportForm.value.tags;
    const tags = tagsString
      ? tagsString
          .split(',')
          .map((tag: string) => tag.trim())
          .filter((tag: string) => tag)
      : [];

    // Create enriched content with meeting details
    const enrichedContent = `
    <h3>Compte rendu</h3>
    <p><strong>Titre:</strong> ${this.reportForm.value.title}</p>
    <p><strong>Date:</strong> ${this.reportForm.value.meetingDate}</p>
    <p><strong>Lieu:</strong> ${this.reportForm.value.location}</p>
    <p><strong>Participants:</strong> ${this.reportForm.value.participants}</p>
    <div class="report-content">
      ${this.reportForm.value.content}
    </div>
    `;

    // Create document data object
    const documentData: Document = {
      title: this.reportForm.value.title,
      content: enrichedContent,
      type: this.mapToDocumentType(this.reportForm.value.type),
      visibilityLevel: this.reportForm.value.visibilityLevel,
      tags: tags,
      reference: `REPORT-${new Date().getTime()}`,
      id: -1, // Temporary ID, will be replaced by backend
      createdBy: this.authService.currentUserValue 
        ? {
            id: this.authService.currentUserValue.id,
            username: this.authService.currentUserValue.username,
            fullName: this.authService.currentUserValue.fullName || this.authService.currentUserValue.username
          }
        : {
            id: -1, // Use a default ID to indicate no user
            username: 'anonymous',
            fullName: 'Anonymous User'
          },
      createdAt: new Date(),
      updatedAt: undefined,
    };

    // Append document as JSON
    formData.append('document', new Blob([JSON.stringify(documentData)], {
      type: 'application/json'
    }), 'document.json');

    // Append file if selected
    if (this.selectedFile) {
      formData.append('file', this.selectedFile);
    }

    this.documentService.createDocument(formData).subscribe({
      next: () => {
        this.snackBar.open('Rapport créé avec succès', 'Fermer', {
          duration: 3000,
        });
        this.router.navigate(['/communication/reports']);
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors de la création', error);
        this.snackBar.open(
          'Erreur lors de la création du rapport',
          'Fermer',
          {
            duration: 3000,
          }
        );
        this.loading = false;
      },
    });
  }

  private mapToDocumentType(formType: string | DocumentType): DocumentType {
    // If already a DocumentType, return it directly
    if (Object.values(DocumentType).includes(formType as DocumentType)) {
      return formType as DocumentType;
    }

    const typeMapping: { [key: string]: DocumentType } = {
      'meeting': DocumentType.MEETING_REPORT,
      'seminar': DocumentType.SEMINAR_REPORT,
      'webinar': DocumentType.WEBINAR_REPORT,
      'university_council': DocumentType.UNIVERSITY_COUNCIL,
      'service_note': DocumentType.NOTE_SERVICE,
      'circular': DocumentType.CIRCULAR,
      'administrative_note': DocumentType.ADMINISTRATIVE_NOTE,
      'other': DocumentType.OTHER
    };
    
    return typeMapping[formType as string] || DocumentType.OTHER;
  }
}
