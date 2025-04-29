package com.uchk.university.controller;

import com.uchk.university.dto.ApiPath;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

/**
 * Controller to provide basic API documentation
 * Only shares information about public endpoints and basic functionality
 * Sensitive endpoints should be documented elsewhere for authorized personnel
 */
@RestController
@RequestMapping("/api/public/docs")
public class ApiDocController {

    @GetMapping
    public ResponseEntity<List<ApiPath>> getApiPaths() {
        List<ApiPath> paths = new ArrayList<>();
        
        // Auth endpoints
        paths.add(new ApiPath("POST", "/api/auth/login", "Login with username and password", "Public"));
        paths.add(new ApiPath("POST", "/api/auth/register", "Register a new user", "Public"));
        paths.add(new ApiPath("GET", "/api/auth/validate", "Validate JWT token", "Authenticated"));
        
        // Formation endpoints - only public ones
        paths.add(new ApiPath("GET", "/api/formations/{id}", "Get formation by ID", "Public"));
        paths.add(new ApiPath("GET", "/api/formations", "Get all formations", "Public"));
        paths.add(new ApiPath("GET", "/api/formations/type/{type}", "Get formations by type", "Public"));
        paths.add(new ApiPath("GET", "/api/formations/level/{level}", "Get formations by level", "Public"));
        
        // Document endpoints - only document discovery, not downloads
        paths.add(new ApiPath("GET", "/api/documents/{id}", "Get document metadata by ID", "Authenticated"));
        paths.add(new ApiPath("GET", "/api/documents", "Get all document metadata", "Authenticated"));
        paths.add(new ApiPath("GET", "/api/documents/type/{type}", "Get document metadata by type", "Authenticated"));
        
        // Student endpoints - minimal info for public API docs
        paths.add(new ApiPath("GET", "/api/students/formation/{formationId}", "Get students by formation", "Authenticated"));
        
        // Public API resources
        paths.add(new ApiPath("GET", "/api/public/news", "Get public news and announcements", "Public"));
        paths.add(new ApiPath("GET", "/api/public/events", "Get public events", "Public"));
        paths.add(new ApiPath("GET", "/api/public/contacts", "Get public contact information", "Public"));
        
        return ResponseEntity.ok(paths);
    }
}