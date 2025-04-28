package com.uchk.university.service;

import com.uchk.university.dto.LoginRequest;
import com.uchk.university.dto.LoginResponse;
import com.uchk.university.entity.User;
import com.uchk.university.repository.UserRepository;
import com.uchk.university.security.JwtTokenUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {
    private final AuthenticationManager authenticationManager;
    private final JwtTokenUtil jwtTokenUtil;
    private final UserRepository userRepository;

    public LoginResponse login(LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword())
            );

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String token = jwtTokenUtil.generateToken(userDetails);
            
            User user = userRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            return new LoginResponse(token, user.getUsername(), user.getEmail(), user.getRole());
        } catch (BadCredentialsException e) {
            // Log the specific authentication error
            log.error("Authentication failed: Bad credentials for user {}", loginRequest.getUsername());
            throw e;
        } catch (Exception e) {
            // Log any other errors
            log.error("Login error: {}", e.getMessage());
            throw e;
        }
    }
}