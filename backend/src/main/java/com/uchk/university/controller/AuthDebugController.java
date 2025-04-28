package com.uchk.university.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.uchk.university.dto.LoginRequest;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthDebugController {

    @PostMapping("/debug")
    public ResponseEntity<String> debugAuth(@RequestBody LoginRequest loginRequest) {
        log.info("Debug auth request for username: {}", loginRequest.getUsername());
        
        // This is just for debugging - don't include in production
        return ResponseEntity.ok("Auth debug: Username: " + loginRequest.getUsername() + 
                                ", Password length: " + (loginRequest.getPassword() != null ? 
                                loginRequest.getPassword().length() : 0));
    }
}