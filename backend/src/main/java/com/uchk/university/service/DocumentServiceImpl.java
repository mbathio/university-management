package com.uchk.university.service;

import com.uchk.university.entity.Document;
import com.uchk.university.entity.DocumentType;
import com.uchk.university.entity.User;
import com.uchk.university.exception.DocumentStorageException;
import com.uchk.university.exception.ResourceNotFoundException;
import com.uchk.university.repository.DocumentRepository;
import com.uchk.university.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class DocumentServiceImpl implements DocumentService {
    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

    @Value("${document.upload.dir}")
    private String uploadDir;

    @Override
    public void init() {
        try {
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(uploadPath);
            log.info("Document storage directory created: {}", uploadPath);
        } catch (IOException ex) {
            throw new DocumentStorageException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    @Override
    public Document createDocument(Document document, Long userId, MultipartFile file) {
        log.debug("Creating document: {}, userId: {}", document, userId);
        User creator = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // Set creator and timestamps
        document.setCreatedBy(creator);
        document.setCreatedAt(LocalDateTime.now());

        // Handle file upload if present
        if (file != null && !file.isEmpty()) {
            String storedFileName = fileStorageService.store(file);
            document.setFilePath(storedFileName);
            log.debug("File saved: {}", storedFileName);
        }

        return documentRepository.save(document);
    }

    @Override
    public Document updateDocument(Long id, Document updatedDocument, MultipartFile file) {
        log.debug("Updating document: {}, id: {}", updatedDocument, id);
        Document document = getDocumentById(id);

        // Update fields
        document.setTitle(updatedDocument.getTitle());
        document.setContent(updatedDocument.getContent());
        document.setType(updatedDocument.getType());
        document.setVisibilityLevel(updatedDocument.getVisibilityLevel());
        document.setUpdatedAt(LocalDateTime.now());
        
        // Update reference if provided
        if (updatedDocument.getReference() != null) {
            document.setReference(updatedDocument.getReference());
        }
        
        // Update tags if provided
        if (updatedDocument.getTags() != null) {
            document.setTags(updatedDocument.getTags());
        }

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
        return documentRepository.findByCreatedBy(creator);
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
        return document.getCreatedBy().getUsername().equals(username);
    }
    
   
}