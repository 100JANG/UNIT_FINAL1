package kr.unit.backend.firebase;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "unit.firebase")
public record FirebaseProperties(
        String projectId,
        String databaseUrl,
        String credentialsPath,
        boolean enabled
) {
}
