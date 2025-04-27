package com.uchk.university.service;

import com.uchk.university.entity.Document;
import com.uchk.university.entity.DocumentType;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface DocumentService {
    Document createDocument(Document document, Long userId, MultipartFile file);
    Document updateDocument(Long id, Document document, MultipartFile file);
    Document getDocumentById(Long id);
    List<Document> getAllDocuments();
    List<Document> getDocumentsByType(DocumentType type);
    List<Document> getDocumentsByCreator(Long userId);
    List<Document> getDocumentsByVisibilityLevel(String level);
    void deleteDocument(Long id);
    boolean isDocumentCreator(Long documentId, String username);
    
    // Added method for file download
    Resource loadFileAsResource(String filePath);
}