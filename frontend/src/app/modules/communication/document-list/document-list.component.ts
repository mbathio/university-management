// src/app/modules/communication/document-list/document-list.component.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { DocumentService } from '../services/document.service';
import { Document, DocumentType } from '../../../core/models/user.model';
import { AuthService } from '../../../core/auth/auth.service';
import { Role } from '../../../core/models/user.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-document-list',
  templateUrl: './document-list.component.html',
  styleUrls: ['./document-list.component.scss']
})
export class DocumentListComponent implements OnInit {
  displayedColumns: string[] = ['title', 'type', 'createdAt', 'visibilityLevel', 'actions'];
  dataSource = new MatTableDataSource<Document>();
  loading = true;
  error = '';
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  
  constructor(
    private documentService: DocumentService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}
  
  ngOnInit(): void {
    this.loadDocuments();
  }
  
  ngAfterViewInit(): void {
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
  
  loadDocuments(): void {
    this.loading = true;
    
    this.documentService.getAllDocuments().subscribe({
      next: (documents) => {
        this.dataSource.data = documents;
        this.loading = false;
      },
      error: (error) => {
        this.error = error;
        this.loading = false;
        this.snackBar.open('Erreur lors du chargement des documents', 'Fermer', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'bottom'
        });
      }
    });
  }
  
  canEdit(document: Document): boolean {
    return this.authService.hasRole([Role.ADMIN, Role.ADMINISTRATION]);
  }
  
  canDelete(document: Document): boolean {
    return this.authService.hasRole([Role.ADMIN]);
  }
  
  deleteDocument(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
      this.documentService.deleteDocument(id).subscribe({
        next: () => {
          this.loadDocuments();
          this.snackBar.open('Document supprimé avec succès', 'Fermer', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'bottom'
          });
        },
        error: (error) => {
          this.snackBar.open('Erreur lors de la suppression: ' + error, 'Fermer', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'bottom'
          });
        }
      });
    }
  }
  
  downloadDocument(id: number): void {
    this.documentService.downloadDocument(id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `document-${id}.pdf`; // nom par défaut
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      },
      error: (error) => {
        this.snackBar.open('Erreur lors du téléchargement: ' + error, 'Fermer', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'bottom'
        });
      }
    });
  }
}