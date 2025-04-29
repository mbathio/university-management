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
        // Log request details only in debug mode
        if (logger.isDebugEnabled()) {
            logger.debug("Processing request: {} {}", request.getMethod(), request.getRequestURL());
        }

        // Extract Authorization header
        String authHeader = request.getHeader("Authorization");
        
        // Continue filter chain if no Authorization header or not a Bearer token
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }
        
        String token = authHeader.substring(7);
        
        try {
            // Extract username from token
            String username = jwtTokenUtil.getUsernameFromToken(token);
            
            // Check if authentication is not already set and username exists
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
                    
                    // Log successful authentication only in debug mode
                    if (logger.isDebugEnabled()) {
                        logger.debug("User authenticated: {}, Authorities: {}", 
                            username, 
                            userDetails.getAuthorities()
                        );
                    }
                } else {
                    logger.warn("Token validation failed for user: {}", username);
                }
            }
        } catch (ExpiredJwtException e) {
            // Don't log the full exception stack in production
            logger.warn("JWT Token expired");
        } catch (JwtException e) {
            // Don't log the full exception stack in production
            logger.warn("JWT Token error");
        } catch (Exception e) {
            // Don't log the full exception stack in production
            logger.error("Authentication error");
        }

        filterChain.doFilter(request, response);
    }
}