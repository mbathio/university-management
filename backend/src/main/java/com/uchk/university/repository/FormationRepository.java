package com.uchk.university.repository;

import com.uchk.university.entity.Formation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FormationRepository extends JpaRepository<Formation, Long> {
    List<Formation> findByType(String type);
    List<Formation> findByLevel(String level);

    @Query("SELECT f FROM Formation f JOIN Student s ON f.id = s.currentFormation.id WHERE s.id = :studentId")
    Optional<Formation> findByStudentId(@Param("studentId") Long studentId);
}