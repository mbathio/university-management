package com.uchk.university.controller;

import com.uchk.university.dto.StaffDto;
import com.uchk.university.entity.Staff;
import com.uchk.university.service.StaffService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/staff")
@RequiredArgsConstructor
public class StaffController {
    private final StaffService staffService;

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @staffService.getStaffById(#id).user.username == authentication.principal.username")
    public ResponseEntity<Staff> getStaffById(@PathVariable Long id) {
        return ResponseEntity.ok(staffService.getStaffById(id));
    }

    @GetMapping("/staffId/{staffId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Staff> getStaffByStaffId(@PathVariable String staffId) {
        return ResponseEntity.ok(staffService.getStaffByStaffId(staffId));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Staff>> getAllStaff() {
        return ResponseEntity.ok(staffService.getAllStaff());
    }

    @GetMapping("/department/{department}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FORMATION_MANAGER')")
    public ResponseEntity<List<Staff>> getStaffByDepartment(@PathVariable String department) {
        return ResponseEntity.ok(staffService.getStaffByDepartment(department));
    }

    @GetMapping("/position/{position}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FORMATION_MANAGER')")
    public ResponseEntity<List<Staff>> getStaffByPosition(@PathVariable String position) {
        return ResponseEntity.ok(staffService.getStaffByPosition(position));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Staff> createStaff(@Valid @RequestBody StaffDto staffDto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(staffService.createStaff(staffDto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @staffService.getStaffById(#id).user.username == authentication.principal.username")
    public ResponseEntity<Staff> updateStaff(@PathVariable Long id, @Valid @RequestBody StaffDto staffDto) {
        return ResponseEntity.ok(staffService.updateStaff(id, staffDto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteStaff(@PathVariable Long id) {
        staffService.deleteStaff(id);
        return ResponseEntity.noContent().build();
    }
}