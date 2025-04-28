package com.uchk.university.service;

import com.uchk.university.dto.NotificationDTO;
import java.util.List;

public interface NotificationService {
    List<NotificationDTO> getNotificationsForCurrentUser();
    int getUnreadCount();
    NotificationDTO getNotification(Long id);
    NotificationDTO markAsRead(Long id);
    void markAllAsRead();
    void deleteNotification(Long id);
}