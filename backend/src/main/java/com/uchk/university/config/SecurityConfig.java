package com.uchk.university.config;

import com.uchk.university.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;
import org.springframework.security.web.header.writers.XXssProtectionHeaderWriter;
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
    
    @Value("${cors.allowed-origins:http://localhost:4200,http://localhost:8080}")
    private String[] allowedOrigins;
    
    @Value("${cors.allowed-methods:GET,POST,PUT,DELETE,OPTIONS}")
    private String[] allowedMethods;
    
    @Value("${cors.max-age:3600}")
    private Long corsMaxAge;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // For APIs, we use JWT for auth so we can disable CSRF protection for /api endpoints
            // but enable it for other routes
            .csrf(csrf -> csrf
                .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                // Only disable CSRF for auth endpoints, not all API endpoints
                .ignoringRequestMatchers("/api/auth/**")
            )
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            // Add security headers
            .headers(headers -> headers
                .contentSecurityPolicy(csp -> csp
                    .policyDirectives("default-src 'self'; script-src 'self' https://cdnjs.cloudflare.com; " +
                                     "style-src 'self' https://cdnjs.cloudflare.com; " +
                                     "img-src 'self' data:; " +
                                     "font-src 'self' https://cdnjs.cloudflare.com; " +
                                     "frame-ancestors 'none'; form-action 'self'; " +
                                     "object-src 'none';")
                )
                .frameOptions(frame -> frame.deny())
                .xssProtection(xss -> xss.headerValue(XXssProtectionHeaderWriter.HeaderValue.ENABLED_MODE_BLOCK))
                .referrerPolicy(referrer -> referrer
                    .policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN))
                .permissionsPolicy(permissions -> permissions
                    .policy("camera=(), microphone=(), geolocation=(), payment=()")))
            .authorizeHttpRequests(auth -> auth
                // Public endpoints - accessible without authentication
                .requestMatchers("/api/auth/login", "/api/auth/register").permitAll()
                .requestMatchers("/api/public/**").permitAll()
                .requestMatchers("/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                
                // Publicly readable resources - ensure proper access control
                .requestMatchers(HttpMethod.GET, "/api/formations/**").permitAll()
                // Restrict document downloads to authenticated users with proper permissions
                .requestMatchers(HttpMethod.GET, "/api/documents/download/**").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/documents/files/**").authenticated()
                
                // Admin-only endpoints
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/actuator/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/students").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/students/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/formations/**").hasRole("ADMIN")
                
                // Student endpoints
                .requestMatchers("/api/student/**").hasAnyRole("ADMIN", "STUDENT")
                .requestMatchers(HttpMethod.GET, "/api/students/**").hasAnyRole("ADMIN", "TEACHER", "FORMATION_MANAGER", "STUDENT")
                .requestMatchers(HttpMethod.PUT, "/api/students/**").hasAnyRole("ADMIN", "STUDENT")
                
                // Formation management
                .requestMatchers(HttpMethod.POST, "/api/formations/**").hasAnyRole("ADMIN", "FORMATION_MANAGER")
                .requestMatchers(HttpMethod.PUT, "/api/formations/**").hasAnyRole("ADMIN", "FORMATION_MANAGER")
                
                // Teacher endpoints
                .requestMatchers("/api/teacher/**").hasAnyRole("ADMIN", "TEACHER", "FORMATION_MANAGER")
                
                // Document management - restrict access 
                .requestMatchers("/api/documents").hasAnyRole("ADMIN", "TEACHER", "FORMATION_MANAGER", "ADMINISTRATION")
                .requestMatchers(HttpMethod.POST, "/api/documents/**").hasAnyRole("ADMIN", "TEACHER", "FORMATION_MANAGER", "ADMINISTRATION")
                .requestMatchers(HttpMethod.PUT, "/api/documents/**").hasAnyRole("ADMIN", "TEACHER", "FORMATION_MANAGER", "ADMINISTRATION")
                .requestMatchers(HttpMethod.DELETE, "/api/documents/**").hasAnyRole("ADMIN", "TEACHER", "FORMATION_MANAGER")
                
                // User management - restrict to admin only
                .requestMatchers("/api/users/**").hasRole("ADMIN")
                
                // Role management - restrict to admin only
                .requestMatchers("/api/roles/**").hasRole("ADMIN")
                
                // Notification endpoints
                .requestMatchers("/api/notifications/unread/count").authenticated()
                .requestMatchers("/api/notifications/mark-all-read").authenticated()
                .requestMatchers("/api/notifications/**").authenticated()
                
                // Token validation endpoint
                .requestMatchers("/api/auth/validate").authenticated()
                
                // All other requests require authentication
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
        configuration.setAllowedOrigins(Arrays.asList(allowedOrigins));
        configuration.setAllowedMethods(Arrays.asList(allowedMethods));
        configuration.setAllowedHeaders(Arrays.asList(
            "Authorization", 
            "Content-Type", 
            "X-Requested-With", 
            "X-CSRF-TOKEN"
        ));
        // Limit exposed headers to only what's necessary
        configuration.setExposedHeaders(List.of("Authorization"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(corsMaxAge);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
    
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}