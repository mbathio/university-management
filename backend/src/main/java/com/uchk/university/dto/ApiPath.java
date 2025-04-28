package com.uchk.university.dto;

public class ApiPath {
    private String method;
    private String path;
    private String description;
    private String accessLevel;
    
    // Default constructor needed by Maven
    public ApiPath() {
    }
    
    // Constructor with 4 parameters that's used in ApiDocController
    public ApiPath(String method, String path, String description, String accessLevel) {
        this.method = method;
        this.path = path;
        this.description = description;
        this.accessLevel = accessLevel;
    }
    
    // Getters and setters
    public String getMethod() {
        return method;
    }
    
    public void setMethod(String method) {
        this.method = method;
    }
    
    public String getPath() {
        return path;
    }
    
    public void setPath(String path) {
        this.path = path;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getAccessLevel() {
        return accessLevel;
    }
    
    public void setAccessLevel(String accessLevel) {
        this.accessLevel = accessLevel;
    }
}