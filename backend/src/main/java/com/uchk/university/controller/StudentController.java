package com.uchk.university.controller;

import com.uchk.university.dto.StudentDto;
import com.uchk.university.entity.Student;
import com.uchk.university.service.StudentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
public class StudentController {
    private final StudentService studentService;
    private static final Logger logger = LoggerFactory.getLogger(StudentController.class);

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'FORMATION_MANAGER') or @studentService.isCurrentUserStudent(#id)")
    public ResponseEntity<Student> getStudentById(@PathVariable Long id) {
        return ResponseEntity.ok(studentService.getStudentById(id));
    }

    @GetMapping("/studentId/{studentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'FORMATION_MANAGER')")
    public ResponseEntity<Student> getStudentByStudentId(@PathVariable String studentId) {
        return ResponseEntity.ok(studentService.getStudentByStudentId(studentId));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'FORMATION_MANAGER')")
    public ResponseEntity<List<Student>> getAllStudents() {
        return ResponseEntity.ok(studentService.getAllStudents());
    }

    @GetMapping("/formation/{formationId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'FORMATION_MANAGER')")
    public ResponseEntity<List<Student>> getStudentsByFormation(@PathVariable Long formationId) {
        return ResponseEntity.ok(studentService.getStudentsByFormation(formationId));
    }

    @GetMapping("/promo/{promo}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'FORMATION_MANAGER')")
    public ResponseEntity<List<Student>> getStudentsByPromo(@PathVariable String promo) {
        return ResponseEntity.ok(studentService.getStudentsByPromo(promo));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Student> createStudent(@Valid @RequestBody StudentDto studentDto) {
        logger.info("Creating student with data: {}", studentDto);
        try {
            Student created = studentService.createStudent(studentDto);
            logger.info("Student created successfully with ID: {}", created.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            logger.error("Failed to create student: {}", e.getMessage(), e);
            throw e;
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @studentService.isCurrentUserStudent(#id)")
    public ResponseEntity<Student> updateStudent(@PathVariable Long id, @Valid @RequestBody StudentDto studentDto) {
        return ResponseEntity.ok(studentService.updateStudent(id, studentDto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteStudent(@PathVariable Long id) {
        studentService.deleteStudent(id);
        return ResponseEntity.noContent().build();
    }
}