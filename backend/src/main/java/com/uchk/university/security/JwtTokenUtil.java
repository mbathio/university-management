package com.uchk.university.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtTokenUtil {

    private final SecretKey key;
    private final long jwtExpiration;
    private final long jwtRefreshExpiration;
    
    // Added nonce prefix to prevent JWT token reuse across different systems
    private final String noncePrefix;

    public JwtTokenUtil(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration:3600000}") long jwtExpiration, // Reduced default to 1 hour
            @Value("${jwt.refresh-expiration:86400000}") long jwtRefreshExpiration) { // Reduced to 24 hours
        // Generate a strong key from the secret using HMAC-SHA-256
        // Ensure the secret key is at least 256 bits (32 bytes) for HS256
        byte[] secretBytes = secret.getBytes(StandardCharsets.UTF_8);
        if (secretBytes.length < 32) {
            // If provided secret is too short, strengthen it
            byte[] strengthened = new byte[32];
            System.arraycopy(secretBytes, 0, strengthened, 0, Math.min(secretBytes.length, 32));
            this.key = Keys.hmacShaKeyFor(strengthened);
        } else {
            this.key = Keys.hmacShaKeyFor(secretBytes);
        }
        
        this.jwtExpiration = jwtExpiration;
        this.jwtRefreshExpiration = jwtRefreshExpiration;
        
        // Generate a random nonce prefix for this instance
        SecureRandom random = new SecureRandom();
        byte[] nonceBytes = new byte[8];
        random.nextBytes(nonceBytes);
        this.noncePrefix = Base64.getUrlEncoder().withoutPadding().encodeToString(nonceBytes);
    }

    public String getUsernameFromToken(String token) {
        return getClaimFromToken(token, Claims::getSubject);
    }

    public Date getExpirationDateFromToken(String token) {
        return getClaimFromToken(token, Claims::getExpiration);
    }

    public <T> T getClaimFromToken(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = getAllClaimsFromToken(token);
        return claimsResolver.apply(claims);
    }

    private Claims getAllClaimsFromToken(String token) {
        JwtParser parser = Jwts.parserBuilder()
                .setSigningKey(key)
                .build();
        
        return parser.parseClaimsJws(token).getBody();
    }

    private Boolean isTokenExpired(String token) {
        try {
            final Date expiration = getExpirationDateFromToken(token);
            return expiration.before(new Date());
        } catch (ExpiredJwtException e) {
            return true;
        }
    }

    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        // Add user roles to the claims, but avoid putting too much info in the token
        claims.put("authorities", userDetails.getAuthorities());
        return doGenerateToken(claims, userDetails.getUsername(), jwtExpiration);
    }
    
    public String generateRefreshToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("refresh", true);
        return doGenerateToken(claims, userDetails.getUsername(), jwtRefreshExpiration);
    }

    private String doGenerateToken(Map<String, Object> claims, String subject, long expiration) {
        long currentTimeMillis = System.currentTimeMillis();
        // Add a few seconds to not-before time to account for clock skew
        Date nbf = new Date(currentTimeMillis - 10000); // 10 seconds ago
        String tokenId = noncePrefix + "-" + java.util.UUID.randomUUID().toString();
        
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(new Date(currentTimeMillis))
                .setExpiration(new Date(currentTimeMillis + expiration))
                .setNotBefore(nbf) // Add not-before claim
                .setId(tokenId) // Add jti claim with instance-specific prefix
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public Boolean validateToken(String token, UserDetails userDetails) {
        try {
            final String username = getUsernameFromToken(token);
            
            // Check if basic conditions are met
            if (!username.equals(userDetails.getUsername()) || isTokenExpired(token)) {
                return false;
            }
            
            // Verify the token has expected claims
            Claims claims = getAllClaimsFromToken(token);
            Date now = new Date();
            
            // Verify not before date
            if (claims.getNotBefore() != null && claims.getNotBefore().after(now)) {
                return false;
            }
            
            // Verify issued at date is in the past
            if (claims.getIssuedAt() != null && claims.getIssuedAt().after(now)) {
                return false;
            }
            
            // Verify JTI presence (token ID)
            if (claims.getId() == null || !claims.getId().startsWith(noncePrefix)) {
                return false;
            }
            
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public Boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token);
            return !isTokenExpired(token);
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}