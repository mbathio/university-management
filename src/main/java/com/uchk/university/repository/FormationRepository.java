package com.uchk.university.repository;

import com.uchk.university.entity.Formation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FormationRepository extends JpaRepository<Formation, Long> {
    List<Formation> findByType(String type);
    List<Formation> findByLevel(String level);
}