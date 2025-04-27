package com.uchk.university.service.impl;

import com.uchk.university.entity.Document;
import com.uchk.university.entity.DocumentType;
import com.uchk.university.entity.User;
import com.uchk.university.exception.DocumentStorageException;
import com.uchk.university.exception.ResourceNotFoundException;
import com.uchk.university.repository.DocumentRepository;
import com.uchk.university.repository.UserRepository;
import com.uchk.university.service.DocumentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
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

    @Value("${upload.root-location:uploads}")
    private String uploadRootLocation;

    private Path getRootLocationPath() {
        return Paths.get(uploadRootLocation);
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
            try {
                // Create upload directory if it doesn't exist
                Path rootLocation = getRootLocationPath();
                if (!Files.exists(rootLocation)) {
                    Files.createDirectories(rootLocation);
                }

                // Generate unique filename to prevent overwriting
                String originalFilename = file.getOriginalFilename();
                String extension = "";
                if (originalFilename != null && originalFilename.contains(".")) {
                    extension = originalFilename.substring(originalFilename.lastIndexOf("."));
                }
                String filename = UUID.randomUUID() + extension;

                // Copy file to upload location
                Path destinationFile = rootLocation.resolve(filename);
                Files.copy(file.getInputStream(), destinationFile, StandardCopyOption.REPLACE_EXISTING);

                // Set file path
                document.setFilePath(filename);
                log.debug("File saved: {}", filename);
            } catch (IOException e) {
                throw new DocumentStorageException("Failed to store file", e);
            }
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
            try {
                // Create upload directory if it doesn't exist
                Path rootLocation = getRootLocationPath();
                if (!Files.exists(rootLocation)) {
                    Files.createDirectories(rootLocation);
                }

                // Delete old file if exists
                if (document.getFilePath() != null) {
                    try {
                        Path oldFile = rootLocation.resolve(document.getFilePath());
                        Files.deleteIfExists(oldFile);
                    } catch (IOException e) {
                        log.warn("Could not delete old file: {}", document.getFilePath(), e);
                    }
                }

                // Generate unique filename to prevent overwriting
                String originalFilename = file.getOriginalFilename();
                String extension = "";
                if (originalFilename != null && originalFilename.contains(".")) {
                    extension = originalFilename.substring(originalFilename.lastIndexOf("."));
                }
                String filename = UUID.randomUUID() + extension;

                // Copy file to upload location
                Path destinationFile = rootLocation.resolve(filename);
                Files.copy(file.getInputStream(), destinationFile, StandardCopyOption.REPLACE_EXISTING);

                // Set file path
                document.setFilePath(filename);
                log.debug("File updated: {}", filename);
            } catch (IOException e) {
                throw new DocumentStorageException("Failed to store file", e);
            }
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
                Path rootLocation = getRootLocationPath();
                Path file = rootLocation.resolve(document.getFilePath());
                Files.deleteIfExists(file);
                log.debug("File deleted: {}", document.getFilePath());
            } catch (IOException e) {
                log.warn("Could not delete file: {}", document.getFilePath(), e);
            }
        }

        documentRepository.delete(document);
    }

    @Override
    public boolean isDocumentCreator(Long documentId, String username) {
        Document document = getDocumentById(documentId);
        return document.getCreatedBy().getUsername().equals(username);
    }
}