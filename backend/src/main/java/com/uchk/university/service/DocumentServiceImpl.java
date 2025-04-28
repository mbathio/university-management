package com.uchk.university.service;

import com.uchk.university.entity.Document;
import com.uchk.university.entity.DocumentType;
import com.uchk.university.entity.Role;
import com.uchk.university.entity.User;
import com.uchk.university.exception.DocumentStorageException;
import com.uchk.university.exception.ResourceNotFoundException;
import com.uchk.university.repository.DocumentRepository;
import com.uchk.university.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import com.uchk.university.dto.NotificationDto;

@Service
@RequiredArgsConstructor
@Slf4j
public class DocumentServiceImpl implements DocumentService {
    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    private final NotificationService notificationService;

    @Value("${document.upload.dir}")
    private String uploadDir;

    @Override
    public void init() {
        try {
            Path directoryPath = Paths.get(uploadDir);
            if (!Files.exists(directoryPath)) {
                Files.createDirectories(directoryPath);
                log.info("Created document storage directory: {}", directoryPath);
            }
        } catch (IOException e) {
            log.error("Failed to initialize document storage: {}", e.getMessage(), e);
            throw new DocumentStorageException("Could not initialize storage", e);
        }
    }

    @Override
    public Document createDocument(Document document, Long userId, MultipartFile file) {
        log.debug("Creating document: {}, userId: {}", document, userId);
        try {
            User creator = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
            // Validate document before saving
            if (document == null) {
                log.error("Attempted to create null document");
                throw new IllegalArgumentException("Document cannot be null");
            }
        
            // Set creator and timestamps
            document.setCreator(creator);
            document.setCreatedAt(LocalDateTime.now());
        
            // Handle file upload if present
            if (file != null && !file.isEmpty()) {
                String storedFileName = fileStorageService.store(file);
                document.setFilePath(storedFileName);
                document.setFileName(file.getOriginalFilename());
                log.debug("File saved: {}", storedFileName);
            }
        
            Document savedDocument = documentRepository.save(document);
            log.info("Document created successfully: {}", savedDocument.getId());
            return savedDocument;
        } catch (Exception e) {
            log.error("Error creating document: {}", e.getMessage(), e);
            throw new DocumentStorageException("Could not create document: " + e.getMessage(), e);
        }
    }

    @Override
    public Document updateDocument(Long id, Document updatedDocument, MultipartFile file) throws Exception {
        log.debug("Updating document: {}, id: {}", updatedDocument, id);
        Document document = getDocumentById(id);

        // Update fields
        document.setTitle(updatedDocument.getTitle());
        document.setDescription(updatedDocument.getDescription());
        document.setType(updatedDocument.getType());
        document.setVisibilityLevel(updatedDocument.getVisibilityLevel());
        document.setUpdatedAt(LocalDateTime.now());

        // Handle file upload if present
        if (file != null && !file.isEmpty()) {
            // Delete old file if exists
            if (document.getFilePath() != null) {
                try {
                    fileStorageService.deleteFile(document.getFilePath());
                } catch (Exception e) {
                    log.warn("Could not delete old file: {}", document.getFilePath(), e);
                }
            }

            // Store new file
            String storedFileName = fileStorageService.store(file);
            document.setFilePath(storedFileName);
            document.setFileName(file.getOriginalFilename());
            log.debug("File updated: {}", storedFileName);
        }

        return documentRepository.save(document);
    }

    @Override
    public Document getDocumentById(Long id) {
        return documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found with id: " + id));
    }

    @Override
    public List<Document> getAllDocuments() {
        return documentRepository.findAll();
    }

    @Override
    public List<Document> getDocumentsByType(DocumentType type) {
        return documentRepository.findByType(type);
    }

    @Override
    public List<Document> getDocumentsByTypes(List<DocumentType> types) {
        log.debug("Fetching documents with types: {}", types);
        return documentRepository.findByTypeIn(types);
    }

    @Override
    public List<Document> getDocumentsByCreator(Long userId) {
        User creator = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        return documentRepository.findByCreator(creator);
    }

    @Override
    public List<Document> getDocumentsByVisibilityLevel(String level) {
        return documentRepository.findByVisibilityLevel(level);
    }

    @Override
    public void deleteDocument(Long id) {
        Document document = getDocumentById(id);

        // Delete file if exists
        if (document.getFilePath() != null) {
            try {
                fileStorageService.deleteFile(document.getFilePath());
                log.debug("File deleted: {}", document.getFilePath());
            } catch (Exception e) {
                log.warn("Could not delete file: {}", document.getFilePath(), e);
            }
        }

        documentRepository.delete(document);
    }

    @Override
    public Resource loadFileAsResource(String filePath) {
        return fileStorageService.loadAsResource(filePath);
    }

    @Override
    public boolean isDocumentCreator(Long documentId, String username) {
        Document document = getDocumentById(documentId);
        return document.getCreator().getUsername().equals(username);
    }
    
    @Override
    public List<Document> getDocumentsForUser(Long userId) {
        // Implementation based on user's role and permissions
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        // Admin can see all documents
        if (user.getRole() == Role.ADMIN) {
            return getAllDocuments();
        }
        
        // Other users see documents based on visibility
        return documentRepository.findByVisibilityLevelOrCreator("PUBLIC", user);
    }

    @Override
    public Resource loadFileAsResource(Long id) throws IOException {
        Document document = getDocumentById(id);
        if (document.getFilePath() == null) {
            throw new ResourceNotFoundException("No file found for document with id: " + id);
        }
        return loadFileAsResource(document.getFilePath());
    }

    
}