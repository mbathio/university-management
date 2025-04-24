// src/app/modules/communication/services/document.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Document } from '../../../core/models/document.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DocumentService {
  private apiUrl = `${environment.apiUrl}/documents`;

  constructor(private http: HttpClient) {}

  getAllDocuments(): Observable<Document[]> {
    return this.http.get<Document[]>(this.apiUrl);
  }

  getDocumentById(id: number): Observable<Document> {
    return this.http.get<Document>(`${this.apiUrl}/${id}`);
  }

  getDocumentsByType(type: string): Observable<Document[]> {
    const params = new HttpParams().set('type', type);
    return this.http.get<Document[]>(this.apiUrl, { params });
  }

  getDocumentsByVisibilityLevel(level: string): Observable<Document[]> {
    const params = new HttpParams().set('visibilityLevel', level);
    return this.http.get<Document[]>(this.apiUrl, { params });
  }

  createDocument(document: Document, file?: File): Observable<Document> {
    const formData = new FormData();

    // Convertir l'objet document en JSON et l'ajouter au FormData
    formData.append(
      'document',
      new Blob([JSON.stringify(document)], { type: 'application/json' }),
    );

    // Ajouter le fichier s'il existe
    if (file) {
      formData.append('file', file, file.name);
    }

    return this.http.post<Document>(this.apiUrl, formData);
  }

  updateDocument(
    id: number,
    document: Document,
    file?: File,
  ): Observable<Document> {
    const formData = new FormData();

    // Convertir l'objet document en JSON et l'ajouter au FormData
    formData.append(
      'document',
      new Blob([JSON.stringify(document)], { type: 'application/json' }),
    );

    // Ajouter le fichier s'il existe
    if (file) {
      formData.append('file', file, file.name);
    }

    return this.http.put<Document>(`${this.apiUrl}/${id}`, formData);
  }

  deleteDocument(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  downloadDocument(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/download`, {
      responseType: 'blob',
    });
  }
}
