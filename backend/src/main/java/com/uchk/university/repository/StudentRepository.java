package com.uchk.university.repository;

import com.uchk.university.entity.Formation;
import com.uchk.university.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByStudentId(String studentId);
    List<Student> findByCurrentFormation(Formation formation);
    List<Student> findByPromo(String promo);
}