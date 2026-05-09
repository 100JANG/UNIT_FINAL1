package kr.unit.backend.firebase;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import kr.unit.backend.common.error.BusinessException;
import kr.unit.backend.common.error.ErrorCode;
import kr.unit.backend.common.security.FirebaseTokenVerifier;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(prefix = "unit.firebase", name = "enabled", havingValue = "true")
public class FirebaseAdminTokenVerifier implements FirebaseTokenVerifier {

    private final FirebaseAuth firebaseAuth;

    public FirebaseAdminTokenVerifier(FirebaseAuth firebaseAuth) {
        this.firebaseAuth = firebaseAuth;
    }

    @Override
    public VerifiedFirebaseToken verify(String firebaseIdToken) {
        if (firebaseIdToken == null || firebaseIdToken.isBlank()) {
            throw new BusinessException(ErrorCode.AUTH_REQUIRED);
        }
        try {
            FirebaseToken decoded = firebaseAuth.verifyIdToken(firebaseIdToken, true);
            return new VerifiedFirebaseToken(decoded.getUid(), decoded.getEmail(), decoded.isEmailVerified());
        } catch (FirebaseAuthException ex) {
            throw new BusinessException(ErrorCode.AUTH_INVALID);
        }
    }
}
