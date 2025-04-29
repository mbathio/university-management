package com.uchk.university.service;

import com.uchk.university.exception.DocumentStorageException;
import org.apache.tika.Tika;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class FileStorageService {
    private static final Logger logger = LoggerFactory.getLogger(FileStorageService.class);
    
    @Value("${upload.root-location:uploads}")
    private String uploadRootLocation;
    private final Path rootLocation;
    
    // Whitelist of allowed file extensions and their corresponding MIME types
    private final Map<String, List<String>> allowedFileTypesMap = new HashMap<>();
    
    // Maximum file size in bytes (10MB)
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024;
    
    // Apache Tika for MIME type detection
    private final Tika tika = new Tika();
    
    public FileStorageService(@Value("${upload.root-location:uploads}") String uploadRootLocation) {
        this.rootLocation = Paths.get(uploadRootLocation).toAbsolutePath().normalize();
        this.uploadRootLocation = uploadRootLocation;
        
        // Initialize allowed file types map with MIME types
        allowedFileTypesMap.put("pdf", Arrays.asList("application/pdf"));
        allowedFileTypesMap.put("doc", Arrays.asList("application/msword"));
        allowedFileTypesMap.put("docx", Arrays.asList("application/vnd.openxmlformats-officedocument.wordprocessingml.document"));
        allowedFileTypesMap.put("xls", Arrays.asList("application/vnd.ms-excel"));
        allowedFileTypesMap.put("xlsx", Arrays.asList("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        allowedFileTypesMap.put("ppt", Arrays.asList("application/vnd.ms-powerpoint"));
        allowedFileTypesMap.put("pptx", Arrays.asList("application/vnd.openxmlformats-officedocument.presentationml.presentation"));
        allowedFileTypesMap.put("txt", Arrays.asList("text/plain"));
        allowedFileTypesMap.put("zip", Arrays.asList("application/zip", "application/x-zip-compressed"));
        allowedFileTypesMap.put("jpg", Arrays.asList("image/jpeg"));
        allowedFileTypesMap.put("jpeg", Arrays.asList("image/jpeg"));
        allowedFileTypesMap.put("png", Arrays.asList("image/png"));
        allowedFileTypesMap.put("gif", Arrays.asList("image/gif"));
    }

    public void init() {
        try {
            if (!Files.exists(rootLocation)) {
                Files.createDirectories(rootLocation);
                logger.info("Created upload directory at {}", rootLocation);
            }
            
            // Set restrictive permissions on the upload directory
            try {
                Files.setPosixFilePermissions(rootLocation, 
                    java.nio.file.attribute.PosixFilePermissions.fromString("rwx------"));
                logger.debug("Set POSIX permissions on upload directory");
            } catch (UnsupportedOperationException e) {
                // If not on POSIX system, try to make directory non-readable by others
                boolean success = rootLocation.toFile().setReadable(false, false) &&
                                 rootLocation.toFile().setReadable(true, true) &&
                                 rootLocation.toFile().setWritable(false, false) &&
                                 rootLocation.toFile().setWritable(true, true) &&
                                 rootLocation.toFile().setExecutable(false, false) &&
                                 rootLocation.toFile().setExecutable(true, true);
                
                logger.debug("Set file permissions on upload directory: {}", success);
            }
        } catch (IOException e) {
            logger.error("Could not initialize storage location", e);
            throw new DocumentStorageException("Could not initialize storage location", e);
        }
    }

    public String store(MultipartFile file) {
        validateFile(file);
        
        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
        String sanitizedFilename = sanitizeFilename(originalFilename);
        String extension = getFileExtension(sanitizedFilename);
        
        // Generate a UUID-based filename with a folder structure to prevent too many files in one directory
        String uuid = UUID.randomUUID().toString();
        String folderPrefix = uuid.substring(0, 2); // Use first 2 chars as folder
        String filename = uuid + "." + extension;
        
        try {
            if (!Files.exists(rootLocation)) {
                init();
            }
            
            // Create subfolder if needed
            Path subFolder = rootLocation.resolve(folderPrefix).normalize();
            if (!Files.exists(subFolder)) {
                Files.createDirectories(subFolder);
                
                // Set directory permissions
                try {
                    Files.setPosixFilePermissions(subFolder, 
                        java.nio.file.attribute.PosixFilePermissions.fromString("rwx------"));
                } catch (UnsupportedOperationException e) {
                    // Non-POSIX fallback
                    subFolder.toFile().setReadable(false, false);
                    subFolder.toFile().setReadable(true, true);
                    subFolder.toFile().setWritable(false, false);
                    subFolder.toFile().setWritable(true, true);
                    subFolder.toFile().setExecutable(false, false);
                    subFolder.toFile().setExecutable(true, true);
                }
            }
            
            Path destinationFile = subFolder.resolve(filename).normalize();
            
            // Double-check that the destination file is within the valid directory structure
            if (!destinationFile.toAbsolutePath().startsWith(rootLocation.toAbsolutePath())) {
                logger.error("Security violation: Attempted to write file outside upload directory");
                throw new DocumentStorageException("Cannot store file outside designated upload directory");
            }
            
            // Verify content type again with the actual file content
            try (InputStream is = file.getInputStream()) {
                verifyFileContent(is, extension);
            }
            
            // Use StandardCopyOption.REPLACE_EXISTING to handle potential file conflicts
            Files.copy(file.getInputStream(), destinationFile, StandardCopyOption.REPLACE_EXISTING);
            logger.info("Successfully stored file: {}", destinationFile);
            
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
            
            // Store the relative path with the folder structure
            return folderPrefix + "/" + filename;
        } catch (IOException e) {
            logger.error("Failed to store file {}", filename, e);
            throw new DocumentStorageException("Failed to store file " + filename, e);
        }
    }
    
    private void verifyFileContent(InputStream inputStream, String claimedExtension) {
        try {
            // Detect actual MIME type
            String detectedMimeType = tika.detect(inputStream);
            
            // Get expected MIME types for the claimed extension
            List<String> expectedMimeTypes = allowedFileTypesMap.get(claimedExtension.toLowerCase());
            
            if (expectedMimeTypes == null || !expectedMimeTypes.contains(detectedMimeType)) {
                logger.warn("MIME type mismatch: claimed extension '{}', detected MIME '{}'", 
                          claimedExtension, detectedMimeType);
                throw new DocumentStorageException("File content does not match the claimed file type");
            }
        } catch (IOException e) {
            logger.error("Error verifying file content", e);
            throw new DocumentStorageException("Could not verify file content", e);
        }
    }

    public Resource loadAsResource(String filename) {
        try {
            // Security: Prevent any path traversal attempts
            if (filename == null || filename.isEmpty() || filename.contains("..")) {
                logger.warn("Blocked access attempt with suspicious filename: {}", filename);
                throw new DocumentStorageException("Invalid filename: " + filename);
            }
            
            // Handle the new folder structure
            Path file;
            if (filename.contains("/")) {
                // Assume the format is "prefix/uuid.ext"
                file = rootLocation.resolve(filename).normalize();
            } else {
                // For backward compatibility, assume it's just a filename
                file = rootLocation.resolve(filename).normalize();
            }
            
            // Extra security: ensure we don't leave the root location
            if (!file.toAbsolutePath().startsWith(rootLocation.toAbsolutePath())) {
                logger.warn("Blocked file access attempt outside storage directory");
                throw new DocumentStorageException("File access attempt outside of storage directory");
            }
            
            Resource resource = new UrlResource(file.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                logger.warn("File not found or not readable: {}", filename);
                throw new DocumentStorageException("Could not read file: " + filename);
            }
        } catch (MalformedURLException e) {
            logger.error("Could not read file: {}", filename, e);
            throw new DocumentStorageException("Could not read file: " + filename, e);
        }
    }

    public void deleteFile(String filename) {
        try {
            // Security: Prevent any path traversal attempts
            if (filename == null || filename.isEmpty() || filename.contains("..")) {
                logger.warn("Blocked deletion attempt with suspicious filename: {}", filename);
                throw new DocumentStorageException("Invalid filename: " + filename);
            }
            
            // Handle the new folder structure
            Path file;
            if (filename.contains("/")) {
                // Assume the format is "prefix/uuid.ext"
                file = rootLocation.resolve(filename).normalize();
            } else {
                // For backward compatibility
                file = rootLocation.resolve(filename).normalize();
            }
            
            // Extra security: ensure we don't leave the root location
            if (!file.toAbsolutePath().startsWith(rootLocation.toAbsolutePath())) {
                logger.warn("Blocked file deletion attempt outside storage directory");
                throw new DocumentStorageException("File deletion attempt outside of storage directory");
            }
            
            Files.deleteIfExists(file);
            logger.debug("Successfully deleted file: {}", filename);
        } catch (IOException e) {
            logger.error("Could not delete file: {}", filename, e);
            throw new DocumentStorageException("Could not delete file: " + filename, e);
        }
    }

    public void delete(String fileName) {
        deleteFile(fileName);
    }

    // Remove the unsafe method
    // public void deleteFilePath(String filePath) has been removed

    private void validateFile(MultipartFile file) {
        if (file == null) {
            throw new DocumentStorageException("Cannot store null file");
        }
        
        if (file.isEmpty()) {
            throw new DocumentStorageException("Failed to store empty file");
        }
        
        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
        if (originalFilename.contains("..") || originalFilename.contains("/") || originalFilename.contains("\\")) {
            logger.warn("Blocked upload with suspicious filename: {}", originalFilename);
            throw new DocumentStorageException("Invalid filename: " + originalFilename);
        }
        
        String extension = getFileExtension(originalFilename);
        if (!allowedFileTypesMap.containsKey(extension.toLowerCase())) {
            logger.warn("Blocked upload with disallowed extension: {}", extension);
            throw new DocumentStorageException("File type not allowed. Allowed types: " + 
                                     String.join(", ", allowedFileTypesMap.keySet()));
        }
        
        // Check content type
        String contentType = file.getContentType();
        List<String> expectedMimeTypes = allowedFileTypesMap.get(extension.toLowerCase());
        if (contentType == null || !expectedMimeTypes.contains(contentType)) {
            logger.warn("Content type mismatch: claimed '{}', provided '{}'", extension, contentType);
            throw new DocumentStorageException("File content type doesn't match extension");
        }
        
        // Check file size 
        if (file.getSize() > MAX_FILE_SIZE) {
            logger.warn("Blocked upload exceeding size limit: {} bytes", file.getSize());
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