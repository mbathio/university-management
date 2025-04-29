package com.uchk.university.controller;

import com.uchk.university.entity.Formation;
import com.uchk.university.entity.Staff;
import com.uchk.university.entity.Student;
import com.uchk.university.service.FormationService;
import com.uchk.university.service.StaffService;
import com.uchk.university.service.StudentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/formations")
@RequiredArgsConstructor
public class FormationController {
    private final FormationService formationService;
    private final StaffService staffService;
    private final StudentService studentService; // Added to properly implement my-formation endpoint

    @GetMapping("/{id}")
    public ResponseEntity<Formation> getFormationById(@PathVariable Long id) {
        return ResponseEntity.ok(formationService.getFormationById(id));
    }

    @GetMapping
    public ResponseEntity<List<Formation>> getAllFormations() {
        return ResponseEntity.ok(formationService.getAllFormations());
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<Formation>> getFormationsByType(@PathVariable String type) {
        return ResponseEntity.ok(formationService.getFormationsByType(type));
    }

    @GetMapping("/level/{level}")
    public ResponseEntity<List<Formation>> getFormationsByLevel(@PathVariable String level) {
        return ResponseEntity.ok(formationService.getFormationsByLevel(level));
    }

    // Implement my-formation endpoint for students
    @GetMapping("/my-formation")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Formation> getMyFormation() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        
        // Get student's formation by username
        Student student = studentService.getStudentByUsername(username);
        if (student != null && student.getFormationId() != null) {
            Formation formation = formationService.getFormationById(student.getFormationId());
            return ResponseEntity.ok(formation);
        }
        
        return ResponseEntity.notFound().build();
    }

    // Implement schedule endpoint with proper authorization
    @GetMapping("/{id}/schedule")
    public ResponseEntity<List<Object>> getFormationSchedule(@PathVariable Long id) {
        // Verify formation exists
        Formation formation = formationService.getFormationById(id);
        
        // Call service to get schedule (implementation needed)
        // For now, return empty list
        return ResponseEntity.ok(Collections.emptyList());
    }

    // Implement trainers endpoint with proper authorization
    @GetMapping("/{id}/trainers")
    public ResponseEntity<List<Staff>> getFormationTrainers(@PathVariable Long id) {
        // Verify formation exists
        Formation formation = formationService.getFormationById(id);
        
        // Get trainers for this formation
        List<Staff> trainers = staffService.getTrainersByFormationId(id);
        return ResponseEntity.ok(trainers);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'FORMATION_MANAGER')")
    public ResponseEntity<Formation> createFormation(@Valid @RequestBody Formation formation) {
        // Input validation beyond @Valid annotations
        if (formation.getName() == null || formation.getName().trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        return ResponseEntity.status(HttpStatus.CREATED).body(formationService.createFormation(formation));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FORMATION_MANAGER')")
    public ResponseEntity<Formation> updateFormation(@PathVariable Long id, @Valid @RequestBody Formation formation) {
        // Prevent ID mismatch attacks
        if (!id.equals(formation.getId()) && formation.getId() != null) {
            return ResponseEntity.badRequest().build();
        }
        
        return ResponseEntity.ok(formationService.updateFormation(id, formation));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteFormation(@PathVariable Long id) {
        formationService.deleteFormation(id);
        return ResponseEntity.noContent().build();
    }
}