// src/app/modules/communication/services/document.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Document, DocumentType } from '../../../core/models/document.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DocumentService {
  private apiUrl = `${environment.apiUrl}/api/documents`;

  constructor(private http: HttpClient) {}

  getAllDocuments(): Observable<Document[]> {
    return this.http.get<Document[]>(this.apiUrl);
  }

  getDocumentById(id: number): Observable<Document> {
    return this.http.get<Document>(`${this.apiUrl}/${id}`);
  }

  getDocumentsByType(type: DocumentType | string): Observable<Document[]> {
    return this.http.get<Document[]>(`${this.apiUrl}/type/${type}`);
  }

  getReportsByType(adminTypes: DocumentType[]): Observable<Document[]> {
    // Cette méthode n'existe pas encore dans le backend tel que configuré
    // Vous devrez soit implémenter l'endpoint dans le backend, 
    // soit utiliser une autre approche côté frontend
    const types = adminTypes.join(',');
    const params = new HttpParams().set('types', types);
    return this.http.get<Document[]>(`${this.apiUrl}/search/types`, { params });
  }

  getDocumentsByVisibilityLevel(level: string): Observable<Document[]> {
    return this.http.get<Document[]>(`${this.apiUrl}/visibility/${level}`);
  }

  createDocument(formData: FormData): Observable<Document> {
    return this.http.post<Document>(this.apiUrl, formData);
  }

  updateDocument(id: number, formData: FormData): Observable<Document> {
    return this.http.put<Document>(`${this.apiUrl}/${id}`, formData);
  }

  deleteDocument(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Correction: utiliser l'endpoint de téléchargement correctement défini dans le backend
  downloadDocument(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/download/${id}`, {
      responseType: 'blob',
    });
  }

  // Pour accéder directement à un fichier (comme avec l'attribut src d'une balise img)
  getFileUrl(filename: string): string {
    return `${environment.apiUrl}/api/documents/files/${filename}`;
  }

  searchDocuments(term: string): Observable<Document[]> {
    const params = new HttpParams().set('search', term);
    return this.http.get<Document[]>(`${this.apiUrl}/search`, { params });
  }
}