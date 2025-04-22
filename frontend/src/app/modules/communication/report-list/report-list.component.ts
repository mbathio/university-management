// src/app/modules/communication/report-list/report-list.component.ts
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
  selector: 'app-report-list',
  templateUrl: './report-list.component.html',
  styleUrls: ['./report-list.component.scss']
})
export class ReportListComponent implements OnInit {
  displayedColumns: string[] = ['title', 'createdAt', 'createdBy', 'actions'];
  dataSource = new MatTableDataSource<Document>();
  loading = true;
  error = '';
  currentUsername = '';
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  
  constructor(
    private documentService: DocumentService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    // Get current user info
    if (this.authService.currentUserValue) {
      this.currentUsername = this.authService.currentUserValue.username;
    }
  }
  
  ngOnInit(): void {
    this.loadReports();
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
  
  loadReports(): void {
    this.loading = true;
    this.error = '';
    
    this.documentService.getDocumentsByType(DocumentType.REPORT).subscribe({
      next: (documents) => {
        this.dataSource.data = documents;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Erreur lors du chargement des rapports';
        this.loading = false;
        this.snackBar.open('Erreur lors du chargement des rapports', 'Fermer', {
          duration: 3000
        });
      }
    });
  }
  
  canEdit(document: Document): boolean {
    if (this.authService.hasRole([Role.ADMIN, Role.ADMINISTRATION])) {
      return true;
    }
    
    // Si le document existe et l'utilisateur en est le créateur
    if (document && document.createdBy && 
        document.createdBy.username === this.currentUsername) {
      return true;
    }
    
    return false;
  }
  
  canDelete(document: Document): boolean {
    if (this.authService.hasRole([Role.ADMIN])) {
      return true;
    }
    
    // Si le document existe et l'utilisateur en est le créateur
    if (document && document.createdBy && 
        document.createdBy.username === this.currentUsername) {
      return true;
    }
    
    return false;
  }
  
  deleteReport(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce rapport ?')) {
      this.documentService.deleteDocument(id).subscribe({
        next: () => {
          this.loadReports();
          this.snackBar.open('Rapport supprimé avec succès', 'Fermer', {
            duration: 3000
          });
        },
        error: (error) => {
          this.snackBar.open('Erreur lors de la suppression du rapport', 'Fermer', {
            duration: 3000
          });
        }
      });
    }
  }
  
  downloadReport(id: number): void {
    this.documentService.downloadDocument(id).subscribe({
      next: (blob) => {
        // Trouver le document dans la liste pour obtenir son titre
        const document = this.dataSource.data.find(doc => doc.id === id);
        const fileName = document ? `${document.title}.pdf` : `rapport-${id}.pdf`;
        
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      },
      error: (error) => {
        this.snackBar.open('Erreur lors du téléchargement du rapport', 'Fermer', {
          duration: 3000
        });
      }
    });
  }
}