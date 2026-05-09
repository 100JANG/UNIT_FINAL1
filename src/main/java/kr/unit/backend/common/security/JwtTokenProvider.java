package kr.unit.backend.common.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import kr.unit.backend.common.error.BusinessException;
import kr.unit.backend.common.error.ErrorCode;
import kr.unit.backend.common.time.ClockProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;

@Component
public class JwtTokenProvider {

    private final SecretKey secretKey;
    private final String issuer;
    private final long sessionTtlSeconds;
    private final ClockProvider clockProvider;

    public JwtTokenProvider(
            @Value("${unit.jwt.secret}") String secret,
            @Value("${unit.jwt.issuer}") String issuer,
            @Value("${unit.jwt.session-ttl-seconds}") long sessionTtlSeconds,
            ClockProvider clockProvider) {
        if (secret == null || secret.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalStateException("unit.jwt.secret must be at least 32 bytes");
        }
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.issuer = issuer;
        this.sessionTtlSeconds = sessionTtlSeconds;
        this.clockProvider = clockProvider;
    }

    public IssuedSessionToken issue(String userId, String email) {
        Instant now = clockProvider.now();
        Instant expiresAt = now.plusSeconds(sessionTtlSeconds);

        String token = Jwts.builder()
                .issuer(issuer)
                .subject(userId)
                .claim("email", email)
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiresAt))
                .signWith(secretKey)
                .compact();

        return new IssuedSessionToken(token, expiresAt);
    }

    public ParsedSession parse(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(secretKey)
                    .requireIssuer(issuer)
                    .clock(() -> Date.from(clockProvider.now()))
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            String userId = claims.getSubject();
            String email = claims.get("email", String.class);
            return new ParsedSession(userId, email, claims.getExpiration().toInstant());
        } catch (ExpiredJwtException e) {
            throw new BusinessException(ErrorCode.AUTH_EXPIRED);
        } catch (JwtException | IllegalArgumentException e) {
            throw new BusinessException(ErrorCode.AUTH_INVALID);
        }
    }

    public record IssuedSessionToken(String token, Instant expiresAt) {
    }

    public record ParsedSession(String userId, String email, Instant expiresAt) {
    }
}
