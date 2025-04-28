package com.uchk.university.service;

import com.uchk.university.dto.NotificationDto;
import com.uchk.university.entity.Notification;
import com.uchk.university.repository.NotificationRepository;
import com.uchk.university.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {
    private final NotificationRepository notificationRepository;
    private static final Logger logger = LoggerFactory.getLogger(NotificationServiceImpl.class);

    @Override
    @Transactional(readOnly = true)
    public int getUnreadCount() {
        String username = SecurityUtils.getCurrentUsername();
        if (username == null) {
            logger.error("Unable to retrieve username for unread count");
            return 0;
        }
        return notificationRepository.countUnreadByUsername(username);
    }

    @Override
    @Transactional
    public NotificationDto markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setRead(true);
        return convertToDTO(notificationRepository.save(notification));
    }

    @Override
    @Transactional
    public void markAllAsRead() {
        String username = SecurityUtils.getCurrentUsername();
        if (username == null) {
            logger.error("Unable to retrieve username for mark all as read");
            return;
        }
        List<Notification> notifications = notificationRepository.findByUserUsername(username);
        notifications.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(notifications);
    }

    @Override
    @Transactional
    public void deleteNotification(Long id) {
        notificationRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public NotificationDto getNotification(Long id) {
        return notificationRepository.findById(id)
                .map(this::convertToDTO)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationDto> getRecentNotificationsForCurrentUser(int limit) {
        String username = SecurityUtils.getCurrentUsername();
        if (username == null) {
            logger.error("Unable to retrieve username for notifications");
            return Collections.emptyList();
        }
        return notificationRepository.findByUserUsername(username)
                .stream()
                .sorted((n1, n2) -> n2.getCreatedAt().compareTo(n1.getCreatedAt())) // Sort by most recent first
                .map(this::convertToDTO)
                .limit(limit)
                .collect(Collectors.toList());
    }

    private NotificationDto convertToDTO(Notification notification) {
        NotificationDto dto = new NotificationDto();
        dto.setId(notification.getId());
        dto.setMessage(notification.getMessage());
        dto.setType(notification.getType());
        dto.setRead(notification.isRead());
        dto.setCreatedAt(notification.getCreatedAt());
        dto.setUser(notification.getUser());
        return dto;
    }
}
