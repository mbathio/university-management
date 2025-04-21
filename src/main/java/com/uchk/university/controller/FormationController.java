package com.uchk.university.controller;

import com.uchk.university.entity.Formation;
import com.uchk.university.service.FormationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/formations")
@RequiredArgsConstructor
public class FormationController {
    private final FormationService formationService;

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