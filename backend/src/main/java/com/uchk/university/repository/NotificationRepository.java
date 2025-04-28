package com.uchk.university.repository;

import com.uchk.university.entity.Notification;
import com.uchk.university.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserOrderByCreatedAtDesc(User user);
    
    List<Notification> findByUserAndReadFalseOrderByCreatedAtDesc(User user);
    
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.user = ?1 AND n.read = false")
    int countUnreadByUser(User user);
    
    @Modifying
    @Query("UPDATE Notification n SET n.read = true WHERE n.user = ?1")
    void markAllAsReadForUser(User user);
    
    List<Notification> findTop5ByUserOrderByCreatedAtDesc(User user);
}