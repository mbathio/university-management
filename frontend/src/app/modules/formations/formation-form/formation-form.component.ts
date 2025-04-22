// src/app/modules/formations/formation-form/formation-form.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormationService } from '../services/formation.service';
import { Formation } from '../../../core/models/user.model';

@Component({
  selector: 'app-formation-form',
  templateUrl: './formation-form.component.html',
  styleUrls: ['./formation-form.component.scss']
})
export class FormationFormComponent implements OnInit {
  formationForm!: FormGroup;
  isEditMode = false;
  formationId?: number;
  loading = false;
  
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private formationService: FormationService,
    private snackBar: MatSnackBar
  ) { }
  
  ngOnInit(): void {
    this.initForm();
    
    // Check if we're in edit mode
    this.route.paramMap.subscribe(params => {
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
      name: ['', [Validators.required]],
      type: ['', [Validators.required]],
      level: ['', [Validators.required]],
      startDate: [null],
      endDate: [null],
      description: [''],
      fundingAmount: [0, [Validators.min(0)]],
      fundingType: ['']
    });
  }
  
  private loadFormation(id: number): void {
    this.loading = true;
    this.formationService.getFormationById(id).subscribe({
      next: (formation) => {
        this.formationForm.patchValue({
          name: formation.name,
          type: formation.type,
          level: formation.level,
          startDate: formation.startDate ? new Date(formation.startDate) : null,
          endDate: formation.endDate ? new Date(formation.endDate) : null,
          description: formation.description,
          fundingAmount: formation.fundingAmount,
          fundingType: formation.fundingType
        });
        this.loading = false;
      },
      error: (error) => {
        this.snackBar.open('Erreur lors du chargement de la formation', 'Fermer', {
          duration: 3000
        });
        this.loading = false;
        this.router.navigate(['/formations']);
      }
    });
  }
  
  onSubmit(): void {
    if (this.formationForm.invalid) {
      return;
    }
    
    this.loading = true;
    const formationData = this.formationForm.value;
    
    if (this.isEditMode && this.formationId) {
      this.formationService.updateFormation(this.formationId, formationData).subscribe({
        next: () => {
          this.snackBar.open('Formation mise à jour avec succès', 'Fermer', {
            duration: 3000
          });
          this.loading = false;
          this.router.navigate(['/formations']);
        },
        error: (error) => {
          this.snackBar.open('Erreur lors de la mise à jour de la formation', 'Fermer', {
            duration: 3000
          });
          this.loading = false;
        }
      });
    } else {
      this.formationService.createFormation(formationData).subscribe({
        next: () => {
          this.snackBar.open('Formation créée avec succès', 'Fermer', {
            duration: 3000
          });
          this.loading = false;
          this.router.navigate(['/formations']);
        },
        error: (error) => {
          this.snackBar.open('Erreur lors de la création de la formation', 'Fermer', {
            duration: 3000
          });
          this.loading = false;
        }
      });
    }
  }
}