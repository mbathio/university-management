package com.uchk.university.service;

import com.uchk.university.entity.Formation;
import com.uchk.university.entity.Staff;
import com.uchk.university.exception.ResourceNotFoundException;
import com.uchk.university.repository.FormationRepository;
import com.uchk.university.repository.StaffRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FormationService {
    private final FormationRepository formationRepository;
    private final StaffRepository staffRepository;

    @Transactional
    @PreAuthorize("hasAnyRole('ADMIN', 'FORMATION_MANAGER')")
    public Formation createFormation(Formation formation) {
        // Validate the formation data
        validateFormation(formation);
        return formationRepository.save(formation);
    }

    @Transactional(readOnly = true)
    public Formation getFormationById(Long id) {
        return formationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Formation not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public List<Formation> getAllFormations() {
        return formationRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Formation> getFormationsByType(String type) {
        if (type == null || type.trim().isEmpty()) {
            throw new IllegalArgumentException("Formation type cannot be empty");
        }
        return formationRepository.findByType(type);
    }

    @Transactional(readOnly = true)
    public List<Formation> getFormationsByLevel(String level) {
        if (level == null || level.trim().isEmpty()) {
            throw new IllegalArgumentException("Formation level cannot be empty");
        }
        return formationRepository.findByLevel(level);
    }

    @Transactional
    @PreAuthorize("hasAnyRole('ADMIN', 'FORMATION_MANAGER')")
    public Formation updateFormation(Long id, Formation formationDetails) {
        Formation formation = getFormationById(id);
        
        // Validate the updated formation data
        validateFormation(formationDetails);
        
        // Update the formation properties
        formation.setName(formationDetails.getName());
        formation.setType(formationDetails.getType());
        formation.setLevel(formationDetails.getLevel());
        formation.setStartDate(formationDetails.getStartDate());
        formation.setEndDate(formationDetails.getEndDate());
        formation.setDescription(formationDetails.getDescription());
        formation.setFundingAmount(formationDetails.getFundingAmount());
        formation.setFundingType(formationDetails.getFundingType());
        
        return formationRepository.save(formation);
    }

    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteFormation(Long id) {
        Formation formation = getFormationById(id);
        // Consider checking for related entities that might be affected by deletion
        formationRepository.delete(formation);
    }

    @Transactional(readOnly = true)
    public Formation getFormationByStudentId(Long studentId) {
        return formationRepository.findByStudentId(studentId)
            .orElseThrow(() -> new ResourceNotFoundException("Formation not found for student id: " + studentId));
    }
    
    /**
     * Get the schedule for a specific formation
     */
    @Transactional(readOnly = true)
    public List<Object> getFormationSchedule(Long formationId) {
        // Verify formation exists
        getFormationById(formationId);
        
        // Implement schedule retrieval logic
        // For now return empty list
        return new ArrayList<>();
    }
    
    /**
     * Get trainers/staff for a specific formation
     */
    @Transactional(readOnly = true)
    public List<Staff> getFormationTrainers(Long formationId) {
        // Verify formation exists
        getFormationById(formationId);
        
        // Retrieve trainers from repository
        return staffRepository.findByFormationId(formationId);
    }
    
    private void validateFormation(Formation formation) {
        if (formation.getName() == null || formation.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Formation name cannot be empty");
        }
        
        if (formation.getType() == null || formation.getType().trim().isEmpty()) {
            throw new IllegalArgumentException("Formation type cannot be empty");
        }
        
        if (formation.getLevel() == null || formation.getLevel().trim().isEmpty()) {
            throw new IllegalArgumentException("Formation level cannot be empty");
        }
        
        if (formation.getStartDate() == null) {
            throw new IllegalArgumentException("Formation start date cannot be null");
        }
        
        // Check that end date is after start date if provided
        if (formation.getEndDate() != null && formation.getStartDate().isAfter(formation.getEndDate())) {
            throw new IllegalArgumentException("Formation end date must be after start date");
        }
    }
}