package com.uchk.university.repository;

import com.uchk.university.entity.Document;
import com.uchk.university.entity.DocumentType;
import com.uchk.university.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByType(DocumentType type);
    List<Document> findByCreatedBy(User createdBy);
    List<Document> findByVisibilityLevel(String visibilityLevel);
}