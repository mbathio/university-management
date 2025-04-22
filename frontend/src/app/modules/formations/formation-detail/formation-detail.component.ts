// src/app/modules/formations/formation-detail/formation-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormationService } from '../services/formation.service';
import { StudentService } from '../../students/services/student.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Formation, Student, Role } from '../../../core/models/user.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-formation-detail',
  templateUrl: './formation-detail.component.html',
  styleUrls: ['./formation-detail.component.scss']
})
export class FormationDetailComponent implements OnInit {
  formation!: Formation;
  students: Student[] = [];
  loading = true;
  isMyFormationView = false;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formationService: FormationService,
    private studentService: StudentService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) { }
  
  ngOnInit(): void {
    this.route.data.subscribe(data => {
      this.isMyFormationView = data['myFormation'] || false;
    });
    
    if (this.isMyFormationView) {
      this.loadMyFormation();
    } else {
      this.route.paramMap.subscribe(params => {
        const id = params.get('id');
        if (id) {
          this.loadFormation(+id);
        } else {
          this.router.navigate(['/formations']);
        }
      });
    }
  }
  
  loadFormation(id: number): void {
    this.loading = true;
    this.formationService.getFormationById(id).subscribe({
      next: (formation) => {
        this.formation = formation;
        this.loadStudents(id);
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
  
  loadMyFormation(): void {
    this.loading = true;
    this.formationService.getMyFormation().subscribe({
      next: (formation) => {
        this.formation = formation;
        if (formation && formation.id) {
          this.loadStudents(formation.id);
        } else {
          this.loading = false;
        }
      },
      error: (error) => {
        this.snackBar.open('Erreur lors du chargement de votre formation', 'Fermer', {
          duration: 3000
        });
        this.loading = false;
        this.router.navigate(['/dashboard']);
      }
    });
  }
  
  loadStudents(formationId: number): void {
    if (this.canViewStudents()) {
      this.studentService.getStudentsByFormation(formationId).subscribe({
        next: (students) => {
          this.students = students;
          this.loading = false;
        },
        error: (error) => {
          this.snackBar.open('Erreur lors du chargement des étudiants', 'Fermer', {
            duration: 3000
          });
          this.loading = false;
        }
      });
    } else {
      this.loading = false;
    }
  }
  
  canEdit(): boolean {
    return this.authService.hasRole([Role.ADMIN, Role.FORMATION_MANAGER]);
  }
  
  canDelete(): boolean {
    return this.authService.hasRole([Role.ADMIN]);
  }
  
  canViewStudents(): boolean {
    return this.authService.hasRole([Role.ADMIN, Role.FORMATION_MANAGER, Role.TEACHER, Role.TUTOR]);
  }
  
  onEdit(): void {
    this.router.navigate(['/formations/edit', this.formation.id]);
  }
  
  onDelete(): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette formation ?')) {
      this.formationService.deleteFormation(this.formation.id).subscribe({
        next: () => {
          this.snackBar.open('Formation supprimée avec succès', 'Fermer', {
            duration: 3000
          });
          this.router.navigate(['/formations']);
        },
        error: (error) => {
          this.snackBar.open('Erreur lors de la suppression de la formation', 'Fermer', {
            duration: 3000
          });
        }
      });
    }
  }
}