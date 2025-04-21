package com.uchk.university.service;

import com.uchk.university.entity.Formation;
import com.uchk.university.exception.ResourceNotFoundException;
import com.uchk.university.repository.FormationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FormationService {
    private final FormationRepository formationRepository;

    public Formation createFormation(Formation formation) {
        return formationRepository.save(formation);
    }

    public Formation getFormationById(Long id) {
        return formationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Formation not found with id: " + id));
    }

    public List<Formation> getAllFormations() {
        return formationRepository.findAll();
    }

    public List<Formation> getFormationsByType(String type) {
        return formationRepository.findByType(type);
    }

    public List<Formation> getFormationsByLevel(String level) {
        return formationRepository.findByLevel(level);
    }

    public Formation updateFormation(Long id, Formation formationDetails) {
        Formation formation = getFormationById(id);
        
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

    public void deleteFormation(Long id) {
        Formation formation = getFormationById(id);
        formationRepository.delete(formation);
    }
}