package com.uchk.university.service;

import com.uchk.university.exception.DocumentStorageException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class FileStorageService {
    @Value("${upload.root-location:uploads}")
    private String uploadRootLocation;
    private final Path rootLocation;
    private final List<String> allowedFileExtensions = Arrays.asList(
            "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", 
            "txt", "zip", "jpg", "jpeg", "png", "gif"
    );
    
    public FileStorageService(@Value("${upload.root-location:uploads}") String uploadRootLocation) {
        this.rootLocation = Paths.get(uploadRootLocation);
        this.uploadRootLocation = uploadRootLocation;
    }

    public void init() {
        try {
            if (!Files.exists(rootLocation)) {
                Files.createDirectories(rootLocation);
            }
        } catch (IOException e) {
            throw new DocumentStorageException("Could not initialize storage", e);
        }
    }

    public String store(MultipartFile file) {
        validateFile(file);
        
        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
        String extension = getFileExtension(originalFilename);
        String filename = UUID.randomUUID().toString() + "." + extension;
        
        try {
            if (!Files.exists(rootLocation)) {
                init();
            }
            
            // Use StandardCopyOption.REPLACE_EXISTING to handle potential file conflicts
            Files.copy(file.getInputStream(), rootLocation.resolve(filename), StandardCopyOption.REPLACE_EXISTING);
            return filename;
        } catch (IOException e) {
            throw new DocumentStorageException("Failed to store file " + filename, e);
        }
    }

    public Resource loadAsResource(String filename) {
        try {
            // Additional validation to prevent path traversal
            if (filename.contains("..")) {
                throw new DocumentStorageException("Filename contains invalid path sequence: " + filename);
            }
            
            Path file = rootLocation.resolve(filename).normalize();
            
            // Check that the resolved path is still within our root location
            if (!file.toFile().getCanonicalPath().startsWith(rootLocation.toFile().getCanonicalPath())) {
                throw new DocumentStorageException("File access attempt outside of storage directory: " + filename);
            }
            
            Resource resource = new UrlResource(file.toUri());
            if (resource.exists() || resource.isReadable()) {
                return resource;
            } else {
                throw new DocumentStorageException("Could not read file: " + filename);
            }
        } catch (MalformedURLException e) {
            throw new DocumentStorageException("Could not read file: " + filename, e);
        } catch (IOException e) {
            throw new DocumentStorageException("I/O error accessing file: " + filename, e);
        }
    }

    public void deleteFile(String filename) {
        try {
            // Additional validation to prevent path traversal
            if (filename.contains("..")) {
                throw new DocumentStorageException("Filename contains invalid path sequence: " + filename);
            }
            
            Path file = rootLocation.resolve(filename).normalize();
            
            // Check that the resolved path is still within our root location
            if (!file.toFile().getCanonicalPath().startsWith(rootLocation.toFile().getCanonicalPath())) {
                throw new DocumentStorageException("File deletion attempt outside of storage directory: " + filename);
            }
            
            Files.deleteIfExists(file);
        } catch (IOException e) {
            throw new DocumentStorageException("Could not delete file: " + filename, e);
        }
    }

    public void deleteFilePath(String filePath) {
        try {
            if (filePath == null || filePath.isEmpty()) {
                return;
            }
            Path path = Paths.get(filePath).normalize();
            Files.deleteIfExists(path);
        } catch (IOException ex) {
            throw new DocumentStorageException("Could not delete file path " + filePath, ex);
        }
    }

    public void delete(String fileName) {
        try {
            if (fileName == null || fileName.isEmpty()) {
                return;
            }
            Path filePath = this.rootLocation.resolve(fileName).normalize();
            Files.deleteIfExists(filePath);
        } catch (IOException ex) {
            throw new DocumentStorageException("Could not delete file " + fileName, ex);
        }
    }

    private void validateFile(MultipartFile file) {
        if (file == null) {
            throw new DocumentStorageException("Cannot store null file");
        }
        
        if (file.isEmpty()) {
            throw new DocumentStorageException("Failed to store empty file");
        }
        
        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
        if (originalFilename.contains("..")) {
            throw new DocumentStorageException("Cannot store file with relative path outside current directory: " + originalFilename);
        }
        
        String extension = getFileExtension(originalFilename);
        if (!allowedFileExtensions.contains(extension.toLowerCase())) {
            throw new DocumentStorageException("File type not allowed. Allowed types: " + String.join(", ", allowedFileExtensions));
        }
        
        // Check file size (additional check beyond Spring's multipart configuration)
        if (file.getSize() > 10 * 1024 * 1024) { // 10MB
            throw new DocumentStorageException("File size exceeds maximum limit (10MB)");
        }
    }

    private String getFileExtension(String filename) {
        int dotIndex = filename.lastIndexOf('.');
        if (dotIndex < 0) {
            return "";
        }
        return filename.substring(dotIndex + 1);
    }
}