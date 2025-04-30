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
import { catchError, throwError } from 'rxjs';

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
      attachment: ['']
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
      this.snackBar.open('Please fill in all required fields', 'Close', {
        duration: 3000,
        panelClass: 'error-snackbar'
      });
      return;
    }

    // Prepare document data
    const documentData = {
      title: this.reportForm.get('title')?.value?.trim(),
      description: this.reportForm.get('content')?.value?.trim(),
      type: this.mapToDocumentType(this.reportForm.get('type')?.value),
      visibilityLevel: this.reportForm.get('visibilityLevel')?.value
    };

    // Validate document data
    if (!documentData.title || !documentData.description) {
      this.snackBar.open('Title and description are required', 'Close', {
        duration: 3000,
        panelClass: 'error-snackbar'
      });
      return;
    }

    // Create FormData for multipart upload
    const formData = new FormData();
    
    // Append document as JSON string
    formData.append('document', JSON.stringify(documentData));

    // Append file if exists
    const fileInput = this.reportForm.get('attachment');
    if (fileInput && fileInput.value) {
      const fileList = fileInput.value;
      if (fileList.length > 0) {
        formData.append('file', fileList[0], fileList[0].name);
      }
    }

    this.loading = true;
    this.documentService.createDocument(formData).pipe(
      catchError((error) => {
        this.loading = false;
        
        // More detailed error handling
        const errorMessage = error.error?.message || 
                              error.message || 
                              'Failed to create document';
        
        this.snackBar.open(`Error: ${errorMessage}`, 'Close', {
          duration: 5000,
          panelClass: 'error-snackbar'
        });
        
        return throwError(error);
      })
    ).subscribe({
      next: (response) => {
        this.snackBar.open('Document created successfully', 'Close', {
          duration: 3000
        });
        this.reportForm.reset();
        this.router.navigate(['/communication/reports']);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
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
