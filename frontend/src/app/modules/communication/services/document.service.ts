// src/app/core/services/document.service.ts
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

  getDocumentsByType(type: DocumentType): Observable<Document[]> {
    return this.http.get<Document[]>(`${this.apiUrl}/type/${type}`);
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
    return this.http.get(`${this.apiUrl}/download/${id}`, {
      responseType: 'blob'
    });
  }

  getReportsByType(types: DocumentType[]): Observable<Document[]> {
    const params = new HttpParams().set('types', types.join(','));
    return this.http.get<Document[]>(`${this.apiUrl}/search/types`, { params });
  }

  searchDocuments(term: string): Observable<Document[]> {
    const params = new HttpParams().set('search', term);
    return this.http.get<Document[]>(`${this.apiUrl}/search`, { params });
  }

  // Advanced document search with multiple filters
  advancedSearchDocuments(params: {
    search?: string;
    types?: DocumentType[];
    visibilityLevels?: string[];
    startDate?: Date;
    endDate?: Date;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
  }): Observable<{
    content: Document[];
    totalElements: number;
    totalPages: number;
  }> {
    let httpParams = new HttpParams();

    if (params.search) {
      httpParams = httpParams.set('search', params.search);
    }
    if (params.types && params.types.length) {
      httpParams = httpParams.set('types', params.types.join(','));
    }
    if (params.visibilityLevels && params.visibilityLevels.length) {
      httpParams = httpParams.set('visibilityLevels', params.visibilityLevels.join(','));
    }
    if (params.startDate) {
      httpParams = httpParams.set('startDate', params.startDate.toISOString());
    }
    if (params.endDate) {
      httpParams = httpParams.set('endDate', params.endDate.toISOString());
    }
    if (params.page !== undefined) {
      httpParams = httpParams.set('page', params.page.toString());
    }
    if (params.size !== undefined) {
      httpParams = httpParams.set('size', params.size.toString());
    }
    if (params.sortBy) {
      httpParams = httpParams.set('sortBy', params.sortBy);
    }
    if (params.sortDirection) {
      httpParams = httpParams.set('sortDirection', params.sortDirection);
    }

    return this.http.get<{
      content: Document[];
      totalElements: number;
      totalPages: number;
    }>(`${this.apiUrl}/advanced-search`, { params: httpParams });
  }

  // Bulk document operations
  bulkUpdateDocuments(documentIds: number[], updates: Partial<Document>): Observable<Document[]> {
    return this.http.patch<Document[]>(`${this.apiUrl}/bulk-update`, {
      documentIds,
      updates
    });
  }

  bulkDeleteDocuments(documentIds: number[]): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/bulk-delete`, {
      body: { documentIds }
    });
  }

  // Document metadata operations
  updateDocumentMetadata(id: number, metadata: Record<string, any>): Observable<Document> {
    return this.http.patch<Document>(`${this.apiUrl}/${id}/metadata`, metadata);
  }

  // Comprehensive document upload with additional metadata
  uploadDocument(formData: FormData, additionalMetadata?: Record<string, any>): Observable<Document> {
    if (additionalMetadata) {
      for (const [key, value] of Object.entries(additionalMetadata)) {
        formData.append(key, JSON.stringify(value));
      }
    }
    return this.http.post<Document>(`${this.apiUrl}/upload`, formData);
  }

  // Validate document before upload
  validateDocument(documentData: Partial<Document>): Observable<{ valid: boolean; errors?: string[] }> {
    return this.http.post<{ valid: boolean; errors?: string[] }>(`${this.apiUrl}/validate`, documentData);
  }
}