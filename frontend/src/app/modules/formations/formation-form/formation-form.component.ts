// frontend/src/app/modules/formations/formation-form/formation-form.component.ts
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

// Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

// Services
import { FormationService } from '../services/formation.service';
import { Formation } from '../../../core/models/user.model';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-formation-form',
  templateUrl: './formation-form.component.html',
  styleUrls: ['./formation-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
})
export class FormationFormComponent implements OnInit {
  formationForm!: FormGroup;
  isEditMode = false;
  formationId?: number;
  loading = false;
  formationTypes = [
    'Licence',
    'Master',
    'Doctorat',
    'DUT',
    'BTS',
    'Formation continue',
  ];
  formationLevels = ['Bac+1', 'Bac+2', 'Bac+3', 'Bac+4', 'Bac+5', 'Bac+8'];
  fundingTypes = ['Public', 'Privé', 'Mixte', 'Autofinancement'];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private formationService: FormationService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.initForm();

    // Check if we're in edit mode
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.formationId = +id;
        this.loadFormation(this.formationId);
      }
    });
  }

  private initForm(): void {
    this.formationForm = this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100),
        ],
      ],
      type: ['', [Validators.required]],
      level: ['', [Validators.required]],
      startDate: [null, [Validators.required]],
      endDate: [null],
      description: ['', [Validators.maxLength(500)]],
      fundingAmount: [0, [Validators.min(0)]],
      fundingType: [''],
    });
  }

  private loadFormation(id: number): void {
    this.loading = true;
    this.formationService
      .getFormationById(id)
      .pipe(
        catchError((error) => {
          this.snackBar.open(
            'Erreur lors du chargement de la formation',
            'Fermer',
            {
              duration: 3000,
            },
          );
          this.router.navigate(['/formations']);
          return of(null);
        }),
        finalize(() => {
          this.loading = false;
        }),
      )
      .subscribe((formation) => {
        if (formation) {
          this.formationForm.patchValue({
            name: formation.name,
            type: formation.type,
            level: formation.level,
            startDate: formation.startDate
              ? new Date(formation.startDate)
              : null,
            endDate: formation.endDate ? new Date(formation.endDate) : null,
            description: formation.description,
            fundingAmount: formation.fundingAmount,
            fundingType: formation.fundingType,
          });
        }
      });
  }

  onSubmit(): void {
    if (this.formationForm.invalid) {
      // Mark all fields as touched to trigger validation visualization
      Object.keys(this.formationForm.controls).forEach((key) => {
        const control = this.formationForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.loading = true;
    const formationData = this.formationForm.value;

    if (this.isEditMode && this.formationId) {
      this.formationService
        .updateFormation(this.formationId, formationData)
        .pipe(
          catchError((error) => {
            this.snackBar.open(
              'Erreur lors de la mise à jour de la formation',
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
            this.snackBar.open('Formation mise à jour avec succès', 'Fermer', {
              duration: 3000,
            });
            this.router.navigate(['/formations']);
          }
        });
    } else {
      this.formationService
        .createFormation(formationData)
        .pipe(
          catchError((error) => {
            this.snackBar.open(
              'Erreur lors de la création de la formation',
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
            this.snackBar.open('Formation créée avec succès', 'Fermer', {
              duration: 3000,
            });
            this.router.navigate(['/formations']);
          }
        });
    }
  }

  // Getters for form controls to easily access in the template
  get nameControl() {
    return this.formationForm.get('name');
  }
  get typeControl() {
    return this.formationForm.get('type');
  }
  get levelControl() {
    return this.formationForm.get('level');
  }
  get startDateControl() {
    return this.formationForm.get('startDate');
  }
}
