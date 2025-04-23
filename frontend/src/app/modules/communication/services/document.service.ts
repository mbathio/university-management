// src/app/modules/communication/services/document.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Document, DocumentType } from '../../../core/models/user.model';
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

  createDocument(document: any, file: File | null): Observable<Document> {
    const formData = new FormData();

    // Ajouter les champs de document comme parties de form-data
    formData.append('title', document.title);
    formData.append('content', document.content);
    formData.append('type', document.type);
    formData.append('visibilityLevel', document.visibilityLevel);

    // Ajouter le fichier s'il existe
    if (file) {
      formData.append('file', file);
    }

    return this.http.post<Document>(this.apiUrl, formData);
  }

  updateDocument(
    id: number,
    document: any,
    file: File | null,
  ): Observable<Document> {
    const formData = new FormData();

    // Ajouter les champs de document comme parties de form-data
    formData.append('title', document.title);
    formData.append('content', document.content);
    formData.append('type', document.type);
    formData.append('visibilityLevel', document.visibilityLevel);

    // Ajouter le fichier s'il existe
    if (file) {
      formData.append('file', file);
    }

    return this.http.put<Document>(`${this.apiUrl}/${id}`, formData);
  }

  deleteDocument(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getDocumentsByType(type: DocumentType): Observable<Document[]> {
    const params = new HttpParams().set('type', type);
    return this.http.get<Document[]>(this.apiUrl, { params });
  }

  getDocumentsByVisibility(visibilityLevel: string): Observable<Document[]> {
    const params = new HttpParams().set('visibilityLevel', visibilityLevel);
    return this.http.get<Document[]>(this.apiUrl, { params });
  }

  downloadDocument(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/download`, {
      responseType: 'blob',
    });
  }
}
