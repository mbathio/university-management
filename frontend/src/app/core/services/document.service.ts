// src/app/core/services/document.service.ts - Corrected
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Document,
  DocumentType,
  VisibilityLevel,
} from '../models/document.model';

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

  getDocumentsByType(type: DocumentType): Observable<Document[]> {
    return this.http.get<Document[]>(`${this.apiUrl}/type/${type}`);
  }

  getDocumentsByVisibilityLevel(
    level: VisibilityLevel,
  ): Observable<Document[]> {
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

  downloadDocument(filePath: string): Observable<Blob> {
    return this.http.get(
      `${environment.apiUrl}/api/documents/files/${filePath}`,
      {
        responseType: 'blob',
      },
    );
  }
}
