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

import { StudentService } from '../services/student.service';
import { FormationService } from '../../formations/services/formation.service';
import { Student, StudentDto } from '../../../core/models/user.model';
import { Formation } from '../../formations/formation.model';

@Component({
  selector: 'app-student-form',
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
  templateUrl: './student-form.component.html',
  styleUrls: ['./student-form.component.scss']
})
export class StudentFormComponent implements OnInit {
  studentForm: FormGroup;
  formations: Formation[] = [];
  isEditing = false;
  loading = false;
  isEditMode = this.isEditing;  // Alias for template

  constructor(
    private fb: FormBuilder,
    private studentService: StudentService,
    private formationService: FormationService,
    private snackBar: MatSnackBar,
    public router: Router
  ) {
    this.studentForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.pattern(/^[0-9]{10}$/)]],
      formationId: ['', Validators.required],
      promo: ['', [Validators.required, Validators.minLength(4)]],
      password: ['', Validators.required],
      role: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadFormations();
  }

  loadFormations(): void {
    this.formationService.getAllFormations().subscribe({
      next: (formations) => {
        this.formations = formations;
      },
      error: (err) => {
        this.snackBar.open('Impossible de charger les formations', 'Fermer', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  onSubmit(): void {
    if (this.studentForm.invalid) {
      this.markFormGroupTouched(this.studentForm);
      return;
    }

    const formationId = this.studentForm.get('formationId')?.value;
    if (!formationId || isNaN(Number(formationId))) {
      this.snackBar.open('Veuillez sélectionner une formation valide', 'Fermer', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    const studentData: StudentDto = {
      ...this.studentForm.value,
      formationId: Number(formationId),  // Ensure it's a number
      password: this.studentForm.get('password')?.value || '',
      email: this.studentForm.get('email')?.value || '',
      role: this.studentForm.get('role')?.value || null
    };

    this.loading = true;
    this.studentService.createStudent(studentData).subscribe({
      next: (createdStudent) => {
        this.snackBar.open('Étudiant ajouté avec succès', 'Fermer', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.router.navigate(['/students']);
      },
      error: (err) => {
        this.snackBar.open('Erreur lors de l\'ajout de l\'étudiant', 'Fermer', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        console.error('Error creating student:', err);
      },
      complete: () => {
        this.loading = false;
      }
    });
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
    const control = this.studentForm.get(controlName);
    if (!control || !control.errors) return '';

    if (control.errors['required']) {
      return 'Ce champ est obligatoire';
    }
    if (control.errors['email']) {
      return 'Adresse email invalide';
    }
    if (control.errors['minlength']) {
      return `Minimum ${control.errors['minlength'].requiredLength} caractères`;
    }
    if (control.errors['pattern']) {
      return 'Format invalide';
    }
    return '';
  }

  cancel() {
    this.router.navigate(['/students']);
  }
}
