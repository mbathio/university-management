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

  getDocumentById(id: number): Observable<Document> {
    return this.http.get<Document>(`${this.apiUrl}/${id}`);
  }

  getAllDocuments(): Observable<Document[]> {
    return this.http.get<Document[]>(this.apiUrl);
  }

  getDocumentsByType(type: DocumentType): Observable<Document[]> {
    return this.http.get<Document[]>(`${this.apiUrl}/type/${type}`);
  }
  
  getDocumentsByTypes(types: DocumentType[]): Observable<Document[]> {
    // Utiliser HttpParams pour construire correctement les paramètres
    let params = new HttpParams();
    types.forEach(type => {
      params = params.append('types', type);
    });
    return this.http.get<Document[]>(`${this.apiUrl}/types`, { params });
  }

  getDocumentsByCreator(userId: number): Observable<Document[]> {
    return this.http.get<Document[]>(`${this.apiUrl}/creator/${userId}`);
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

  downloadDocument(filename: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/files/${filename}`, { 
      responseType: 'blob' 
    });
  }

  searchDocuments(term: string): Observable<Document[]> {
    const params = new HttpParams().set('search', term);
    return this.http.get<Document[]>(`${this.apiUrl}/search`, { params });
  }
  
  // Méthode pour obtenir les rapports par type
  getReportsByType(types: DocumentType[]): Observable<Document[]> {
    return this.getDocumentsByTypes(types);
  }
}