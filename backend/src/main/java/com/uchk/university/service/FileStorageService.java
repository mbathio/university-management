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
    
    // Maximum file size in bytes (10MB)
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024;
    
    public FileStorageService(@Value("${upload.root-location:uploads}") String uploadRootLocation) {
        this.rootLocation = Paths.get(uploadRootLocation).toAbsolutePath().normalize();
        this.uploadRootLocation = uploadRootLocation;
    }

    public void init() {
        try {
            if (!Files.exists(rootLocation)) {
                Files.createDirectories(rootLocation);
            }
            
            // Set restrictive permissions on the upload directory
            try {
                Files.setPosixFilePermissions(rootLocation, 
                    java.nio.file.attribute.PosixFilePermissions.fromString("rwx------"));
            } catch (UnsupportedOperationException e) {
                // If not on POSIX system, try to make directory non-readable by others
                rootLocation.toFile().setReadable(false, false);
                rootLocation.toFile().setReadable(true, true);
                rootLocation.toFile().setWritable(false, false);
                rootLocation.toFile().setWritable(true, true);
                rootLocation.toFile().setExecutable(false, false);
                rootLocation.toFile().setExecutable(true, true);
            }
        } catch (IOException e) {
            throw new DocumentStorageException("Could not initialize storage", e);
        }
    }

    public String store(MultipartFile file) {
        validateFile(file);
        
        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
        String sanitizedFilename = sanitizeFilename(originalFilename);
        String extension = getFileExtension(sanitizedFilename);
        
        // Generate a UUID-based filename to prevent predictable filenames
        String filename = UUID.randomUUID().toString() + "." + extension;
        
        try {
            if (!Files.exists(rootLocation)) {
                init();
            }
            
            Path destinationFile = rootLocation.resolve(filename).normalize();
            
            // Double-check that the destination file is within the root directory
            if (!destinationFile.getParent().equals(rootLocation)) {
                throw new DocumentStorageException("Cannot store file outside root directory");
            }
            
            // Use StandardCopyOption.REPLACE_EXISTING to handle potential file conflicts
            Files.copy(file.getInputStream(), destinationFile, StandardCopyOption.REPLACE_EXISTING);
            
            // Set restrictive permissions on the file
            try {
                Files.setPosixFilePermissions(destinationFile, 
                    java.nio.file.attribute.PosixFilePermissions.fromString("rw-------"));
            } catch (UnsupportedOperationException e) {
                // If not on POSIX system
                destinationFile.toFile().setReadable(false, false);
                destinationFile.toFile().setReadable(true, true);
                destinationFile.toFile().setWritable(false, false);
                destinationFile.toFile().setWritable(true, true);
                destinationFile.toFile().setExecutable(false, false);
            }
            
            return filename;
        } catch (IOException e) {
            throw new DocumentStorageException("Failed to store file " + filename, e);
        }
    }

    public Resource loadAsResource(String filename) {
        try {
            // Security: Prevent any path traversal attempts
            if (filename == null || filename.isEmpty() || filename.contains("..") || filename.contains("/") || filename.contains("\\")) {
                throw new DocumentStorageException("Invalid filename: " + filename);
            }
            
            Path file = rootLocation.resolve(filename).normalize();
            
            // Extra security: ensure we don't leave the root location
            if (!file.getParent().equals(rootLocation)) {
                throw new DocumentStorageException("File access attempt outside of storage directory");
            }
            
            Resource resource = new UrlResource(file.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new DocumentStorageException("Could not read file: " + filename);
            }
        } catch (MalformedURLException e) {
            throw new DocumentStorageException("Could not read file: " + filename, e);
        }
    }

    public void deleteFile(String filename) {
        try {
            // Security: Prevent any path traversal attempts
            if (filename == null || filename.isEmpty() || filename.contains("..") || filename.contains("/") || filename.contains("\\")) {
                throw new DocumentStorageException("Invalid filename: " + filename);
            }
            
            Path file = rootLocation.resolve(filename).normalize();
            
            // Extra security: ensure we don't leave the root location
            if (!file.getParent().equals(rootLocation)) {
                throw new DocumentStorageException("File deletion attempt outside of storage directory");
            }
            
            Files.deleteIfExists(file);
        } catch (IOException e) {
            throw new DocumentStorageException("Could not delete file: " + filename, e);
        }
    }

    public void delete(String fileName) {
        deleteFile(fileName);
    }

    // This method should be removed as it's unsafe
    public void deleteFilePath(String filePath) {
        // Replace with safe implementation that only accepts filenames, not paths
        if (filePath == null || filePath.isEmpty()) {
            return;
        }
        // Extract just the filename and delete that
        Path path = Paths.get(filePath);
        String filename = path.getFileName().toString();
        deleteFile(filename);
    }

    private void validateFile(MultipartFile file) {
        if (file == null) {
            throw new DocumentStorageException("Cannot store null file");
        }
        
        if (file.isEmpty()) {
            throw new DocumentStorageException("Failed to store empty file");
        }
        
        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
        if (originalFilename.contains("..") || originalFilename.contains("/") || originalFilename.contains("\\")) {
            throw new DocumentStorageException("Invalid filename: " + originalFilename);
        }
        
        String extension = getFileExtension(originalFilename);
        if (!allowedFileExtensions.contains(extension.toLowerCase())) {
            throw new DocumentStorageException("File type not allowed. Allowed types: " + String.join(", ", allowedFileExtensions));
        }
        
        // Check file size 
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new DocumentStorageException("File size exceeds maximum limit (10MB)");
        }
    }

    private String getFileExtension(String filename) {
        int dotIndex = filename.lastIndexOf('.');
        if (dotIndex < 0) {
            return "";
        }
        return filename.substring(dotIndex + 1).toLowerCase();
    }
    
    private String sanitizeFilename(String filename) {
        // Remove control characters and typical filesystem special characters
        return filename.replaceAll("[\\\\/:*?\"<>|]", "_")
                      .replaceAll("\\s+", "_");
    }
}