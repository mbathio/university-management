package com.uchk.university.service;

import com.uchk.university.entity.Role;
import com.uchk.university.entity.Staff;
import com.uchk.university.entity.User;
import com.uchk.university.dto.StaffDto;
import com.uchk.university.exception.ResourceNotFoundException;
import com.uchk.university.repository.StaffRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class StaffService {
    private final StaffRepository staffRepository;
    private final UserService userService;

    @Transactional
    public Staff createStaff(StaffDto staffDto) {
        // Create user account first
        User user = userService.createUser(new com.uchk.university.dto.UserDto(
                staffDto.getUsername(),
                staffDto.getPassword(),
                staffDto.getEmail(),
                staffDto.getRole()
        ));

        // Create staff profile
        Staff staff = new Staff();
        staff.setUser(user);
        staff.setStaffId(staffDto.getStaffId());
        staff.setFirstName(staffDto.getFirstName());
        staff.setLastName(staffDto.getLastName());
        staff.setPosition(staffDto.getPosition());
        staff.setDepartment(staffDto.getDepartment());
        staff.setContactInfo(staffDto.getContactInfo());

        return staffRepository.save(staff);
    }

    public Staff getStaffById(Long id) {
        return staffRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found with id: " + id));
    }

    public Staff getStaffByStaffId(String staffId) {
        return staffRepository.findByStaffId(staffId)
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found with staffId: " + staffId));
    }

    public List<Staff> getAllStaff() {
        return staffRepository.findAll();
    }

    public List<Staff> getStaffByDepartment(String department) {
        return staffRepository.findByDepartment(department);
    }

    public List<Staff> getStaffByPosition(String position) {
        return staffRepository.findByPosition(position);
    }

    @Transactional
    public Staff updateStaff(Long id, StaffDto staffDto) {
        Staff staff = getStaffById(id);
        
        staff.setFirstName(staffDto.getFirstName());
        staff.setLastName(staffDto.getLastName());
        staff.setPosition(staffDto.getPosition());
        staff.setDepartment(staffDto.getDepartment());
        staff.setContactInfo(staffDto.getContactInfo());
        
        // Update user details if needed
        if (staffDto.getEmail() != null || staffDto.getPassword() != null || staffDto.getRole() != null) {
            User user = staff.getUser();
            com.uchk.university.dto.UserDto userDto = new com.uchk.university.dto.UserDto(
                    user.getUsername(),
                    staffDto.getPassword(),
                    staffDto.getEmail() != null ? staffDto.getEmail() : user.getEmail(),
                    staffDto.getRole() != null ? staffDto.getRole() : user.getRole()
            );
            userService.updateUser(user.getId(), userDto);
        }
        
        return staffRepository.save(staff);
    }

    @Transactional
    public void deleteStaff(Long id) {
        Staff staff = getStaffById(id);
        staffRepository.delete(staff);
        userService.deleteUser(staff.getUser().getId());
    }
    
    // Method to safely check if a user is the owner of a staff profile

    // Method to safely check if a user is the owner of a staff profile
    public boolean isOwnStaffProfile(Long staffId, String username) {
        Staff staff = getStaffById(staffId);
        return staff != null && staff.getUser() != null && 
               username.equals(staff.getUser().getUsername());
    }

    @Transactional(readOnly = true)
    public List<Staff> getTrainersByFormationId(Long formationId) {
        return staffRepository.findByFormationId(formationId);
    }
}