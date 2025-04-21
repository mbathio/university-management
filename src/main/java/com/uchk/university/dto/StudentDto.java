package com.uchk.university.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentDto {
    
    @NotEmpty(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    private String username;
    
    @NotEmpty(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;
    
    @NotEmpty(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;
    
    @NotEmpty(message = "Student ID is required")
    @Pattern(regexp = "^[a-zA-Z0-9]+$", message = "Student ID should be alphanumeric")
    private String studentId;
    
    @NotEmpty(message = "First name is required")
    private String firstName;
    
    @NotEmpty(message = "Last name is required")
    private String lastName;
    
    private Date birthDate;
    
    private Long formationId;
    
    private String promo;
    
    private Integer startYear;
    
    private Integer endYear;
}