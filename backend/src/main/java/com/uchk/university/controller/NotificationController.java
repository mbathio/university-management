package com.uchk.university.controller;

import com.uchk.university.dto.NotificationDto;  // Change to match actual class name
import com.uchk.university.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<NotificationDto>> getNotifications(@RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(notificationService.getRecentNotificationsForCurrentUser(limit));
    }

    @GetMapping("/unread/count")
    public ResponseEntity<Integer> getUnreadCount() {
        return ResponseEntity.ok(notificationService.getUnreadCount());
    }
    
    @PatchMapping("/mark-all-read")
    public ResponseEntity<Void> markAllAsRead() {
        notificationService.markAllAsRead();
        return ResponseEntity.ok().build();
    }

    @GetMapping("/recent")
public ResponseEntity<List<NotificationDto>> getRecentNotifications(
        @RequestParam(defaultValue = "5") int limit) {
    return ResponseEntity.ok(notificationService.getRecentNotificationsForCurrentUser(limit));
}

@PatchMapping("/{id}/read")
public ResponseEntity<NotificationDto> markNotificationAsRead(@PathVariable Long id) {
    return ResponseEntity.ok(notificationService.markAsRead(id));
}

@PatchMapping("/read-all")
public ResponseEntity<Void> markAllNotificationsAsRead() {
    notificationService.markAllAsRead();
    return ResponseEntity.ok().build();

    }
}
