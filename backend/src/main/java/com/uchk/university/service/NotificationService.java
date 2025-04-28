package com.uchk.university.service;

import com.uchk.university.dto.NotificationDTO;
import com.uchk.university.entity.Notification;
import com.uchk.university.entity.NotificationType;

import java.util.List;

public interface NotificationService {
    NotificationDTO createNotification(String title, String message, NotificationType type, Long userId, Long relatedEntityId, String relatedEntityType);
    
    NotificationDTO getNotificationById(Long id);
    
    List<NotificationDTO> getNotificationsForCurrentUser();
    
    List<NotificationDTO> getRecentNotifications(int limit);
    
    int getUnreadCount();
    
    void markAsRead(Long id);
    
    void markAllAsRead();
    
    void deleteNotification(Long id);
    
    // Helper method to create a notification when a document is added
    void createDocumentNotification(Long documentId, String documentTitle, Long creatorId);
}