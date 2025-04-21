package com.uchk.university.controller;

import com.uchk.university.dto.LoginRequest;
import com.uchk.university.dto.LoginResponse;
import com.uchk.university.dto.UserDto;
import com.uchk.university.entity.User;
import com.uchk.university.service.AuthService;
import com.uchk.university.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;
    private final UserService userService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        return ResponseEntity.ok(authService.login(loginRequest));
    }

    @PostMapping("/register")
    public ResponseEntity<User> register(@Valid @RequestBody UserDto userDto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.createUser(userDto));
    }

    @GetMapping("/validate")
    public ResponseEntity<String> validateToken() {
        // This endpoint can be used to validate if a token is still valid
        // The JwtAuthenticationFilter will handle the validation
        return ResponseEntity.ok("Token is valid");
    }
}