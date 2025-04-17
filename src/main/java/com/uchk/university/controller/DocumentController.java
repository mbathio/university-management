package com.uchk.university.controller;

import com.uchk.university.entity.Document;
import com.uchk.university.entity.DocumentType;
import com.uchk.university.service.DocumentService;
import lombok.RequiredArgsConstructor;
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
public class DocumentController {
    private final DocumentService documentService;
    private final Path rootLocation = Paths.get("uploads");

    @GetMapping("/{id}")
    public ResponseEntity<Document> getDocumentById(@PathVariable Long id) {
        return ResponseEntity.ok(documentService.getDocumentById(id));
    }

    @GetMapping
    public ResponseEntity<List<Document>> getAllDocuments() {
        return ResponseEntity.ok(documentService.getAllDocuments());
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<Document>> getDocumentsByType(@PathVariable DocumentType type) {
        return ResponseEntity.ok(documentService.getDocumentsByType(type));
    }

    @GetMapping("/creator/{userId}")
    public ResponseEntity<List<Document>> getDocumentsByCreator(@PathVariable Long userId) {
        return ResponseEntity.ok(documentService.getDocumentsByCreator(userId));
    }

    @GetMapping("/visibility/{level}")
    public ResponseEntity<List<Document>> getDocumentsByVisibilityLevel(@PathVariable String level) {
        return ResponseEntity.ok(documentService.getDocumentsByVisibilityLevel(level));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Document> createDocument(
            @RequestPart("document") Document document,
            @RequestPart(value = "file", required = false) MultipartFile file,
            @RequestParam Long userId) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(documentService.createDocument(document, userId, file));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN') or @documentService.getDocumentById(#id).createdBy.id == authentication.principal.id")
    public ResponseEntity<Document> updateDocument(
            @PathVariable Long id,
            @RequestPart("document") Document document,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        return ResponseEntity.ok(documentService.updateDocument(id, document, file));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @documentService.getDocumentById(#id).createdBy.id == authentication.principal.id")
    public ResponseEntity<Void> deleteDocument(@PathVariable Long id) {
        documentService.deleteDocument(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/files/{filename:.+}")
    @ResponseBody
    public ResponseEntity<Resource> serveFile(@PathVariable String filename) {
        try {
            Path file = rootLocation.resolve(filename);
            Resource resource = new UrlResource(file.toUri());
            
            if (resource.exists() || resource.isReadable()) {
                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}