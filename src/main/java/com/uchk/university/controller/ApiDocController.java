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
        paths.add(new ApiPath("GET", "/api/auth/validate", "Validate JWT token", "Public"));
        
        // User endpoints
        paths.add(new ApiPath("GET", "/api/users/{id}", "Get user by ID", "ADMIN or Self"));
        paths.add(new ApiPath("GET", "/api/users/username/{username}", "Get user by username", "ADMIN or Self"));
        paths.add(new ApiPath("GET", "/api/users", "Get all users", "ADMIN"));
        paths.add(new ApiPath("GET", "/api/users/role/{role}", "Get users by role", "ADMIN"));
        paths.add(new ApiPath("POST", "/api/users", "Create a new user", "ADMIN"));
        paths.add(new ApiPath("PUT", "/api/users/{id}", "Update user", "ADMIN or Self"));
        paths.add(new ApiPath("DELETE", "/api/users/{id}", "Delete user", "ADMIN"));
        
        // Student endpoints
        paths.add(new ApiPath("GET", "/api/students/{id}", "Get student by ID", "Any"));
        paths.add(new ApiPath("GET", "/api/students/studentId/{studentId}", "Get student by student ID", "Any"));
        paths.add(new ApiPath("GET", "/api/students", "Get all students", "ADMIN, TEACHER, FORMATION_MANAGER"));
        paths.add(new ApiPath("GET", "/api/students/formation/{formationId}", "Get students by formation", "Any"));
        paths.add(new ApiPath("GET", "/api/students/promo/{promo}", "Get students by promotion", "Any"));
        paths.add(new ApiPath("POST", "/api/students", "Create a new student", "ADMIN"));
        paths.add(new ApiPath("PUT", "/api/students/{id}", "Update student", "ADMIN"));
        paths.add(new ApiPath("DELETE", "/api/students/{id}", "Delete student", "ADMIN"));
        
        // Formation endpoints
        paths.add(new ApiPath("GET", "/api/formations/{id}", "Get formation by ID", "Any"));
        paths.add(new ApiPath("GET", "/api/formations", "Get all formations", "Any"));
        paths.add(new ApiPath("GET", "/api/formations/type/{type}", "Get formations by type", "Any"));
        paths.add(new ApiPath("GET", "/api/formations/level/{level}", "Get formations by level", "Any"));
        paths.add(new ApiPath("POST", "/api/formations", "Create a new formation", "ADMIN, FORMATION_MANAGER"));
        paths.add(new ApiPath("PUT", "/api/formations/{id}", "Update formation", "ADMIN, FORMATION_MANAGER"));
        paths.add(new ApiPath("DELETE", "/api/formations/{id}", "Delete formation", "ADMIN"));
        
        // Document endpoints
        paths.add(new ApiPath("GET", "/api/documents/{id}", "Get document by ID", "Any"));
        paths.add(new ApiPath("GET", "/api/documents", "Get all documents", "Any"));
        paths.add(new ApiPath("GET", "/api/documents/type/{type}", "Get documents by type", "Any"));
        paths.add(new ApiPath("GET", "/api/documents/creator/{userId}", "Get documents by creator", "Any"));
        paths.add(new ApiPath("GET", "/api/documents/visibility/{level}", "Get documents by visibility level", "Any"));
        paths.add(new ApiPath("POST", "/api/documents", "Create a new document", "Authenticated"));
        paths.add(new ApiPath("PUT", "/api/documents/{id}", "Update document", "ADMIN or Creator"));
        paths.add(new ApiPath("DELETE", "/api/documents/{id}", "Delete document", "ADMIN or Creator"));
        paths.add(new ApiPath("GET", "/api/documents/files/{filename}", "Get document file", "Any"));
        
        // Staff endpoints
        paths.add(new ApiPath("GET", "/api/staff/{id}", "Get staff by ID", "ADMIN or Self"));
        paths.add(new ApiPath("GET", "/api/staff/staffId/{staffId}", "Get staff by staff ID", "ADMIN"));
        paths.add(new ApiPath("GET", "/api/staff", "Get all staff", "ADMIN"));
        paths.add(new ApiPath("GET", "/api/staff/department/{department}", "Get staff by department", "ADMIN, FORMATION_MANAGER"));
        paths.add(new ApiPath("GET", "/api/staff/position/{position}", "Get staff by position", "ADMIN, FORMATION_MANAGER"));
        paths.add(new ApiPath("POST", "/api/staff", "Create a new staff member", "ADMIN"));
        paths.add(new ApiPath("PUT", "/api/staff/{id}", "Update staff", "ADMIN or Self"));
        paths.add(new ApiPath("DELETE", "/api/staff/{id}", "Delete staff", "ADMIN"));
        
        return ResponseEntity.ok(paths);
    }
}