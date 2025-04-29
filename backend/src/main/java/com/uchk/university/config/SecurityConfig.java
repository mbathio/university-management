package com.uchk.university.config;

import com.uchk.university.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final UserDetailsService userDetailsService;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .authorizeHttpRequests(auth -> auth
                // Public endpoints
                .requestMatchers("/api/auth/login", "/api/auth/register").permitAll()
                .requestMatchers("/api/auth/validate").authenticated()
                .requestMatchers("/api/public/**").permitAll()
                .requestMatchers("/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                
                // Allow read operations for specific endpoints
                .requestMatchers(HttpMethod.GET, "/api/formations/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/students/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/documents/files/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/documents/download/**").permitAll()
                
                // Admin-specific endpoints
                .requestMatchers(HttpMethod.POST, "/api/students").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/students/**").hasAnyRole("ADMIN", "STUDENT")
                .requestMatchers(HttpMethod.DELETE, "/api/students/**").hasRole("ADMIN")
                
                // Other write operations
                .requestMatchers(HttpMethod.POST, "/api/formations/**").hasAnyRole("ADMIN", "FORMATION_MANAGER")
                .requestMatchers(HttpMethod.PUT, "/api/formations/**").hasAnyRole("ADMIN", "FORMATION_MANAGER")
                .requestMatchers(HttpMethod.DELETE, "/api/formations/**").hasRole("ADMIN")
                
                // Other endpoints
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/users/**").permitAll()
                .requestMatchers("/api/roles/**").permitAll()
                .requestMatchers("/actuator/**").hasRole("ADMIN")
                
                // Documents endpoints
                .requestMatchers("/api/documents").hasAnyRole("ADMIN", "TEACHER", "FORMATION_MANAGER", "ADMINISTRATION")
                
                // Notifications endpoints
                .requestMatchers("/api/notifications/unread/count").permitAll()
                .requestMatchers("/api/notifications/mark-all-read").hasAnyRole("ADMIN", "TEACHER", "FORMATION_MANAGER", "STUDENT")
                
                // Teacher endpoints
                .requestMatchers("/api/teacher/**").hasAnyRole("ADMIN", "TEACHER", "FORMATION_MANAGER")
                
                // Student endpoints
                .requestMatchers("/api/student/**").hasAnyRole("ADMIN", "STUDENT")
                
                // Require authentication for all other requests
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED))
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            );
        
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:4200", "http://localhost:8080"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With"));
        configuration.setExposedHeaders(List.of("Authorization"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
    
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    public class WebMvcConfig implements WebMvcConfigurer {
    
    private final CurrentUserArgumentResolver currentUserArgumentResolver;
    
    @Override
    public void addArgumentResolvers(List<HandlerMethodArgumentResolver> resolvers) {
        resolvers.add(currentUserArgumentResolver);
    }

    @Configuration
public class PasswordEncoderConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
}
}