package kr.unit.backend.firebase;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import kr.unit.backend.auth.service.FirebaseCustomTokenIssuer;
import kr.unit.backend.common.error.BusinessException;
import kr.unit.backend.common.error.ErrorCode;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(prefix = "unit.firebase", name = "enabled", havingValue = "true")
public class FirebaseAdminCustomTokenIssuer implements FirebaseCustomTokenIssuer {

    private final FirebaseAuth firebaseAuth;

    public FirebaseAdminCustomTokenIssuer(FirebaseAuth firebaseAuth) {
        this.firebaseAuth = firebaseAuth;
    }

    @Override
    public String issue(String userId) {
        try {
            return firebaseAuth.createCustomToken(userId);
        } catch (FirebaseAuthException ex) {
            throw new BusinessException(ErrorCode.SERVICE_UNAVAILABLE);
        }
    }
}
