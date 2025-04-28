package com.uchk.university.repository;

import com.uchk.university.entity.Notification;
import com.uchk.university.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Pageable;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserOrderByCreatedAtDesc(User user);
    
    List<Notification> findByUserAndReadFalseOrderByCreatedAtDesc(User user);
    
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.user = ?1 AND n.read = false")
    int countUnreadByUser(User user);
    
    @Modifying
    @Transactional
    @Query("UPDATE Notification n SET n.read = true WHERE n.user = ?1")
    void markAllAsReadForUser(User user);
    
    List<Notification> findTop5ByUserOrderByCreatedAtDesc(User user);
    List<Notification> findByUserUsernameOrderByCreatedAtDesc(String username);
    // Find notifications for a specific user by username
    @Query("SELECT n FROM Notification n WHERE n.user.username = :username ORDER BY n.createdAt DESC")
    List<Notification> findByUserUsername(@Param("username") String username);

    // Find recent notifications for a specific user
    @Query("SELECT n FROM Notification n WHERE n.user.username = :username ORDER BY n.createdAt DESC")
List<Notification> findRecentNotificationsByUsername(
    @Param("username") String username,
    Pageable pageable
);


    // Count unread notifications for a specific user
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.user.username = :username AND n.read = false")
    int countUnreadByUsername(@Param("username") String username);

    // Mark all notifications as read for a specific user
    @Modifying
    @Transactional
    @Query("UPDATE Notification n SET n.read = true WHERE n.user.username = :username")
    void markAllAsReadByUsername(@Param("username") String username);
}