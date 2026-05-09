package kr.unit.backend.common.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import kr.unit.backend.common.api.ApiResponse;
import kr.unit.backend.common.config.JacksonConfig;
import kr.unit.backend.common.error.BusinessException;
import kr.unit.backend.common.error.ErrorCode;
import kr.unit.backend.users.repository.UserAccountRepository;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Component
public class AuthenticationFilter extends OncePerRequestFilter {

    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";

    private static final List<String> PERMIT_PREFIXES = List.of(
            "/v1/auth/session",
            "/v1/auth/student-card/verify",
            "/v1/ai/refine",
            "/v1/recap/",
            "/v1/health",
            "/actuator/"
    );

    private final JwtTokenProvider jwtTokenProvider;
    private final UserAccountRepository userAccountRepository;
    private final ObjectMapper objectMapper = JacksonConfig.baseMapper();

    public AuthenticationFilter(JwtTokenProvider jwtTokenProvider,
                                UserAccountRepository userAccountRepository) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.userAccountRepository = userAccountRepository;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return PERMIT_PREFIXES.stream().anyMatch(path::startsWith);
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain)
            throws ServletException, IOException {
        String header = request.getHeader(AUTHORIZATION_HEADER);
        if (header == null || !header.startsWith(BEARER_PREFIX)) {
            writeError(response, ErrorCode.AUTH_REQUIRED);
            return;
        }
        String token = header.substring(BEARER_PREFIX.length()).trim();
        try {
            JwtTokenProvider.ParsedSession session = jwtTokenProvider.parse(token);
            Optional<AuthenticatedUser> userOpt = userAccountRepository.findById(session.userId());
            AuthenticatedUser principal = userOpt
                    .map(u -> u.withSessionExpiresAt(session.expiresAt()))
                    .orElseGet(() -> new AuthenticatedUser(
                            session.userId(),
                            session.email(),
                            AuthenticatedUser.UserStatus.ACTIVE,
                            AuthenticatedUser.StudentVerificationStatus.RESERVED,
                            session.expiresAt()));

            if (principal.status() == AuthenticatedUser.UserStatus.SUSPENDED) {
                writeError(response, ErrorCode.USER_SUSPENDED);
                return;
            }
            if (principal.status() == AuthenticatedUser.UserStatus.WITHDRAWN) {
                writeError(response, ErrorCode.AUTH_INVALID);
                return;
            }

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(principal, token, List.of());
            SecurityContextHolder.getContext().setAuthentication(authentication);
            filterChain.doFilter(request, response);
        } catch (BusinessException ex) {
            writeError(response, ex.errorCode());
        }
    }

    private void writeError(HttpServletResponse response, ErrorCode code) throws IOException {
        response.setStatus(code.status().value());
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write(objectMapper.writeValueAsString(
                ApiResponse.error(code.name(), code.defaultMessage(), null)));
    }
}
