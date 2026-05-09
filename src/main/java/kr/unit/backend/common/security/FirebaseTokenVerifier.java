package kr.unit.backend.common.security;

public interface FirebaseTokenVerifier {

    /**
     * Firebase ID Token을 검증하고 결과를 반환한다.
     * 실패 시 BusinessException(AUTH_INVALID) 등을 던진다.
     */
    VerifiedFirebaseToken verify(String firebaseIdToken);

    record VerifiedFirebaseToken(String firebaseUid, String email, boolean emailVerified) {
    }
}
