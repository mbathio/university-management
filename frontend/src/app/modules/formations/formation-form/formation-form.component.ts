// frontend/src/app/modules/formations/formation-form/formation-form.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { FormationService } from '../services/formation.service';
import { Formation } from '../../../core/models/user.model';

@Component({
  selector: 'app-formation-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './formation-form.component.html',
  styleUrls: ['./formation-form.component.scss']
})
export class FormationFormComponent implements OnInit {
  formationForm: FormGroup;
  isEditing = false;

  // Predefined list of formation types
  formationTypes = [
    { value: 'INITIAL', label: 'Formation Initiale' },
    { value: 'CONTINUE', label: 'Formation Continue' },
    { value: 'ALTERNANCE', label: 'Formation en Alternance' },
    { value: 'PROFESSIONNELLE', label: 'Formation Professionnelle' }
  ];

  private dateRangeValidator(group: FormGroup) {
    const startDate = group.get('startDate')?.value;
    const endDate = group.get('endDate')?.value;

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      return { dateRange: true };
    }
    return null;
  }

  constructor(
    private fb: FormBuilder,
    private formationService: FormationService,
    private snackBar: MatSnackBar,
    public router: Router
  ) {
    this.formationForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      code: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(20)]],
      description: ['', [Validators.maxLength(500)]],
      type: ['', Validators.required],
      duration: ['', [Validators.required, Validators.min(1), Validators.max(120)]],
      startDate: [null, Validators.required],
      endDate: [null, Validators.required],
      maxStudents: ['', [Validators.required, Validators.min(1), Validators.max(500)]]
    }, { validators: this.dateRangeValidator });
  }

  ngOnInit(): void {
    // Check if we're in edit mode by checking route params
    const formationId = this.router.getCurrentNavigation()?.extras?.state?.['formationId'];
    if (formationId) {
      this.isEditing = true;
      this.loadFormation(formationId);
    }
  }

  loadFormation(id: number): void {
    this.formationService.getFormationById(id).subscribe({
      next: (formation) => {
        this.formationForm.patchValue({
          name: formation.name,
          code: formation.code,
          description: formation.description,
          type: formation.type,
          startDate: formation.startDate,
          endDate: formation.endDate,
        });
      },
      error: (err) => {
        this.snackBar.open('Impossible de charger la formation', 'Fermer', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.router.navigate(['/formations']);
      }
    });
  }
  
  onSubmit(): void {
    if (this.formationForm.valid) {
      const formationData = this.formationForm.value;
      
      const serviceMethod = this.isEditing 
        ? this.formationService.updateFormation(formationData)
        : this.formationService.createFormation(formationData);
  
      serviceMethod.subscribe({
        next: (result) => {
          const successMessage = this.isEditing 
            ? 'Formation mise à jour avec succès'
            : 'Formation créée avec succès';
          
          this.snackBar.open(successMessage, 'Fermer', { duration: 3000 });
          this.router.navigate(['/formations']);
        },
        error: (err) => {
          const errorMessage = this.isEditing
            ? 'Erreur lors de la mise à jour de la formation'
            : 'Erreur lors de la création de la formation';
          
          this.snackBar.open(errorMessage, 'Fermer', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    } else {
      this.markFormGroupTouched(this.formationForm);
    }
  }

  cancel() {
    this.router.navigate(['/formations']);
  }

  // Helper method to mark all controls as touched
  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // Form validation error messages
  getErrorMessage(controlName: string): string {
    const control = this.formationForm.get(controlName);
    if (!control || !control.errors) return '';

    if (control.errors['required']) {
      return 'Ce champ est obligatoire';
    }
    if (control.errors['minlength']) {
      return `Minimum ${control.errors['minlength'].requiredLength} caractères`;
    }
    if (control.errors['maxlength']) {
      return `Maximum ${control.errors['maxlength'].requiredLength} caractères`;
    }
    if (control.errors['min']) {
      return `La valeur minimale est ${control.errors['min'].min}`;
    }
    if (control.errors['max']) {
      return `La valeur maximale est ${control.errors['max'].max}`;
    }
    if (control.errors['dateRange']) {
      return 'La date de fin doit être après la date de début';
    }
    return '';
  }
}
