package com.uchk.university.config;

import com.uchk.university.dto.UserDto;
import com.uchk.university.entity.Role;
import com.uchk.university.service.DocumentService;
import com.uchk.university.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataInitializer {
    
    private final UserService userService;
    private final DocumentService documentService;
    
    @Value("${ADMIN_PASSWORD:admin123}")
    private String adminPassword;

    
    @Value("${TEACHER_PASSWORD:teacher123}")
    private String teacherPassword;
    
    @Value("${STUDENT_PASSWORD:student123}")
    private String studentPassword;
    
    @Value("${MANAGER_PASSWORD:manager123}")
    private String managerPassword;
    
    @Bean
    @Profile("dev")
    public CommandLineRunner initData() {
        return args -> {
            log.info("Initializing development data...");
            
            // Initialize document storage
            documentService.init();
            log.info("Document storage initialized");
            
            // Create admin user if it doesn't exist
            if (!userExists("admin")) {
                UserDto adminDto = new UserDto(
                        "admin",
                        adminPassword,
                        "admin@uchk.edu",
                        Role.ADMIN
                );
                userService.createUser(adminDto);
                log.info("Admin user created successfully");
            }
            
            // Create test users for different roles if they don't exist
            if (!userExists("teacher")) {
                UserDto teacherDto = new UserDto(
                        "teacher",
                        teacherPassword,
                        "teacher@uchk.edu",
                        Role.TEACHER
                );
                userService.createUser(teacherDto);
                log.info("Teacher user created successfully");
            }
            
            if (!userExists("student")) {
                UserDto studentDto = new UserDto(
                        "student",
                        studentPassword,
                        "student@uchk.edu",
                        Role.STUDENT
                );
                userService.createUser(studentDto);
                log.info("Student user created successfully");
            }
            
            if (!userExists("manager")) {
                UserDto managerDto = new UserDto(
                        "manager",
                        managerPassword,
                        "manager@uchk.edu",
                        Role.FORMATION_MANAGER
                );
                userService.createUser(managerDto);
                log.info("Formation Manager user created successfully");
            }
            
            log.info("Development data initialization completed");
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