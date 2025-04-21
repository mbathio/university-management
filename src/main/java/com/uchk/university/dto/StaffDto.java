package com.uchk.university.dto;

import com.uchk.university.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StaffDto {
    
    @NotEmpty(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    private String username;
    
    @NotEmpty(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;
    
    @NotEmpty(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;
    
    @NotEmpty(message = "Staff ID is required")
    @Pattern(regexp = "^[a-zA-Z0-9]+$", message = "Staff ID should be alphanumeric")
    private String staffId;
    
    @NotEmpty(message = "First name is required")
    private String firstName;
    
    @NotEmpty(message = "Last name is required")
    private String lastName;
    
    @NotNull(message = "Role is required")
    private Role role;
    
    private String position;
    private String department;
    private String contactInfo;
}