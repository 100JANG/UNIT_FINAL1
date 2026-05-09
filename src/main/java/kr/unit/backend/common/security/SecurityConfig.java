package kr.unit.backend.common.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletResponse;
import kr.unit.backend.common.api.ApiResponse;
import kr.unit.backend.common.config.JacksonConfig;
import kr.unit.backend.common.error.ErrorCode;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
public class SecurityConfig {

    private static final String[] PUBLIC_PATHS = {
            "/v1/auth/session",
            "/v1/auth/student-card/verify",
            "/v1/ai/refine",
            "/v1/recap/**",
            "/v1/health",
            "/actuator/**"
    };

    private final AuthenticationFilter authenticationFilter;
    private final CorsConfigurationSource corsConfigurationSource;
    private final ObjectMapper objectMapper = JacksonConfig.baseMapper();

    public SecurityConfig(AuthenticationFilter authenticationFilter,
                          CorsConfigurationSource corsConfigurationSource) {
        this.authenticationFilter = authenticationFilter;
        this.corsConfigurationSource = corsConfigurationSource;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .csrf(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .logout(AbstractHttpConfigurer::disable)
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(PUBLIC_PATHS).permitAll()
                        .anyRequest().authenticated())
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(new HttpStatusEntryPoint(org.springframework.http.HttpStatus.UNAUTHORIZED))
                        .accessDeniedHandler(accessDeniedHandler()))
                .addFilterBefore(authenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    private AccessDeniedHandler accessDeniedHandler() {
        return (request, response, accessDeniedException) -> {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write(objectMapper.writeValueAsString(
                    ApiResponse.error(
                            ErrorCode.FORBIDDEN.name(),
                            ErrorCode.FORBIDDEN.defaultMessage(),
                            null)));
        };
    }
}
