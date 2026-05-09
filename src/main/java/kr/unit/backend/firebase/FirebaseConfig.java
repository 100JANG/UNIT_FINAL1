package kr.unit.backend.firebase;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.database.FirebaseDatabase;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.FileInputStream;
import java.io.IOException;

/**
 * Firebase Admin SDK 설정. 실제 자격증명은 환경변수가 가리키는 파일에서만 로드한다.
 * 코드/리소스/저장소에 자격증명을 두지 않는다.
 *
 * unit.firebase.enabled=false 인 환경(local/test 기본값)에서는 빈을 만들지 않는다.
 * 그 환경에서 RealtimeDatabaseClient는 별도 NoOp 또는 Fake 구현이 사용된다.
 */
@Configuration
@EnableConfigurationProperties(FirebaseProperties.class)
@ConditionalOnProperty(prefix = "unit.firebase", name = "enabled", havingValue = "true")
public class FirebaseConfig {

    private static final Logger log = LoggerFactory.getLogger(FirebaseConfig.class);

    private final FirebaseProperties properties;

    public FirebaseConfig(FirebaseProperties properties) {
        this.properties = properties;
    }

    @Bean
    public FirebaseApp firebaseApp() throws IOException {
        if (properties.credentialsPath() == null || properties.credentialsPath().isBlank()) {
            throw new IllegalStateException("FIREBASE_CREDENTIALS_PATH must be set when unit.firebase.enabled=true");
        }
        if (properties.databaseUrl() == null || properties.databaseUrl().isBlank()) {
            throw new IllegalStateException("FIREBASE_DATABASE_URL must be set when unit.firebase.enabled=true");
        }
        try (FileInputStream credentialsStream = new FileInputStream(properties.credentialsPath())) {
            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(credentialsStream))
                    .setProjectId(properties.projectId())
                    .setDatabaseUrl(properties.databaseUrl())
                    .build();
            log.info("Initializing Firebase project={} dbUrl={}", properties.projectId(), properties.databaseUrl());
            return FirebaseApp.getApps().isEmpty()
                    ? FirebaseApp.initializeApp(options)
                    : FirebaseApp.getInstance();
        }
    }

    @Bean
    public FirebaseAuth firebaseAuth(FirebaseApp app) {
        return FirebaseAuth.getInstance(app);
    }

    @Bean
    public FirebaseDatabase firebaseDatabase(FirebaseApp app) {
        return FirebaseDatabase.getInstance(app);
    }
}
