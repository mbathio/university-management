package com.uchk.university.security;

import com.uchk.university.service.UserService;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtTokenUtil jwtTokenUtil;
    private final UserDetailsService userDetailsService;
    private final UserService userService;
    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        // Log request details for debugging
        logger.debug("Processing request: {} {}", request.getMethod(), request.getRequestURL());

        // Skip authentication for public endpoints
        if (shouldSkipAuthentication(request)) {
            filterChain.doFilter(request, response);
            return;
        }

        // Extract Authorization header
        String authHeader = request.getHeader("Authorization");
        
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            
            try {
                // Extract username from token
                String username = jwtTokenUtil.getUsernameFromToken(token);
                
                // Check if authentication is not already set
                if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    // Load user details
                    UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                    
                    // Validate token
                    if (jwtTokenUtil.validateToken(token, userDetails)) {
                        // Create authentication token
                        UsernamePasswordAuthenticationToken authToken = 
                            new UsernamePasswordAuthenticationToken(
                                userDetails, 
                                null, 
                                userDetails.getAuthorities()
                            );
                        
                        // Set authentication details
                        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        
                        // Set security context
                        SecurityContextHolder.getContext().setAuthentication(authToken);
                        
                        // Log successful authentication
                        logger.info("User authenticated: {}, Authorities: {}", 
                            username, 
                            userDetails.getAuthorities()
                        );
                    } else {
                        logger.warn("Token validation failed for user: {}", username);
                    }
                }
            } catch (ExpiredJwtException e) {
                logger.error("JWT Token expired: {}", e.getMessage());
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            } catch (JwtException e) {
                logger.error("JWT Token error: {}", e.getMessage());
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            } catch (Exception e) {
                logger.error("Authentication error: {}", e.getMessage());
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            }
        }

        filterChain.doFilter(request, response);
    }

    private boolean shouldSkipAuthentication(HttpServletRequest request) {
        String path = request.getRequestURI();
        String method = request.getMethod();
        
        // Public endpoints
        String[] publicPaths = {
            "/api/auth/login", 
            "/api/auth/register", 
            "/api/auth/validate",
            "/api-docs/", 
            "/swagger-ui/", 
            "/actuator/"
        };
        
        for (String publicPath : publicPaths) {
            if (path.startsWith(publicPath)) {
                logger.debug("Skipping authentication for public path: {}", path);
                return true;
            }
        }
        
        // Allow read-only operations
        if ("GET".equals(method)) {
            String[] readOnlyPaths = {
                "/api/formations/", 
                "/api/students/", 
                "/api/documents/files/", 
                "/api/documents/download/"
            };
            
            for (String readOnlyPath : readOnlyPaths) {
                if (path.startsWith(readOnlyPath)) {
                    logger.debug("Skipping authentication for read-only path: {}", path);
                    return true;
                }
            }
        }
        
        return false;
    }
}