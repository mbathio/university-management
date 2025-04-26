// src/app/core/services/document.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Document, DocumentType } from '../../../core/models/document.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DocumentService {
  private apiUrl = `${environment.apiUrl}/documents`;

  constructor(private http: HttpClient) {}

  init(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/init`, {});
  }

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
    return this.http.get<Document[]>(`${this.apiUrl}/types`, { 
      params: { types: types.join(',') } 
    });
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

  downloadDocument(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/download`, { 
      responseType: 'blob' 
    });
  }

  isDocumentCreator(documentId: number, username: string): Observable<boolean> {
    return this.http.get<boolean>(
      `${this.apiUrl}/${documentId}/isCreator/${username}`,
    );
  }
}
