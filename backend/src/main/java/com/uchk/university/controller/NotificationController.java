package com.uchk.university.controller;

import com.uchk.university.dto.NotificationDTO;
import com.uchk.university.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Slf4j
public class NotificationController {
    
    private final NotificationService notificationService;
    
    @GetMapping
    public ResponseEntity<List<NotificationDTO>> getNotifications() {
        log.debug("REST request to get all notifications for current user");
        List<NotificationDTO> notifications = notificationService.getNotificationsForCurrentUser();
        return ResponseEntity.ok(notifications);
    }
    
    @GetMapping("/recent")
    public ResponseEntity<List<NotificationDTO>> getRecentNotifications(
            @RequestParam(defaultValue = "5") int limit) {
        log.debug("REST request to get recent {} notifications", limit);
        List<NotificationDTO> notifications = notificationService.getRecentNotifications(limit);
        return ResponseEntity.ok(notifications);
    }
    
    @GetMapping("/unread/count")
    public ResponseEntity<Integer> getUnreadCount() {
        log.debug("REST request to get unread notifications count");
        int count = notificationService.getUnreadCount();
        return ResponseEntity.ok(count);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<NotificationDTO> getNotification(@PathVariable Long id) {
        log.debug("REST request to get Notification : {}", id);
        NotificationDTO notification = notificationService.getNotificationById(id);
        return ResponseEntity.ok(notification);
    }
    
    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        log.debug("REST request to mark Notification as read : {}", id);
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }
    
    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead() {
        log.debug("REST request to mark all notifications as read");
        notificationService.markAllAsRead();
        return ResponseEntity.ok().build();
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id) {
        log.debug("REST request to delete Notification : {}", id);
        notificationService.deleteNotification(id);
        return ResponseEntity.noContent().build();
    }
}