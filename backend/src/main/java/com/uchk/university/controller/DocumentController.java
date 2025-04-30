package com.uchk.university.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.uchk.university.entity.Document;
import com.uchk.university.entity.DocumentType;
import com.uchk.university.service.DocumentService;
import com.uchk.university.security.CurrentUser;
import com.uchk.university.entity.User;
import com.uchk.university.repository.UserRepository; 
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {
    private static final Logger log = LoggerFactory.getLogger(DocumentController.class);
    private final DocumentService documentService;
    private final UserRepository userRepository;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Document>> getAllDocuments(@CurrentUser User currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        try {
            List<Document> documents = documentService.getDocumentsForUser(currentUser.getId());
            return ResponseEntity.ok(documents);
        } catch (Exception e) {
            log.error("Error getting documents for user: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping(consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'FORMATION_MANAGER', 'ADMINISTRATION')")
    public ResponseEntity<?> createDocument(
            @RequestPart("document") String documentJson,
            @RequestPart(value = "file", required = false) MultipartFile file,
            @CurrentUser User currentUser) {
        try {
            // Parse JSON manually for more control
            ObjectMapper mapper = new ObjectMapper();
            Document document = mapper.readValue(documentJson, Document.class);
    
            // Validate document
            validateDocument(document);
    
            document.setType(parseDocumentType(document.getType()));
            Document createdDocument = documentService.createDocument(document, currentUser.getId(), file);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdDocument);
        } catch (JsonProcessingException e) {
            log.error("Invalid document JSON: {}", e.getMessage());
            return ResponseEntity.badRequest().body("Invalid document format");
        } catch (IllegalArgumentException e) {
            log.error("Document validation error: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error creating document", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("An unexpected error occurred: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'FORMATION_MANAGER', 'ADMINISTRATION')")
    public ResponseEntity<?> updateDocument(
            @PathVariable Long id,
            @RequestPart("document") Document document,
            @RequestPart(value = "file", required = false) MultipartFile file,
            @CurrentUser User currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        try {
            // Check if user has permission to update this document
            if (!documentService.isDocumentCreator(id, currentUser.getUsername()) && 
                !currentUser.getRole().name().equals("ADMIN")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You don't have permission to update this document");
            }
            
            document.setType(parseDocumentType(document.getType()));
            Document updatedDocument = documentService.updateDocument(id, document, file);
            return ResponseEntity.ok(updatedDocument);
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
        } catch (Exception e) {
            log.error("Error updating document: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("An error occurred while updating the document");
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getDocument(@PathVariable Long id, @CurrentUser User currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        try {
            Document document = documentService.getDocumentById(id);
            
            // Check if the user has access to this document based on visibility level
            if (!documentService.userHasAccessToDocument(document, currentUser)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You don't have access to this document");
            }
            
            return ResponseEntity.ok(document);
        } catch (Exception e) {
            log.error("Error getting document: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("An error occurred while retrieving the document");
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'FORMATION_MANAGER', 'ADMINISTRATION')")
    public ResponseEntity<?> deleteDocument(@PathVariable Long id, @CurrentUser User currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        try {
            // Check if user has permission to delete this document
            if (!documentService.isDocumentCreator(id, currentUser.getUsername()) && 
                !currentUser.getRole().name().equals("ADMIN")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You don't have permission to delete this document");
            }
            
            documentService.deleteDocument(id);
            return ResponseEntity.ok().build();
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
        } catch (Exception e) {
            log.error("Error deleting document: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("An error occurred while deleting the document");
        }
    }

    @GetMapping("/types")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<DocumentType>> getDocumentTypes() {
        try {
            return ResponseEntity.ok(Arrays.asList(DocumentType.values()));
        } catch (Exception e) {
            log.error("Error getting document types: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/download/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> downloadDocument(@PathVariable Long id, @CurrentUser User currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        try {
            Document document = documentService.getDocumentById(id);
            
            // Check if the user has access to this document based on visibility level
            if (!documentService.userHasAccessToDocument(document, currentUser)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You don't have access to this document");
            }
            
            Resource resource = documentService.loadFileAsResource(id);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, 
                            "attachment; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);
        } catch (Exception e) {
            log.error("Error downloading document: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("An error occurred while downloading the document");
        }
    }

    // Helper method for security expression
    public boolean checkDocumentCreator(Long documentId, String username) {
        return documentService.isDocumentCreator(documentId, username);
    }

    private DocumentType parseDocumentType(Object typeObj) {
        if (typeObj == null) {
            return DocumentType.AUTRE;
        }
        
        if (typeObj instanceof DocumentType) {
            return (DocumentType) typeObj;
        }
        
        if (typeObj instanceof String) {
            try {
                return DocumentType.valueOf(((String) typeObj).toUpperCase().replace(" ", "_"));
            } catch (IllegalArgumentException e) {
                return DocumentType.AUTRE;
            }
        }
        
        return DocumentType.AUTRE;
    }

    private void validateDocument(Document document) {
        if (document.getTitle() == null || document.getTitle().isEmpty()) {
            throw new IllegalArgumentException("Document title is required");
        }
        if (document.getType() == null) {
            throw new IllegalArgumentException("Document type is required");
        }
    }
}