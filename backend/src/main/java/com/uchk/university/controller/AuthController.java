package com.uchk.university.controller;

import com.uchk.university.dto.LoginRequest;
import com.uchk.university.dto.LoginResponse;
import com.uchk.university.dto.UserDto;
import com.uchk.university.entity.User;
import com.uchk.university.security.CurrentUser;
import com.uchk.university.service.AuthService;
import com.uchk.university.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;
    private final UserService userService;
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    
    // Implement login attempt rate limiting
    private final Map<String, LoginAttempt> loginAttempts = new HashMap<>();
    
    // Static class to track login attempts
    private static class LoginAttempt {
        private int count;
        private LocalDateTime lastAttempt;
        
        public LoginAttempt() {
            this.count = 1;
            this.lastAttempt = LocalDateTime.now();
        }
        
        public void increment() {
            this.count++;
            this.lastAttempt = LocalDateTime.now();
        }
        
        public boolean isLocked() {
            // Lock after 5 failed attempts for 15 minutes
            return count >= 5 && lastAttempt.plusMinutes(15).isAfter(LocalDateTime.now());
        }
        
        public void reset() {
            this.count = 0;
            this.lastAttempt = LocalDateTime.now();
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @Valid @RequestBody LoginRequest loginRequest,
            HttpServletRequest request) {
        
        // Get client IP for rate limiting (consider using a proxy-aware method in production)
        String clientIp = request.getRemoteAddr();
        
        // Check for rate limiting
        if (loginAttempts.containsKey(clientIp) && loginAttempts.get(clientIp).isLocked()) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "too_many_attempts");
            response.put("message", "Too many login attempts. Please try again later.");
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(response);
        }
        
        try {
            LoginResponse loginResponse = authService.login(loginRequest);
            
            // On successful login, reset attempts
            loginAttempts.remove(clientIp);
            
            return ResponseEntity.ok(loginResponse);
        } catch (Exception e) {
            // On failed login, increment attempts
            loginAttempts.computeIfAbsent(clientIp, k -> new LoginAttempt());
            loginAttempts.get(clientIp).increment();
            
            logger.warn("Failed login attempt for user: {}, IP: {}", loginRequest.getUsername(), clientIp);
            
            // Return 401 for authentication failure
            Map<String, String> response = new HashMap<>();
            response.put("error", "invalid_credentials");
            response.put("message", "Invalid username or password");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody UserDto userDto) {
        // Validate that username doesn't already exist
        if (userService.existsByUsername(userDto.getUsername())) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "username_exists");
            response.put("message", "Username already exists");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        }
        
        // Validate that email doesn't already exist
        if (userService.existsByEmail(userDto.getEmail())) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "email_exists");
            response.put("message", "Email already exists");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        }
        
        try {
            User user = userService.createUser(userDto);
            
            // Don't return the full user object for security
            Map<String, Object> response = new HashMap<>();
            response.put("id", user.getId());
            response.put("username", user.getUsername());
            response.put("message", "User registered successfully");
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "registration_failed");
            response.put("message", "Registration failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    @GetMapping("/validate")
    public ResponseEntity<Map<String, Object>> validateToken() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication == null || !authentication.isAuthenticated() || 
                "anonymousUser".equals(authentication.getPrincipal())) {
                logger.warn("No valid authentication found");
                response.put("valid", false);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
            
            // Try to find the user
            String username = authentication.getName();
            User user = userService.getUserByUsername(username);
            
            // Verify user is active
            if (!user.isActive()) {
                response.put("valid", false);
                response.put("message", "User account is inactive");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }
            
            // Populate response with minimal user details
            response.put("valid", true);
            response.put("username", user.getUsername());
            response.put("role", user.getRole());
            
            logger.info("Token validated successfully for user: {}", username);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Token validation error: {}", e.getMessage());
            response.put("valid", false);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }
    
    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Logged out successfully");
        
        // JWT is stateless, so we don't need to do anything server-side
        // Client should remove the token
        
        return ResponseEntity.ok(response);
    }
}