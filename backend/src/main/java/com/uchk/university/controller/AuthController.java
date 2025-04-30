package com.uchk.university.controller;

import com.uchk.university.dto.LoginRequest;
import com.uchk.university.dto.LoginResponse;
import com.uchk.university.dto.UserDto;
import com.uchk.university.entity.User;
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
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;
    private final UserService userService;
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    
    // More robust rate limiting implementation
    private final ConcurrentHashMap<String, LoginAttempt> loginAttempts = new ConcurrentHashMap<>();
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
    
    // Constants for rate limiting
    private static final int MAX_ATTEMPTS = 5;
    private static final int LOCKOUT_MINUTES = 15;
    private static final int CLEANUP_INTERVAL_MINUTES = 60;
    
    // Enhanced LoginAttempt with more secure lockout mechanism
    private static class LoginAttempt {
        private int count;
        private LocalDateTime lastAttempt;
        private boolean locked;
        private LocalDateTime lockedUntil;
        
        public LoginAttempt() {
            this.count = 1;
            this.lastAttempt = LocalDateTime.now();
            this.locked = false;
        }
        
        public void increment() {
            this.count++;
            this.lastAttempt = LocalDateTime.now();
            
            // If threshold exceeded, lock the account
            if (count >= MAX_ATTEMPTS && !locked) {
                this.locked = true;
                this.lockedUntil = LocalDateTime.now().plusMinutes(LOCKOUT_MINUTES);
            }
        }
        
        public boolean isLocked() {
            // If locked but lock period expired, unlock
            if (locked && LocalDateTime.now().isAfter(lockedUntil)) {
                locked = false;
                count = 0;
                return false;
            }
            return locked;
        }
        
        public void reset() {
            this.count = 0;
            this.lastAttempt = LocalDateTime.now();
            this.locked = false;
            this.lockedUntil = null;
        }
        
        public boolean shouldCleanup() {
            // Clean up records older than twice the lockout period
            return !locked && lastAttempt.plusMinutes(LOCKOUT_MINUTES * 2).isBefore(LocalDateTime.now());
        }
    }
    
    // Cleanup expired login attempts
    private void cleanupExpiredAttempts() {
        loginAttempts.entrySet().removeIf(entry -> entry.getValue().shouldCleanup());
    }
    
    // Get client IP with X-Forwarded-For header support
    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            // Get the first IP which is the client's IP
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    // Schedule periodic cleanup of old login attempts
    {
        scheduler.scheduleAtFixedRate(this::cleanupExpiredAttempts, 
                                     CLEANUP_INTERVAL_MINUTES, 
                                     CLEANUP_INTERVAL_MINUTES, 
                                     TimeUnit.MINUTES);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @Valid @RequestBody LoginRequest loginRequest,
            HttpServletRequest request) {
        
        // Get client IP for rate limiting with proxy support
        String clientIp = getClientIp(request);
        String usernameHash = String.valueOf(loginRequest.getUsername().hashCode());
        // Use composite key of IP + username hash to prevent username enumeration while limiting by username
        String rateLimitKey = clientIp + ":" + usernameHash;
        
        // Check for rate limiting
        if (loginAttempts.containsKey(rateLimitKey) && loginAttempts.get(rateLimitKey).isLocked()) {
            LoginAttempt attempt = loginAttempts.get(rateLimitKey);
            
            Map<String, String> response = new HashMap<>();
            response.put("error", "too_many_attempts");
            response.put("message", "Too many login attempts. Please try again later.");
            
            // Don't log the actual username to prevent log-based username enumeration
            logger.warn("Blocked login attempt due to rate limiting. IP: {}", clientIp);
            
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(response);
        }
        
        try {
            LoginResponse loginResponse = authService.login(loginRequest);
            
            // On successful login, reset attempts
            loginAttempts.computeIfPresent(rateLimitKey, (k, v) -> {
                v.reset();
                return v;
            });
            
            return ResponseEntity.ok(loginResponse);
        } catch (Exception e) {
            // On failed login, increment attempts
            loginAttempts.compute(rateLimitKey, (k, v) -> {
                if (v == null) {
                    return new LoginAttempt();
                } else {
                    v.increment();
                    return v;
                }
            });
            
            // Log failure but don't reveal if username exists or not
            logger.warn("Failed login attempt from IP: {}", clientIp);
            
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
            
            logger.debug("Token validated successfully for user: {}", username);
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