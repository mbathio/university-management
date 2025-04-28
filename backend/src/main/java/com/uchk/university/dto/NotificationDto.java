package com.uchk.university.dto;

import com.uchk.university.entity.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDto {
    private Long id;
    private String title;
    private String message;
    private NotificationType type;
    private Long userId;
    private String username;
    private boolean read;
    private LocalDateTime createdAt;
    private Long relatedEntityId;
    private String relatedEntityType;
}