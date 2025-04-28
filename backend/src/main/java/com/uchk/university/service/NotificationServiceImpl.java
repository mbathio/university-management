package com.uchk.university.service;

import com.uchk.university.dto.NotificationDTO;
import com.uchk.university.entity.Notification;
import com.uchk.university.entity.NotificationType;
import com.uchk.university.entity.User;
import com.uchk.university.repository.NotificationRepository;
import com.uchk.university.repository.UserRepository;
import com.uchk.university.security.SecurityUtils;
import com.uchk.university.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SecurityUtils securityUtils;

    @Override
    @Transactional
    public NotificationDTO createNotification(String title, String message, NotificationType type, Long userId, Long relatedEntityId, String relatedEntityType) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        
        Notification notification = Notification.builder()
                .title(title)
                .message(message)
                .type(type)
                .user(user)
                .relatedEntityId(relatedEntityId)
                .relatedEntityType(relatedEntityType)
                .build();
        
        notification = notificationRepository.save(notification);
        return mapToDTO(notification);
    }

    @Override
    @Transactional(readOnly = true)
    public NotificationDTO getNotificationById(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found with id: " + id));
        
        return mapToDTO(notification);
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationDTO> getNotificationsForCurrentUser() {
        User currentUser = getCurrentUser();
        List<Notification> notifications = notificationRepository.findByUserOrderByCreatedAtDesc(currentUser);
        
        return notifications.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationDTO> getRecentNotifications(int limit) {
        User currentUser = getCurrentUser();
        
        List<Notification> notifications;
        if (limit <= 0) {
            notifications = notificationRepository.findByUserOrderByCreatedAtDesc(currentUser);
        } else if (limit == 5) {
            notifications = notificationRepository.findTop5ByUserOrderByCreatedAtDesc(currentUser);
        } else {
            notifications = notificationRepository.findByUserOrderByCreatedAtDesc(currentUser);
            if (notifications.size() > limit) {
                notifications = notifications.subList(0, limit);
            }
        }
        
        return notifications.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public int getUnreadCount() {
        User currentUser = getCurrentUser();
        return notificationRepository.countUnreadByUser(currentUser);
    }

    @Override
    @Transactional
    public void markAsRead(Long id) {
        User currentUser = getCurrentUser();
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found with id: " + id));
        
        // Ensure the notification belongs to the current user
        if (!notification.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("You don't have permission to update this notification");
        }
        
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void markAllAsRead() {
        User currentUser = getCurrentUser();
        notificationRepository.markAllAsReadForUser(currentUser);
    }

    @Override
    @Transactional
    public void deleteNotification(Long id) {
        User currentUser = getCurrentUser();
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found with id: " + id));
        
        // Ensure the notification belongs to the current user
        if (!notification.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("You don't have permission to delete this notification");
        }
        
        notificationRepository.delete(notification);
    }

    @Override
    @Transactional
    public void createDocumentNotification(Long documentId, String documentTitle, Long creatorId) {
        // We'll notify all users except the creator about the new document
        List<User> users = userRepository.findAll().stream()
                .filter(user -> !user.getId().equals(creatorId))
                .collect(Collectors.toList());
        
        for (User user : users) {
            Notification notification = Notification.builder()
                    .title("Nouveau document")
                    .message("Un nouveau document a été ajouté: " + documentTitle)
                    .type(NotificationType.DOCUMENT_ADDED)
                    .user(user)
                    .relatedEntityId(documentId)
                    .relatedEntityType("Document")
                    .build();
            
            notificationRepository.save(notification);
        }
    }

    private User getCurrentUser() {
        String username = securityUtils.getCurrentUsername()
                .orElseThrow(() -> new RuntimeException("No authenticated user found"));
        
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
    }

    private NotificationDTO mapToDTO(Notification notification) {
        return NotificationDTO.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .type(notification.getType())
                .userId(notification.getUser().getId())
                .username(notification.getUser().getUsername())
                .read(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .relatedEntityId(notification.getRelatedEntityId())
                .relatedEntityType(notification.getRelatedEntityType())
                .build();
    }
}