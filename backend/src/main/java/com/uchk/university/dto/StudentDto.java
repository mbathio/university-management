package com.uchk.university.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.*;
import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentDto {
    
    @NotEmpty(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    private String username;
    
    @NotEmpty(message = "Password is required")
    @Size(min = 6, max = 100, message = "Password must be between 6 and 100 characters")
    private String password;
    
    @NotEmpty(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;
    
    @NotEmpty(message = "Student ID is required")
    @Pattern(regexp = "^[a-zA-Z0-9]+$", message = "Student ID should be alphanumeric")
    private String studentId;
    
    @NotEmpty(message = "First name is required")
    @Size(min = 2, max = 50, message = "First name must be between 2 and 50 characters")
    private String firstName;
    
    @NotEmpty(message = "Last name is required")
    @Size(min = 2, max = 50, message = "Last name must be between 2 and 50 characters")
    private String lastName;
    
    @PastOrPresent(message = "Birth date must be in the past or present")
    private Date birthDate;
    
    @Positive(message = "Formation ID must be a positive number")
    private Long formationId;
    
    @Size(max = 10, message = "Promo must be less than 10 characters")
    private String promo;
    
    @Min(value = 1900, message = "Start year must be after 1900")
    @Max(value = 2100, message = "Start year must be before 2100")
    private Integer startYear;
    
    @Min(value = 1900, message = "End year must be after 1900")
    @Max(value = 2100, message = "End year must be before 2100")
    private Integer endYear;

    // Explicitly add getter methods for service layer
    public String getUsername() { return username; }
    public String getPassword() { return password; }
    public String getEmail() { return email; }
    public String getStudentId() { return studentId; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public Date getBirthDate() { return birthDate; }
    public Long getFormationId() { return formationId; }
    public String getPromo() { return promo; }
    public Integer getStartYear() { return startYear; }
    public Integer getEndYear() { return endYear; }
}