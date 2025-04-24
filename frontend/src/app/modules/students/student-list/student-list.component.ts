// frontend/src/app/modules/students/student-list/student-list.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { AfterViewInit, OnInit, ViewChild } from '@angular/core';
interface Student {
  id: number;
  firstName: string;
  lastName: string;
  formation: string;
}

@Component({
  selector: 'app-student-list',
  templateUrl: './student-list.component.html',
  styleUrls: ['./student-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatSnackBarModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
  ],
})
export class StudentListComponent implements OnInit, AfterViewInit {
  ngOnInit(): void {
    // Simulate fetching data from an API
    setTimeout(() => {
      this.dataSource.data = this.students;
      this.loading = false;
    }, 1000); // Simulate a 1-second delay
  }

  ngAfterViewInit(): void {
    // Assign paginator and sort to the data source
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  displayedColumns: string[] = [
    'studentId',
    'firstName',
    'lastName',
    'formation',
    'promo',
    'actions',
  ];
  dataSource = new MatTableDataSource<Student>();
  loading = true;
  error = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  students = [
    { id: 1, firstName: 'Amy', lastName: 'Ndiaye', formation: 'Engineering' },
    { id: 2, firstName: 'Josephine', lastName: 'Bio', formation: 'Medicine' },
    { id: 3, firstName: 'Mba', lastName: 'Diallo', formation: 'Law' },
  ];

  // Example logic for canEdit
  canEdit(): boolean {
    // Replace this logic with your actual permission check
    return true; // Allow editing for all students
  }

  // Example logic for canDelete
  canDelete(): boolean {
    // Replace this logic with your actual permission check
    return true; // Allow deleting for all students
  }

  createStudent() {
    // Logic to create a student
  }

  viewStudent(id: number) {
    console.log(`Viewing student with ID: ${id}`);
    // Add logic to view a student here
  }

  editStudent(id: number) {
    console.log(`Editing student with ID: ${id}`);
    // Add logic to edit a student here
  }

  deleteStudent() {
    // Logic to delete a student
  }
}
