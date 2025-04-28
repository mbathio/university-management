package com.uchk.university.controller;

import com.uchk.university.entity.Document;
import com.uchk.university.entity.DocumentType;
import com.uchk.university.service.DocumentService;
import com.uchk.university.security.CurrentUser;
import com.uchk.university.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
@Slf4j
public class DocumentController {
    private final DocumentService documentService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'FORMATION_MANAGER', 'ADMINISTRATION')")
    public ResponseEntity<Document> createDocument(
            @RequestPart("document") Document document,
            @RequestPart(value = "file", required = false) MultipartFile file,
            @CurrentUser User currentUser) {
        log.debug("REST request to create Document : {}", document);
        Document createdDocument = documentService.createDocument(document, currentUser.getId(), file);
        return ResponseEntity.ok(createdDocument);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'FORMATION_MANAGER', 'ADMINISTRATION') and " +
                  "@documentController.checkDocumentCreator(#id, authentication.name) or hasRole('ADMIN')")
    public ResponseEntity<Document> updateDocument(
            @PathVariable Long id,
            @RequestPart("document") Document document,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        log.debug("REST request to update Document : {}", document);
        Document updatedDocument = documentService.updateDocument(id, document, file);
        return ResponseEntity.ok(updatedDocument);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Document> getDocument(@PathVariable Long id) {
        log.debug("REST request to get Document : {}", id);
        Document document = documentService.getDocumentById(id);
        return ResponseEntity.ok(document);
    }

    @GetMapping
    public ResponseEntity<List<Document>> getAllDocuments() {
        log.debug("REST request to get all Documents");
        List<Document> documents = documentService.getAllDocuments();
        return ResponseEntity.ok(documents);
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<Document>> getDocumentsByType(@PathVariable DocumentType type) {
        log.debug("REST request to get Documents by type : {}", type);
        List<Document> documents = documentService.getDocumentsByType(type);
        return ResponseEntity.ok(documents);
    }

    @GetMapping("/creator/{userId}")
    public ResponseEntity<List<Document>> getDocumentsByCreator(@PathVariable Long userId) {
        log.debug("REST request to get Documents by creator : {}", userId);
        List<Document> documents = documentService.getDocumentsByCreator(userId);
        return ResponseEntity.ok(documents);
    }

    @GetMapping("/visibility/{level}")
    public ResponseEntity<List<Document>> getDocumentsByVisibilityLevel(@PathVariable String level) {
        log.debug("REST request to get Documents by visibility level : {}", level);
        List<Document> documents = documentService.getDocumentsByVisibilityLevel(level);
        return ResponseEntity.ok(documents);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'FORMATION_MANAGER', 'ADMINISTRATION') and " +
                  "@documentController.checkDocumentCreator(#id, authentication.name) or hasRole('ADMIN')")
    public ResponseEntity<Void> deleteDocument(@PathVariable Long id) {
        log.debug("REST request to delete Document : {}", id);
        documentService.deleteDocument(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/files/{filename:.+}")
@PreAuthorize("permitAll()")  // Explicitement défini comme public
public ResponseEntity<Resource> serveFile(@PathVariable String filename) {
    Resource file = documentService.loadFileAsResource(filename);
    
    return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + file.getFilename() + "\"")
            .body(file);
}

// Méthode à ajouter à DocumentController.java

@GetMapping("/search/types")
public ResponseEntity<List<Document>> getDocumentsByTypes(@RequestParam String types) {
    log.debug("REST request to get Documents by types : {}", types);
    List<DocumentType> documentTypes = Arrays.stream(types.split(","))
        .map(DocumentType::valueOf)
        .collect(Collectors.toList());
    
    List<Document> documents = documentService.getDocumentsByTypes(documentTypes);
    return ResponseEntity.ok(documents);
}

@GetMapping("/download/{id}")
@PreAuthorize("permitAll()")  // Explicitement défini comme public
public ResponseEntity<Resource> downloadDocument(@PathVariable Long id) {
    Document document = documentService.getDocumentById(id);
    if (document.getFilePath() == null) {
        return ResponseEntity.notFound().build();
    }

    Resource resource = documentService.loadFileAsResource(document.getFilePath());
    
    return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + document.getTitle() + "\"")
            .body(resource);
}

    // Helper method for security expression
    public boolean checkDocumentCreator(Long documentId, String username) {
        return documentService.isDocumentCreator(documentId, username);
    }
}