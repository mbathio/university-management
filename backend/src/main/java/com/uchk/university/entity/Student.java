package com.uchk.university.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "students")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Student {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(unique = true, nullable = false)
    private String studentId;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    private LocalDate birthDate;

    @ManyToOne
    @JoinColumn(name = "formation_id")
    private Formation currentFormation;
    // In Student.java
public User getUser() {
    return user;
}
    private String promo;
    private Integer startYear;
    private Integer endYear;

    public Long getFormationId() {
        return currentFormation != null ? currentFormation.getId() : null;
    }
}