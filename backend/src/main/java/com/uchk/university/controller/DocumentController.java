package com.uchk.university.controller;

import com.uchk.university.entity.Document;
import com.uchk.university.entity.DocumentType;
import com.uchk.university.exception.DocumentStorageException;
import com.uchk.university.exception.ResourceNotFoundException;
import com.uchk.university.service.DocumentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Documents", description = "API pour la gestion des documents")
public class DocumentController {
    private final DocumentService documentService;
    
    @Value("${upload.root-location:uploads}")
    private String uploadRootLocation;
    
    private Path getRootLocationPath() {
        return Paths.get(uploadRootLocation);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtenir un document par ID")
    public ResponseEntity<Document> getDocumentById(@PathVariable Long id) {
        log.debug("REST request to get Document : {}", id);
        return ResponseEntity.ok(documentService.getDocumentById(id));
    }

    @GetMapping
    @Operation(summary = "Obtenir tous les documents")
    public ResponseEntity<List<Document>> getAllDocuments() {
        log.debug("REST request to get all Documents");
        return ResponseEntity.ok(documentService.getAllDocuments());
    }

    @GetMapping("/type/{type}")
    @Operation(summary = "Obtenir les documents par type")
    public ResponseEntity<List<Document>> getDocumentsByType(@PathVariable DocumentType type) {
        log.debug("REST request to get Documents by type : {}", type);
        return ResponseEntity.ok(documentService.getDocumentsByType(type));
    }

    @GetMapping("/creator/{userId}")
    @Operation(summary = "Obtenir les documents par créateur")
    public ResponseEntity<List<Document>> getDocumentsByCreator(@PathVariable Long userId) {
        log.debug("REST request to get Documents by creator : {}", userId);
        return ResponseEntity.ok(documentService.getDocumentsByCreator(userId));
    }

    @GetMapping("/visibility/{level}")
    @Operation(summary = "Obtenir les documents par niveau de visibilité")
    public ResponseEntity<List<Document>> getDocumentsByVisibilityLevel(@PathVariable String level) {
        log.debug("REST request to get Documents by visibility level : {}", level);
        return ResponseEntity.ok(documentService.getDocumentsByVisibilityLevel(level));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Créer un nouveau document")
    public ResponseEntity<Document> createDocument(
            @RequestPart("document") @Valid Document document,
            @RequestPart(value = "file", required = false) MultipartFile file,
            @RequestParam Long userId) {
        log.debug("REST request to save Document : {}, userId: {}", document, userId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(documentService.createDocument(document, userId, file));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN') or @documentService.isDocumentCreator(#id, authentication.principal.username)")
    @Operation(summary = "Mettre à jour un document existant")
    public ResponseEntity<Document> updateDocument(
            @PathVariable Long id,
            @RequestPart("document") @Valid Document document,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        log.debug("REST request to update Document : {}, id: {}", document, id);
        return ResponseEntity.ok(documentService.updateDocument(id, document, file));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @documentService.isDocumentCreator(#id, authentication.principal.username)")
    @Operation(summary = "Supprimer un document")
    public ResponseEntity<Void> deleteDocument(@PathVariable Long id) {
        log.debug("REST request to delete Document : {}", id);
        documentService.deleteDocument(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/files/{filename:.+}")
    @ResponseBody
    @Operation(summary = "Télécharger un fichier")
    public ResponseEntity<Resource> serveFile(@PathVariable String filename) {
        try {
            Path file = getRootLocationPath().resolve(filename);
            Resource resource = new UrlResource(file.toUri());
            
            if (resource.exists() || resource.isReadable()) {
                log.debug("File found: {}", filename);
                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                log.warn("File not found: {}", filename);
                throw new ResourceNotFoundException("File not found: " + filename);
            }
        } catch (IOException e) {
            log.error("Error serving file: {}", filename, e);
            throw new DocumentStorageException("Could not read file: " + filename, e);
        }
    }
}