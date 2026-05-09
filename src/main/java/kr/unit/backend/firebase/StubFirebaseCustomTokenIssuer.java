package kr.unit.backend.firebase;

import kr.unit.backend.auth.service.FirebaseCustomTokenIssuer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(prefix = "unit.firebase", name = "enabled", havingValue = "false", matchIfMissing = true)
public class StubFirebaseCustomTokenIssuer implements FirebaseCustomTokenIssuer {

    private static final Logger log = LoggerFactory.getLogger(StubFirebaseCustomTokenIssuer.class);

    public StubFirebaseCustomTokenIssuer() {
        log.warn("Using StubFirebaseCustomTokenIssuer (Firebase disabled). Do not use in production.");
    }

    @Override
    public String issue(String userId) {
        return "stub-custom-token:" + userId;
    }
}
