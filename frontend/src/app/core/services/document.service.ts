// src/app/core/services/document.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError, map } from 'rxjs';
import { Document, DocumentType } from '../models/document.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DocumentService {
  private apiUrl = `${environment.apiUrl}/api/documents`;

  constructor(private http: HttpClient) {}

  // Helper method to create headers with CORS and CSRF support
  private createRequestHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    });
  }

  // Comprehensive error handling method
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      errorMessage = `Client Error: ${error.error.message}`;
      console.error('Client-side error:', error.error);
    } else {
      // Backend returned an unsuccessful response code
      switch (error.status) {
        case 0:
          errorMessage = 'Server is unreachable. Please check your network connection.';
          console.error('Network or CORS error:', error);
          break;
        case 400:
          errorMessage = 'Invalid request. Please check your inputs.';
          break;
        case 401:
          errorMessage = 'Unauthorized. Please log in again.';
          break;
        case 403:
          errorMessage = 'You do not have permission to access this resource.';
          break;
        case 404:
          errorMessage = 'Requested resource not found.';
          break;
        case 500:
          errorMessage = 'Internal server error. Please try again later.';
          break;
        default:
          errorMessage = `Server Error: ${error.status} - ${error.message}`;
      }

      console.error('Server-side error:', {
        status: error.status,
        message: errorMessage,
        details: error.error
      });
    }

    return throwError(() => new Error(errorMessage));
  }

  getAllDocuments(): Observable<Document[]> {
    return this.http.get<Document[]>(this.apiUrl, { 
      headers: this.createRequestHeaders(),
      withCredentials: true  // Important for CORS with credentials
    }).pipe(
      catchError(this.handleError)
    );
  }

  getDocumentById(id: number): Observable<Document> {
    return this.http.get<Document>(`${this.apiUrl}/${id}`, { 
      headers: this.createRequestHeaders(),
      withCredentials: true
    }).pipe(
      catchError(this.handleError)
    );
  }

  getDocumentsByType(type: DocumentType): Observable<Document[]> {
    return this.http.get<Document[]>(`${this.apiUrl}/type/${type}`, { 
      headers: this.createRequestHeaders(),
      withCredentials: true
    }).pipe(
      catchError(this.handleError)
    );
  }

  getDocumentsByTypes(types: DocumentType[]): Observable<Document[]> {
    const params = new HttpParams().set('types', types.join(','));
    return this.http.get<Document[]>(`${this.apiUrl}/search/types`, { 
      params,
      headers: this.createRequestHeaders(),
      withCredentials: true
    }).pipe(
      catchError(this.handleError)
    );
  }

  getDocumentsByVisibilityLevel(level: string): Observable<Document[]> {
    return this.http.get<Document[]>(`${this.apiUrl}/visibility/${level}`, { 
      headers: this.createRequestHeaders(),
      withCredentials: true
    }).pipe(
      catchError(this.handleError)
    );
  }

  createDocument(documentData: any, file?: File): Observable<any> {
    const formData = new FormData();

    // Validate document data
    if (!documentData || !documentData.title) {
      return throwError(() => new Error('Document title is required'));
    }

    // Convert document data to JSON string
    const documentJson = JSON.stringify({
      ...documentData,
      // Ensure type is set or use a default
      type: documentData.type || 'GENERAL'
    });

    // Append document JSON and optional file
    formData.append('document', documentJson);
    if (file) {
      formData.append('file', file, file.name);
    }

    // Log the payload for debugging
    console.log('Creating document with payload:', {
      documentJson,
      fileAttached: !!file
    });

    // Make the API call with improved error handling
    return this.http.post(this.apiUrl, formData, {
      reportProgress: true,
      observe: 'response',
      headers: new HttpHeaders({
        'X-Requested-With': 'XMLHttpRequest'
      }),
      withCredentials: true  // Important for CORS with credentials
    }).pipe(
      map(response => {
        console.log('Document creation response:', response);
        return response.body;
      }),
      catchError(this.handleError)
    );
  }

  updateDocument(id: number, formData: FormData): Observable<Document> {
    return this.http.put<Document>(`${this.apiUrl}/${id}`, formData, { 
      headers: this.createRequestHeaders(),
      withCredentials: true
    }).pipe(
      catchError(this.handleError)
    );
  }

  deleteDocument(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { 
      headers: this.createRequestHeaders(),
      withCredentials: true
    }).pipe(
      catchError(this.handleError)
    );
  }

  downloadDocument(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/download/${id}`, {
      responseType: 'blob',
      headers: this.createRequestHeaders(),
      withCredentials: true
    }).pipe(
      catchError(this.handleError)
    );
  }

  getDocumentsByCreator(userId: number): Observable<Document[]> {
    return this.http.get<Document[]>(`${this.apiUrl}/creator/${userId}`, { 
      headers: this.createRequestHeaders(),
      withCredentials: true
    }).pipe(
      catchError(this.handleError)
    );
  }

  searchDocuments(term: string): Observable<Document[]> {
    const params = new HttpParams().set('search', term);
    return this.http.get<Document[]>(`${this.apiUrl}/search`, { 
      params,
      headers: this.createRequestHeaders(),
      withCredentials: true
    }).pipe(
      catchError(this.handleError)
    );
  }

  getReportsByType(types: DocumentType[]): Observable<Document[]> {
    return this.getDocumentsByTypes(types);
  }

  // Helper method for security checks (can be expanded with actual implementation)
  isDocumentCreator(documentId: number, username: string): Observable<boolean> {
    return this.http.get<boolean>(
      `${this.apiUrl}/${documentId}/creator/${username}`,
      { 
        headers: this.createRequestHeaders(),
        withCredentials: true
      }
    ).pipe(
      catchError(this.handleError)
    );
  }
}
