package com.uchk.university.dto;

import java.util.Date;

public class StudentDto {
    private String studentId;
    private String firstName;
    private String lastName;
    private Date birthDate;
    private Long formationId;
    private String promo;
    private Integer startYear;
    private Integer endYear;
    private String username;
    private String password;
    private String email;
    
    // Getters
    public String getStudentId() {
        return studentId;
    }
    
    public String getFirstName() {
        return firstName;
    }
    
    public String getLastName() {
        return lastName;
    }
    
    public Date getBirthDate() {
        return birthDate;
    }
    
    public Long getFormationId() {
        return formationId;
    }
    
    public String getPromo() {
        return promo;
    }
    
    public Integer getStartYear() {
        return startYear;
    }
    
    public Integer getEndYear() {
        return endYear;
    }
    
    public String getUsername() {
        return username;
    }
    
    public String getPassword() {
        return password;
    }
    
    public String getEmail() {
        return email;
    }
    
    // Setters
    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }
    
    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }
    
    public void setLastName(String lastName) {
        this.lastName = lastName;
    }
    
    public void setBirthDate(Date birthDate) {
        this.birthDate = birthDate;
    }
    
    public void setFormationId(Long formationId) {
        this.formationId = formationId;
    }
    
    public void setPromo(String promo) {
        this.promo = promo;
    }
    
    public void setStartYear(Integer startYear) {
        this.startYear = startYear;
    }
    
    public void setEndYear(Integer endYear) {
        this.endYear = endYear;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public void setPassword(String password) {
        this.password = password;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
}