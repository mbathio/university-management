package com.uchk.university.service;

import com.uchk.university.entity.Document;
import com.uchk.university.entity.DocumentType;
import com.uchk.university.entity.User;
import com.uchk.university.exception.ResourceNotFoundException;
import com.uchk.university.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DocumentService {
    private final DocumentRepository documentRepository;
    private final UserService userService;
    
    private final Path rootLocation = Paths.get("uploads");

    public void init() {
        try {
            if (!Files.exists(rootLocation)) {
                Files.createDirectory(rootLocation);
            }
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize storage", e);
        }
    }

    public Document createDocument(Document document, Long userId, MultipartFile file) {
        User user = userService.getUserById(userId);
        document.setCreatedBy(user);
        
        if (file != null && !file.isEmpty()) {
            String filename = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            try {
                if (!Files.exists(rootLocation)) {
                    init();
                }
                Files.copy(file.getInputStream(), rootLocation.resolve(filename));
                document.setFilePath(filename);
            } catch (IOException e) {
                throw new RuntimeException("Failed to store file", e);
            }
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
                try {
                    Files.deleteIfExists(rootLocation.resolve(document.getFilePath()));
                } catch (IOException e) {
                    // Log error but continue
                    e.printStackTrace();
                }
            }
            
            // Store new file
            String filename = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            try {
                Files.copy(file.getInputStream(), rootLocation.resolve(filename));
                document.setFilePath(filename);
            } catch (IOException e) {
                throw new RuntimeException("Failed to store file", e);
            }
        }
        
        return documentRepository.save(document);
    }

    public void deleteDocument(Long id) {
        Document document = getDocumentById(id);
        
        // Delete file if exists
        if (document.getFilePath() != null) {
            try {
                Files.deleteIfExists(rootLocation.resolve(document.getFilePath()));
            } catch (IOException e) {
                // Log error but continue with document deletion
                e.printStackTrace();
            }
        }
        
        documentRepository.delete(document);
    }
}