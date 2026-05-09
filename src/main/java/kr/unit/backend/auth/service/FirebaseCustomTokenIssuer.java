package kr.unit.backend.auth.service;

/**
 * Firebase Custom Token 발급 추상화.
 * 프론트가 RTDB read subscription 시 사용할 토큰을 백엔드에서 발급한다.
 *
 * 환경에 따라 두 가지 구현이 자동 선택된다:
 *   - FirebaseAdminCustomTokenIssuer: 운영 환경 (Firebase Admin SDK 사용)
 *   - StubFirebaseCustomTokenIssuer: 로컬/테스트 환경
 */
public interface FirebaseCustomTokenIssuer {

    String issue(String userId);
}
