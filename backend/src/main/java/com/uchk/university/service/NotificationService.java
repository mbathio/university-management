package com.uchk.university.service;

import com.uchk.university.dto.NotificationDto;
import java.util.List;

public interface NotificationService {
    List<NotificationDto> getNotificationsForCurrentUser();
    int getUnreadCount();
    NotificationDto getNotification(Long id);
    NotificationDto markAsRead(Long id);
    void markAllAsRead();
    void deleteNotification(Long id);
}                                                                                                                 