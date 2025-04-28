package com.uchk.university.config;

import com.uchk.university.entity.Role;
import com.uchk.university.entity.User;
import com.uchk.university.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;

@Configuration
@RequiredArgsConstructor
public class DatabaseInitializer {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @PostConstruct
    public void initialize() {
        // Check if admin user exists
        if (userRepository.findByUsername("admin").isEmpty()) {
            // Create admin user
            User adminUser = new User();
            adminUser.setUsername("admin");
            adminUser.setPassword(passwordEncoder.encode("admin123")); // Encode the password
            adminUser.setEmail("admin@uchk.edu");
            adminUser.setRole(Role.ADMIN);
            adminUser.setActive(true);
            adminUser.setCreatedAt(LocalDateTime.now());
            adminUser.setUpdatedAt(LocalDateTime.now());
            
            userRepository.save(adminUser);
            
            System.out.println("Admin user created successfully!");
        }
    }
}