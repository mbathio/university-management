package com.uchk.university;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@ComponentScan(basePackages = "com.uchk.university")
@EntityScan(basePackages = "com.uchk.university.entity")
@EnableJpaRepositories(basePackages = "com.uchk.university.repository")
public class UniversityManagementApplication {

    public static void main(String[] args) {
        SpringApplication.run(UniversityManagementApplication.class, args);
    }
}
