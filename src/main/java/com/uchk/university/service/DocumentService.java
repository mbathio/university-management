package com.uchk.university.service;

import com.uchk.university.entity.Document;
import com.uchk.university.entity.DocumentType;
import com.uchk.university.entity.User;
import com.uchk.university.exception.ResourceNotFoundException;
import com.uchk.university.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DocumentService {
    private final DocumentRepository documentRepository;
    private final UserService userService;
    private final FileStorageService fileStorageService;

    public void init() {
        fileStorageService.init();
    }

    public Document createDocument(Document document, Long userId, MultipartFile file) {
        User user = userService.getUserById(userId);
        document.setCreatedBy(user);
        
        if (file != null && !file.isEmpty()) {
            String filename = fileStorageService.store(file);
            document.setFilePath(filename);
        }
        
        return documentRepository.save(document);
    }

    public Document getDocumentById(Long id) {
        return documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found with id: " + id));
    }

    public List<Document> getAllDocuments() {
        return documentRepository.findAll();
    }

    public List<Document> getDocumentsByType(DocumentType type) {
        return documentRepository.findByType(type);
    }

    public List<Document> getDocumentsByCreator(Long userId) {
        User user = userService.getUserById(userId);
        return documentRepository.findByCreatedBy(user);
    }

    public List<Document> getDocumentsByVisibilityLevel(String visibilityLevel) {
        return documentRepository.findByVisibilityLevel(visibilityLevel);
    }

    public Document updateDocument(Long id, Document documentDetails, MultipartFile file) {
        Document document = getDocumentById(id);
        
        document.setTitle(documentDetails.getTitle());
        document.setType(documentDetails.getType());
        document.setContent(documentDetails.getContent());
        document.setVisibilityLevel(documentDetails.getVisibilityLevel());
        
        if (file != null && !file.isEmpty()) {
            // Delete old file if exists
            if (document.getFilePath() != null) {
                fileStorageService.deleteFile(document.getFilePath());
            }
            
            // Store new file
            String filename = fileStorageService.store(file);
            document.setFilePath(filename);
        }
        
        return documentRepository.save(document);
    }

    public void deleteDocument(Long id) {
        Document document = getDocumentById(id);
        
        // Delete file if exists
        if (document.getFilePath() != null) {
            fileStorageService.deleteFile(document.getFilePath());
        }
        
        documentRepository.delete(document);
    }
}