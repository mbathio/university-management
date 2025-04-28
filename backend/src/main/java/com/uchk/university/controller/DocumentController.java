package com.uchk.university.controller;

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
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {
    private static final Logger log = LoggerFactory.getLogger(DocumentController.class);
    private final DocumentService documentService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Document>> getAllDocuments(@CurrentUser User currentUser) {
        log.debug("REST request to get all documents for current user");
        try {
            List<Document> documents = documentService.getDocumentsForUser(currentUser.getId());
            return ResponseEntity.ok(documents);
        } catch (Exception e) {
            log.error("Error getting documents for user", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'FORMATION_MANAGER', 'ADMINISTRATION')")
    public ResponseEntity<?> createDocument(
            @RequestPart("document") Document document,
            @RequestPart(value = "file", required = false) MultipartFile file,
            @CurrentUser User currentUser) {
        log.debug("REST request to create Document : {}", document);
        try {
            Long userId = (currentUser != null) ? currentUser.getId() : getDefaultAdminUserId();

            if (document == null) {
                log.error("Received null document in createDocument");
                return ResponseEntity.badRequest().body("Document cannot be null");
            }

            document.setType(parseDocumentType(document.getType()));

            Document createdDocument = documentService.createDocument(document, userId, file);
            return ResponseEntity.ok(createdDocument);
        } catch (IllegalArgumentException e) {
            log.error("Invalid document creation request", e);
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error creating document", e);
            return ResponseEntity.internalServerError().body("Failed to create document: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'FORMATION_MANAGER', 'ADMINISTRATION') and " +
                  "@documentController.checkDocumentCreator(#id, authentication.name) or hasRole('ADMIN')")
    public ResponseEntity<Document> updateDocument(
            @PathVariable Long id,
            @RequestPart("document") Document document,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        log.debug("REST request to update Document : {}", document);
        try {
            document.setType(parseDocumentType(document.getType()));
            Document updatedDocument = documentService.updateDocument(id, document, file);
            return ResponseEntity.ok(updatedDocument);
        } catch (Exception e) {
            log.error("Error updating document", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Document> getDocument(@PathVariable Long id) {
        log.debug("REST request to get Document : {}", id);
        try {
            Document document = documentService.getDocumentById(id);
            return ResponseEntity.ok(document);
        } catch (Exception e) {
            log.error("Error getting document", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'FORMATION_MANAGER', 'ADMINISTRATION') and " +
                  "@documentController.checkDocumentCreator(#id, authentication.name) or hasRole('ADMIN')")
    public ResponseEntity<Void> deleteDocument(@PathVariable Long id) {
        log.debug("REST request to delete Document : {}", id);
        try {
            documentService.deleteDocument(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Error deleting document", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/types")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<DocumentType>> getDocumentTypes() {
        log.debug("REST request to get all document types");
        try {
            return ResponseEntity.ok(Arrays.asList(DocumentType.values()));
        } catch (Exception e) {
            log.error("Error getting document types", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/download/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Resource> downloadDocument(@PathVariable Long id) throws IOException {
        log.debug("REST request to download Document : {}", id);
        try {
            Resource resource = documentService.loadFileAsResource(id);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, 
                            "attachment; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);
        } catch (Exception e) {
            log.error("Error downloading document", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // Helper method for security expression
    public boolean checkDocumentCreator(Long documentId, String username) {
        return documentService.isDocumentCreator(documentId, username);
    }

    // New method to get default admin user ID
    private Long getDefaultAdminUserId() {
        return userRepository.findByUsername("admin")
            .map(User::getId)
            .orElseThrow(() -> new RuntimeException("No default admin user found"));
    }

    private DocumentType parseDocumentType(Object typeObj) {
        if (typeObj == null) {
            log.warn("No document type specified, defaulting to AUTRE");
            return DocumentType.AUTRE;
        }
        
        if (typeObj instanceof DocumentType) {
            return (DocumentType) typeObj;
        }
        
        if (typeObj instanceof String) {
            try {
                return DocumentType.valueOf(((String) typeObj).toUpperCase().replace(" ", "_"));
            } catch (IllegalArgumentException e) {
                log.warn("Invalid document type: {}, defaulting to AUTRE", typeObj);
                return DocumentType.AUTRE;
            }
        }
        
        log.warn("Unsupported document type: {}, defaulting to AUTRE", typeObj);
        return DocumentType.AUTRE;
    }
}