package com.uchk.university.controller;

import com.uchk.university.dto.LoginRequest;
import com.uchk.university.dto.LoginResponse;
import com.uchk.university.dto.UserDto;
import com.uchk.university.entity.User;
import com.uchk.university.security.CurrentUser;
import com.uchk.university.service.AuthService;
import com.uchk.university.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;
    private final UserService userService;
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        return ResponseEntity.ok(authService.login(loginRequest));
    }

    @PostMapping("/register")
    public ResponseEntity<User> register(@Valid @RequestBody UserDto userDto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.createUser(userDto));
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
            
            // Populate response with user details
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
}