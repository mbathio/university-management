package com.uchk.university.service;

import com.uchk.university.dto.StudentDto;
import com.uchk.university.entity.Formation;
import com.uchk.university.entity.Role;
import com.uchk.university.entity.Student;
import com.uchk.university.entity.User;
import com.uchk.university.exception.ResourceNotFoundException;
import com.uchk.university.repository.FormationRepository;
import com.uchk.university.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StudentService {
    private final StudentRepository studentRepository;
    private final UserService userService;
    private final FormationRepository formationRepository;

    @Transactional
    public Student createStudent(StudentDto studentDto) {
        // Create user account first
        User user = userService.createUser(new com.uchk.university.dto.UserDto(
                studentDto.getUsername(),
                studentDto.getPassword(),
                studentDto.getEmail(),
                Role.STUDENT
        ));

        // Get formation if provided
        Formation formation = null;
        if (studentDto.getFormationId() != null) {
            formation = formationRepository.findById(studentDto.getFormationId())
                    .orElseThrow(() -> new ResourceNotFoundException("Formation not found with id: " + studentDto.getFormationId()));
        }

        // Create student profile
        Student student = new Student();
        student.setUser(user);
        student.setStudentId(studentDto.getStudentId());
        student.setFirstName(studentDto.getFirstName());
        student.setLastName(studentDto.getLastName());
        student.setBirthDate(studentDto.getBirthDate());
        student.setCurrentFormation(formation);
        student.setPromo(studentDto.getPromo());
        student.setStartYear(studentDto.getStartYear());
        student.setEndYear(studentDto.getEndYear());

        return studentRepository.save(student);
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
        
        // Update formation if provided
        if (studentDto.getFormationId() != null) {
            Formation formation = formationRepository.findById(studentDto.getFormationId())
                    .orElseThrow(() -> new ResourceNotFoundException("Formation not found with id: " + studentDto.getFormationId()));
            student.setCurrentFormation(formation);
        }
        
        student.setFirstName(studentDto.getFirstName());
        student.setLastName(studentDto.getLastName());
        student.setBirthDate(studentDto.getBirthDate());
        student.setPromo(studentDto.getPromo());
        student.setStartYear(studentDto.getStartYear());
        student.setEndYear(studentDto.getEndYear());
        
        return studentRepository.save(student);
    }

    @Transactional
    public void deleteStudent(Long id) {
        Student student = getStudentById(id);
        studentRepository.delete(student);
        userService.deleteUser(student.getUser().getId());
    }
}