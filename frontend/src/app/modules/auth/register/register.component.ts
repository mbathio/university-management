// src/app/modules/auth/register/register.component.ts
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
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
  roles = Object.values(Role);
  errorMessage = '';
  isLoading = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.registerForm = this.formBuilder.group(
      {
        username: ['', [Validators.required, Validators.minLength(4)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
        role: [Role.STUDENT, [Validators.required]],
      },
      { validators: this.passwordMatchValidator },
    );
  }

  ngOnInit(): void {
    // If already logged in, redirect to dashboard
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  passwordMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;

    if (password !== confirmPassword) {
      formGroup.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      return null;
    }
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { username, email, password, role } = this.registerForm.value;
    const userData = { username, email, password, role };

    this.authService.register(userData).subscribe({
      next: () => {
        this.router.navigate(['/login'], {
          queryParams: { registered: 'true' },
        });
      },
      error: (error) => {
        this.isLoading = false;
        if (error.status === 400) {
          if (error.error.message?.includes('Username already exists')) {
            this.errorMessage = 'Username already exists';
          } else if (error.error.message?.includes('Email already exists')) {
            this.errorMessage = 'Email already exists';
          } else {
            this.errorMessage = error.error.message || 'Registration failed';
          }
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
