package com.uchk.university.repository;

import com.uchk.university.entity.Staff;
import com.uchk.university.entity.Formation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StaffRepository extends JpaRepository<Staff, Long> {
    Optional<Staff> findByStaffId(String staffId);
    List<Staff> findByDepartment(String department);
    List<Staff> findByPosition(String position);
    
    // Updated method to use the new ManyToMany relationship
    List<Staff> findByFormations(Formation formation);
}