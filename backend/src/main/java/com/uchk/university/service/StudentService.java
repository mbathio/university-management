package com.uchk.university.service;

import com.uchk.university.dto.StudentDto;
import com.uchk.university.entity.Formation;
import com.uchk.university.entity.Role;
import com.uchk.university.entity.Student;
import com.uchk.university.entity.User;
import com.uchk.university.exception.ResourceNotFoundException;
import com.uchk.university.repository.FormationRepository;
import com.uchk.university.repository.StudentRepository;
import com.uchk.university.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZoneId;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StudentService {
    private final StudentRepository studentRepository;
    private final UserService userService;
    private final FormationRepository formationRepository;
    private static final Logger logger = LoggerFactory.getLogger(StudentService.class);

    /**
     * Check if the currently authenticated user is the student with the given ID
     */
    public boolean isCurrentUserStudent(Long studentId) {
        try {
            String username = SecurityUtils.getCurrentUsername();
            Student student = getStudentById(studentId);
            return student.getUser().getUsername().equals(username);
        } catch (Exception e) {
            logger.warn("Error checking current user against student: {}", e.getMessage());
            return false;
        }
    }

    @Transactional
    public Student createStudent(StudentDto studentDto) {
        logger.info("Creating student with studentId: {}", studentDto.getStudentId());
        
        // Create user account first
        User user = userService.createUser(new com.uchk.university.dto.UserDto(
                studentDto.getUsername(),
                studentDto.getPassword(),
                studentDto.getEmail(),
                Role.STUDENT,
                true // Set active to true by default
        ));
        
        logger.info("User created with ID: {}", user.getId());

        // Get formation if provided
        Formation formation = null;
        if (studentDto.getFormationId() != null) {
            formation = formationRepository.findById(studentDto.getFormationId())
                    .orElseThrow(() -> new ResourceNotFoundException("Formation not found with id: " + studentDto.getFormationId()));
            logger.info("Found formation with ID: {}", formation.getId());
        }

        // Create student profile
        Student student = new Student();
        student.setUser(user);
        student.setStudentId(studentDto.getStudentId());
        student.setFirstName(studentDto.getFirstName());
        student.setLastName(studentDto.getLastName());

        // Convert java.util.Date to LocalDate if not null
        if (studentDto.getBirthDate() != null) {
            student.setBirthDate(studentDto.getBirthDate().toInstant()
                    .atZone(ZoneId.systemDefault())
                    .toLocalDate());
        } else {
            student.setBirthDate(null);
        }

        student.setCurrentFormation(formation);
        student.setPromo(studentDto.getPromo());
        student.setStartYear(studentDto.getStartYear());
        student.setEndYear(studentDto.getEndYear());

        Student savedStudent = studentRepository.save(student);
        logger.info("Student saved with ID: {}", savedStudent.getId());
        return savedStudent;
    }

    public Student getStudentById(Long id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));
    }

    public Student getStudentByStudentId(String studentId) {
        return studentRepository.findByStudentId(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with studentId: " + studentId));
    }

    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    public List<Student> getStudentsByFormation(Long formationId) {
        Formation formation = formationRepository.findById(formationId)
                .orElseThrow(() -> new ResourceNotFoundException("Formation not found with id: " + formationId));
        return studentRepository.findByCurrentFormation(formation);
    }

    public List<Student> getStudentsByPromo(String promo) {
        return studentRepository.findByPromo(promo);
    }

    @Transactional
    public Student updateStudent(Long id, StudentDto studentDto) {
        Student student = getStudentById(id);

        student.setFirstName(studentDto.getFirstName());
        student.setLastName(studentDto.getLastName());

        // Convert java.util.Date to LocalDate if not null
        if (studentDto.getBirthDate() != null) {
            student.setBirthDate(studentDto.getBirthDate().toInstant()
                    .atZone(ZoneId.systemDefault())
                    .toLocalDate());
        } else {
            student.setBirthDate(null);
        }

        student.setPromo(studentDto.getPromo());
        student.setStartYear(studentDto.getStartYear());
        student.setEndYear(studentDto.getEndYear());

        // Update Formation if provided
        if (studentDto.getFormationId() != null) {
            Formation formation = formationRepository.findById(studentDto.getFormationId())
                    .orElseThrow(() -> new ResourceNotFoundException("Formation not found with id: " + studentDto.getFormationId()));
            student.setCurrentFormation(formation);
        }

        return studentRepository.save(student);
    }

    @Transactional
    public void deleteStudent(Long id) {
        Student student = getStudentById(id);
        studentRepository.delete(student);
        userService.deleteUser(student.getUser().getId());
    }
}