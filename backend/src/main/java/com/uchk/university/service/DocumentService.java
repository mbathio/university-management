package com.uchk.university.service;

import com.uchk.university.entity.Document;
import com.uchk.university.entity.DocumentType;
import com.uchk.university.entity.User;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;

public interface DocumentService {
    void init();
    List<Document> getDocumentsForUser(Long userId);
    Document createDocument(Document document, Long userId, MultipartFile file) throws Exception;
    Document updateDocument(Long id, Document document, MultipartFile file) throws Exception;
    Document getDocumentById(Long id);
    void deleteDocument(Long id);
    Resource loadFileAsResource(Long id) throws IOException;
    Resource loadFileAsResource(String filename) throws IOException;
    boolean isDocumentCreator(Long documentId, String username);
    List<Document> getAllDocuments();
    List<Document> getDocumentsByType(DocumentType type);
    List<Document> getDocumentsByTypes(List<DocumentType> types);
    List<Document> getDocumentsByCreator(Long userId);
    List<Document> getDocumentsByVisibilityLevel(String level);
}