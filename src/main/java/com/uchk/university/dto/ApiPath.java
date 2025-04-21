package com.uchk.university.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for representing API paths
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApiPath {
    private String method;
    private String path;
    private String description;
    private String accessControl;
}