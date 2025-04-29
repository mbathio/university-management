package com.uchk.university.controller;

import com.uchk.university.entity.Formation;
import com.uchk.university.entity.Staff; // Ajouté pour les formateurs
import com.uchk.university.service.FormationService;
import com.uchk.university.service.StaffService; // Service nécessaire pour récupérer les formateurs
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
    private final StaffService staffService; // Ajouté pour récupérer les formateurs

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

    // Nouvel endpoint pour récupérer la formation de l'utilisateur connecté
    @GetMapping("/my-formation")
    @PreAuthorize("hasAnyRole('STUDENT')")
    public ResponseEntity<Formation> getMyFormation() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        // Ici, vous devriez implémenter une logique pour récupérer la formation
        // associée à l'étudiant connecté, par exemple:
        // return ResponseEntity.ok(formationService.getFormationByStudentUsername(username));
        
        // Pour le moment, renvoyer une erreur 501 Not Implemented
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }

    // Nouvel endpoint pour récupérer l'emploi du temps d'une formation
    @GetMapping("/{id}/schedule")
    public ResponseEntity<List<Object>> getFormationSchedule(@PathVariable Long id) {
        // Vérifier que la formation existe
        formationService.getFormationById(id); // Lancera une exception si elle n'existe pas
        
        // Ici, vous devriez implémenter une logique pour récupérer l'emploi du temps
        // Pour le moment, renvoyer une liste vide
        return ResponseEntity.ok(Collections.emptyList());
    }

    // Nouvel endpoint pour récupérer les formateurs d'une formation
    @GetMapping("/{id}/trainers")
    public ResponseEntity<List<Staff>> getFormationTrainers(@PathVariable Long id) {
        // Vérifier que la formation existe
        formationService.getFormationById(id); // Lancera une exception si elle n'existe pas
        
        // Ici, vous devriez implémenter une logique pour récupérer les formateurs
        // Par exemple, en utilisant le staffService
        // return ResponseEntity.ok(staffService.getStaffByFormationId(id));
        
        // Pour le moment, renvoyer une liste vide
        return ResponseEntity.ok(Collections.emptyList());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'FORMATION_MANAGER')")
    public ResponseEntity<Formation> createFormation(@Valid @RequestBody Formation formation) {
        return ResponseEntity.status(HttpStatus.CREATED).body(formationService.createFormation(formation));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FORMATION_MANAGER')")
    public ResponseEntity<Formation> updateFormation(@PathVariable Long id, @Valid @RequestBody Formation formation) {
        return ResponseEntity.ok(formationService.updateFormation(id, formation));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteFormation(@PathVariable Long id) {
        formationService.deleteFormation(id);
        return ResponseEntity.noContent().build();
    }
}