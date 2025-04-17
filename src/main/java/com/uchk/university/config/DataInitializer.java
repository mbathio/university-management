package com.uchk.university.config;

import com.uchk.university.dto.UserDto;
import com.uchk.university.entity.Role;
import com.uchk.university.service.DocumentService;
import com.uchk.university.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Configuration
@RequiredArgsConstructor
public class DataInitializer {
    
    private final UserService userService;
    private final DocumentService documentService;
    
    @Bean
    @Profile("dev")
    public CommandLineRunner initData() {
        return args -> {
            // Initialize document storage
            documentService.init();
            
            // Create admin user if it doesn't exist
            if (!userExists("admin")) {
                UserDto adminDto = new UserDto(
                        "admin",
                        "admin123",
                        "admin@uchk.edu",
                        Role.ADMIN
                );
                userService.createUser(adminDto);
                System.out.println("Admin user created successfully");
            }
            
            // Create test users for different roles if they don't exist
            if (!userExists("teacher")) {
                UserDto teacherDto = new UserDto(
                        "teacher",
                        "teacher123",
                        "teacher@uchk.edu",
                        Role.TEACHER
                );
                userService.createUser(teacherDto);
                System.out.println("Teacher user created successfully");
            }
            
            if (!userExists("student")) {
                UserDto studentDto = new UserDto(
                        "student",
                        "student123",
                        "student@uchk.edu",
                        Role.STUDENT
                );
                userService.createUser(studentDto);
                System.out.println("Student user created successfully");
            }
            
            if (!userExists("manager")) {
                UserDto managerDto = new UserDto(
                        "manager",
                        "manager123",
                        "manager@uchk.edu",
                        Role.FORMATION_MANAGER
                );
                userService.createUser(managerDto);
                System.out.println("Formation Manager user created successfully");
            }
        };
    }
    
    private boolean userExists(String username) {
        try {
            userService.getUserByUsername(username);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}