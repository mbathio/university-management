package com.uchk.university;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class UniversityManagementApplicationTests {
    private static final Logger logger = LoggerFactory.getLogger(UniversityManagementApplicationTests.class);

    @Autowired
    private ApplicationContext context;

    @Test
    void contextLoads() {
        logger.info("Starting context load test");
        assertThat(context).isNotNull();
        logger.info("Beans in context: {}", context.getBeanDefinitionCount());
        
        // Log bean names to help diagnose issues
        String[] beanNames = context.getBeanDefinitionNames();
        for (String beanName : beanNames) {
            logger.debug("Bean: {}", beanName);
        }
    }
}
