package com.uchk.university.dto;

import com.uchk.university.entity.NotificationType;
import com.uchk.university.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDto {  // Changed from NotificationDTO to NotificationDto
    public Long id;
    public String message;
    public NotificationType type;
    public boolean read;
    public LocalDateTime createdAt;
    public User user;

}

