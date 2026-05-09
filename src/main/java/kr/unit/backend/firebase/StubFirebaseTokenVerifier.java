package kr.unit.backend.firebase;

import kr.unit.backend.common.error.BusinessException;
import kr.unit.backend.common.error.ErrorCode;
import kr.unit.backend.common.security.FirebaseTokenVerifier;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

/**
 * Firebase가 비활성화된 로컬/테스트 환경에서 사용되는 fallback 검증기.
 * 형식이 'stub:&lt;uid&gt;:&lt;email&gt;'인 토큰만 받아들이고 그 외는 AUTH_INVALID로 거부한다.
 *
 * 운영 환경에서는 FirebaseAdminTokenVerifier가 활성화되어 이 구현은 사용되지 않는다.
 */
@Component
@ConditionalOnProperty(prefix = "unit.firebase", name = "enabled", havingValue = "false", matchIfMissing = true)
public class StubFirebaseTokenVerifier implements FirebaseTokenVerifier {

    private static final Logger log = LoggerFactory.getLogger(StubFirebaseTokenVerifier.class);
    private static final String PREFIX = "stub:";

    public StubFirebaseTokenVerifier() {
        log.warn("Using StubFirebaseTokenVerifier (Firebase disabled). Do not use in production.");
    }

    @Override
    public VerifiedFirebaseToken verify(String firebaseIdToken) {
        if (firebaseIdToken == null || firebaseIdToken.isBlank()) {
            throw new BusinessException(ErrorCode.AUTH_REQUIRED);
        }
        if (!firebaseIdToken.startsWith(PREFIX)) {
            throw new BusinessException(ErrorCode.AUTH_INVALID);
        }
        String[] parts = firebaseIdToken.substring(PREFIX.length()).split(":", 2);
        if (parts.length != 2 || parts[0].isBlank() || parts[1].isBlank()) {
            throw new BusinessException(ErrorCode.AUTH_INVALID);
        }
        return new VerifiedFirebaseToken(parts[0], parts[1], true);
    }
}
