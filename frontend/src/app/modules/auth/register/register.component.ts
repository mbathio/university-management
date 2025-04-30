// src/app/modules/auth/register/register.component.ts
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/auth/auth.service';
import { Role } from '../../../core/models/user.model';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  roles = {
    STUDENT: 'Student',
  };
  errorMessage = '';
  isLoading = false;
  passwordVisible = false;

  // Password strength indicators
  passwordStrength = 0;
  passwordFeedback = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.registerForm = this.formBuilder.group(
      {
        username: [
          '', 
          [
            Validators.required, 
            Validators.minLength(4),
            Validators.pattern(/^[a-zA-Z0-9_.-]*$/) // Alphanumeric with only certain special chars
          ]
        ],
        email: ['', [Validators.required, Validators.email]],
        password: [
          '', 
          [
            Validators.required, 
            Validators.minLength(10),
            this.createPasswordStrengthValidator()
          ]
        ],
        confirmPassword: ['', [Validators.required]],
        role: [Role.STUDENT, [Validators.required]],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  ngOnInit(): void {
    // If already logged in, redirect to dashboard
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
    // Disable role selection field - only STUDENT role for registration
    this.registerForm.get('role')?.disable();
    
    // Update password strength whenever password changes
    this.registerForm.get('password')?.valueChanges.subscribe(password => {
      this.updatePasswordStrength(password);
    });
  }

  passwordMatchValidator(formGroup: FormGroup): ValidationErrors | null {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;

    if (password !== confirmPassword) {
      formGroup.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      return null;
    }
  }

  createPasswordStrengthValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      
      if (!value) {
        return null;
      }
      
      const hasUpperCase = /[A-Z]+/.test(value);
      const hasLowerCase = /[a-z]+/.test(value);
      const hasNumeric = /[0-9]+/.test(value);
      const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(value);
      
      const passwordValid = hasUpperCase && hasLowerCase && hasNumeric && hasSpecialChar;
      
      return !passwordValid ? { passwordStrength: true } : null;
    }
  }

  updatePasswordStrength(password: string): void {
    if (!password) {
      this.passwordStrength = 0;
      this.passwordFeedback = '';
      return;
    }
    
    let strength = 0;
    let feedback = [];
    
    // Length check
    if (password.length >= 10) {
      strength += 25;
    } else {
      feedback.push('Add more characters (at least 10)');
    }
    
    // Character variety checks
    if (/[A-Z]/.test(password)) {
      strength += 25;
    } else {
      feedback.push('Add uppercase letters');
    }
    
    if (/[a-z]/.test(password)) {
      strength += 25;
    } else {
      feedback.push('Add lowercase letters');
    }
    
    if (/[0-9]/.test(password)) {
      strength += 15;
    } else {
      feedback.push('Add numbers');
    }
    
    if (/[^A-Za-z0-9]/.test(password)) {
      strength += 10;
    } else {
      feedback.push('Add special characters (!@#$%^&*)');
    }
    
    this.passwordStrength = Math.min(100, strength);
    this.passwordFeedback = feedback.join(', ');
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      // Mark all fields as touched to trigger validation visuals
      Object.keys(this.registerForm.controls).forEach(key => {
        const control = this.registerForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { username, email, password } = this.registerForm.value;
    const role = Role.STUDENT; // Force STUDENT role for security
    const userData = { username, email, password, role };

    this.authService.register(userData).subscribe({
      next: () => {
        // Successful registration, redirect to login page
        this.router.navigate(['/login'], { 
          queryParams: { registered: 'true' }
        });
      },
      error: (error) => {
        this.isLoading = false;
        if (error.status === 409) {
          if (error.error?.error === 'username_exists') {
            this.errorMessage = 'Username already exists';
          } else if (error.error?.error === 'email_exists') {
            this.errorMessage = 'Email already exists';
          } else {
            this.errorMessage = error.error?.message || 'Registration failed';
          }
        } else if (error.status === 400) {
          this.errorMessage = 'Invalid input. Please check your details.';
        } else {
          this.errorMessage = 'An error occurred. Please try again later.';
        }
        console.error('Registration error', error);
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }
}