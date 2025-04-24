// src/app/modules/insertion/insertion-form/insertion-form.component.ts
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  InsertionService,
  Insertion,
  InsertionStatus,
} from '../services/insertion.service';
import { StudentService } from '../../students/services/student.service';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { CommonModule } from '@angular/common';

// Import Angular Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-insertion-form',
  templateUrl: './insertion-form.component.html',
  styleUrls: ['./insertion-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
  ],
})
export class InsertionFormComponent implements OnInit {
  insertionForm!: FormGroup;
  isEditMode = false;
  insertionId?: number;
  loading = false;
  students: any[] = [];
  insertionStatuses = Object.values(InsertionStatus);
  contractTypes = ['CDI', 'CDD', 'Alternance', 'Stage', 'Freelance', 'Autre'];
  salaryRanges = [
    'Moins de 20K€',
    '20K€ - 30K€',
    '30K€ - 40K€',
    '40K€ - 50K€',
    '50K€ - 60K€',
    '60K€ - 70K€',
    '70K€ - 80K€',
    'Plus de 80K€',
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private insertionService: InsertionService,
    private studentService: StudentService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadStudents();

    // Check if we're in edit mode
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.insertionId = +id;
        this.loadInsertion(this.insertionId);
      }
    });
  }

  private initForm(): void {
    this.insertionForm = this.fb.group({
      studentId: ['', [Validators.required]],
      companyName: ['', [Validators.required, Validators.maxLength(100)]],
      position: ['', [Validators.required, Validators.maxLength(100)]],
      industry: ['', [Validators.required, Validators.maxLength(100)]],
      startDate: [null, [Validators.required]],
      salaryRange: [''],
      contractType: ['', [Validators.required]],
      location: ['', [Validators.required, Validators.maxLength(100)]],
      feedback: ['', [Validators.maxLength(500)]],
      status: ['', [Validators.required]],
    });
  }

  private loadStudents(): void {
    this.studentService
      .getAllStudents()
      .pipe(
        catchError((error) => {
          this.snackBar.open(
            'Erreur lors du chargement des étudiants',
            'Fermer',
            {
              duration: 3000,
            },
          );
          return of([]);
        }),
      )
      .subscribe((students) => {
        this.students = students;
      });
  }

  private loadInsertion(id: number): void {
    this.loading = true;
    this.insertionService
      .getInsertionById(id)
      .pipe(
        catchError((error) => {
          this.snackBar.open(
            "Erreur lors du chargement des données d'insertion",
            'Fermer',
            {
              duration: 3000,
            },
          );
          this.router.navigate(['/insertion']);
          return of(null);
        }),
        finalize(() => {
          this.loading = false;
        }),
      )
      .subscribe((insertion) => {
        if (insertion) {
          this.insertionForm.patchValue({
            studentId: insertion.studentId,
            companyName: insertion.companyName,
            position: insertion.position,
            industry: insertion.industry,
            startDate: insertion.startDate
              ? new Date(insertion.startDate)
              : null,
            salaryRange: insertion.salaryRange,
            contractType: insertion.contractType,
            location: insertion.location,
            feedback: insertion.feedback,
            status: insertion.status,
          });
        }
      });
  }

  onSubmit(): void {
    if (this.insertionForm.invalid) {
      // Mark all fields as touched to trigger validation visualization
      Object.keys(this.insertionForm.controls).forEach((key) => {
        const control = this.insertionForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.loading = true;
    const insertionData = this.insertionForm.value;

    if (this.isEditMode && this.insertionId) {
      this.insertionService
        .updateInsertion(this.insertionId, insertionData)
        .pipe(
          catchError((error) => {
            this.snackBar.open(
              "Erreur lors de la mise à jour des données d'insertion",
              'Fermer',
              {
                duration: 3000,
              },
            );
            return of(null);
          }),
          finalize(() => {
            this.loading = false;
          }),
        )
        .subscribe((response) => {
          if (response) {
            this.snackBar.open(
              "Données d'insertion mises à jour avec succès",
              'Fermer',
              {
                duration: 3000,
              },
            );
            this.router.navigate(['/insertion']);
          }
        });
    } else {
      this.insertionService
        .createInsertion(insertionData)
        .pipe(
          catchError((error) => {
            this.snackBar.open(
              "Erreur lors de la création des données d'insertion",
              'Fermer',
              {
                duration: 3000,
              },
            );
            return of(null);
          }),
          finalize(() => {
            this.loading = false;
          }),
        )
        .subscribe((response) => {
          if (response) {
            this.snackBar.open(
              "Données d'insertion créées avec succès",
              'Fermer',
              {
                duration: 3000,
              },
            );
            this.router.navigate(['/insertion']);
          }
        });
    }
  }

  // Method to display user-friendly status strings
  getStatusDisplay(status: InsertionStatus): string {
    switch (status) {
      case InsertionStatus.SEARCHING:
        return 'En recherche';
      case InsertionStatus.INTERVIEW_PROCESS:
        return "En processus d'entretien";
      case InsertionStatus.OFFER_RECEIVED:
        return 'Offre reçue';
      case InsertionStatus.HIRED:
        return 'Embauché';
      case InsertionStatus.CONTINUING_STUDIES:
        return "Poursuite d'études";
      case InsertionStatus.OTHER:
        return 'Autre';
      default:
        return status; // Fallback to raw value if not matched
    }
  }

  // Getters for form controls to easily access in the template
  get studentIdControl() {
    return this.insertionForm.get('studentId');
  }
  get companyNameControl() {
    return this.insertionForm.get('companyName');
  }
  get positionControl() {
    return this.insertionForm.get('position');
  }
  get industryControl() {
    return this.insertionForm.get('industry');
  }
  get startDateControl() {
    return this.insertionForm.get('startDate');
  }
  get contractTypeControl() {
    return this.insertionForm.get('contractType');
  }
  get locationControl() {
    return this.insertionForm.get('location');
  }
  get statusControl() {
    return this.insertionForm.get('status');
  }
}
