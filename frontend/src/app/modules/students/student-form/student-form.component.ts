// frontend/src/app/modules/students/student-form/student-form.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { StudentService } from '../services/student.service';
import { FormationService } from '../../formations/services/formation.service';
import { Student, Formation, StudentDto } from '../../../core/models/user.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, finalize, switchMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-student-form',
  templateUrl: './student-form.component.html',
  styleUrls: ['./student-form.component.scss']
})
export class StudentFormComponent implements OnInit {
  studentForm!: FormGroup;
  isEditMode = false;
  studentId?: number;
  loading = false;
  error = '';
  formations: Formation[] = [];
  
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private studentService: StudentService,
    private formationService: FormationService,
    private snackBar: MatSnackBar
  ) {}
  
  ngOnInit(): void {
    this.loadFormations();
    this.initForm();
    
    // Check if we are in edit mode
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.studentId = +id;
      this.loadStudent(this.studentId);
    }
  }
  
  initForm(): void {
    this.studentForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      password: ['', this.isEditMode ? [] : [Validators.required, Validators.minLength(6)]],
      email: ['', [Validators.required, Validators.email]],
      studentId: ['', [Validators.required]],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      birthDate: [null],
      formationId: [null],
      promo: [''],
      startYear: [new Date().getFullYear(), [Validators.required]],
      endYear: [new Date().getFullYear() + 1, [Validators.required]]
    });
    
    // Disable username field in edit mode
    if (this.isEditMode) {
      this.studentForm.get('username')?.disable();
      this.studentForm.get('studentId')?.disable();
    }
  }
  
  loadFormations(): void {
    this.formationService.getAllFormations()
      .pipe(
        catchError(error => {
          this.snackBar.open('Erreur lors du chargement des formations', 'Fermer', {
            duration: 3000
          });
          return of([]);
        })
      )
      .subscribe(formations => {
        this.formations = formations;
      });
  }
  
  loadStudent(id: number): void {
    this.loading = true;
    
    this.studentService.getStudentById(id)
      .pipe(
        catchError(error => {
          this.error = 'Erreur lors du chargement des informations de l\'étudiant';
          this.snackBar.open(this.error, 'Fermer', {
            duration: 3000
          });
          return of(null);
        }),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe(student => {
        if (student) {
          // Populate the form with student data
          this.studentForm.patchValue({
            username: student.user.username,
            email: student.user.email,
            studentId: student.studentId,
            firstName: student.firstName,
            lastName: student.lastName,
            birthDate: student.birthDate,
            formationId: student.currentFormation?.id,
            promo: student.promo,
            startYear: student.startYear,
            endYear: student.endYear
          });
          
          // Always set password to empty in edit mode
          this.studentForm.get('password')?.setValue('');
        }
      });
  }
  
  onSubmit(): void {
    if (this.studentForm.invalid) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.studentForm.controls).forEach(key => {
        const control = this.studentForm.get(key);
        control?.markAsTouched();
      });
      
      this.snackBar.open('Formulaire invalide, veuillez vérifier les champs', 'Fermer', {
        duration: 3000
      });
      return;
    }
    
    this.loading = true;
    
    // Create the student DTO
    const studentDto: StudentDto = {
      username: this.isEditMode ? this.studentForm.get('username')?.value : this.studentForm.get('username')?.value,
      password: this.studentForm.get('password')?.value,
      email: this.studentForm.get('email')?.value,
      studentId: this.isEditMode ? this.studentForm.get('studentId')?.value : this.studentForm.get('studentId')?.value,
      firstName: this.studentForm.get('firstName')?.value,
      lastName: this.studentForm.get('lastName')?.value,
      birthDate: this.studentForm.get('birthDate')?.value,
      formationId: this.studentForm.get('formationId')?.value,
      promo: this.studentForm.get('promo')?.value,
      startYear: this.studentForm.get('startYear')?.value,
      endYear: this.studentForm.get('endYear')?.value
    };
    
    let request: Observable<Student>;
    
    if (this.isEditMode && this.studentId) {
      request = this.studentService.updateStudent(this.studentId, studentDto);
    } else {
      request = this.studentService.createStudent(studentDto);
    }
    
    request.pipe(
      catchError(error => {
        this.error = 'Erreur lors de l\'enregistrement de l\'étudiant';
        if (error.error && error.error.message) {
          this.error += ': ' + error.error.message;
        }
        this.snackBar.open(this.error, 'Fermer', {
          duration: 3000
        });
        return of(null);
      }),
      finalize(() => {
        this.loading = false;
      })
    )
    .subscribe(student => {
      if (student) {
        this.snackBar.open(
          this.isEditMode 
            ? 'Étudiant mis à jour avec succès'
            : 'Étudiant créé avec succès',
          'Fermer',
          { duration: 3000 }
        );
        this.router.navigate(['/students']);
      }
    });
  }
  
  cancel(): void {
    if (this.isEditMode && this.studentId) {
      this.router.navigate(['/students', this.studentId]);
    } else {
      this.router.navigate(['/students']);
    }
  }
}