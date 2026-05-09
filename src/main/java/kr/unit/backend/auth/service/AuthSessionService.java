package kr.unit.backend.auth.service;

import kr.unit.backend.auth.dto.AuthRefreshRequest;
import kr.unit.backend.auth.dto.AuthSessionRequest;
import kr.unit.backend.auth.dto.AuthSessionResponse;
import kr.unit.backend.common.error.BusinessException;
import kr.unit.backend.common.error.ErrorCode;
import kr.unit.backend.common.security.FirebaseTokenVerifier;
import kr.unit.backend.common.security.JwtTokenProvider;
import kr.unit.backend.common.time.ClockProvider;
import kr.unit.backend.users.domain.UserAccount;
import kr.unit.backend.users.repository.UserAccountRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class AuthSessionService {

    private static final Logger log = LoggerFactory.getLogger(AuthSessionService.class);

    private final FirebaseTokenVerifier firebaseTokenVerifier;
    private final JwtTokenProvider jwtTokenProvider;
    private final FirebaseCustomTokenIssuer firebaseCustomTokenIssuer;
    private final UserAccountRepository userAccountRepository;
    private final ClockProvider clockProvider;

    public AuthSessionService(FirebaseTokenVerifier firebaseTokenVerifier,
                              JwtTokenProvider jwtTokenProvider,
                              FirebaseCustomTokenIssuer firebaseCustomTokenIssuer,
                              UserAccountRepository userAccountRepository,
                              ClockProvider clockProvider) {
        this.firebaseTokenVerifier = firebaseTokenVerifier;
        this.jwtTokenProvider = jwtTokenProvider;
        this.firebaseCustomTokenIssuer = firebaseCustomTokenIssuer;
        this.userAccountRepository = userAccountRepository;
        this.clockProvider = clockProvider;
    }

    public AuthSessionResponse issueSession(AuthSessionRequest request) {
        FirebaseTokenVerifier.VerifiedFirebaseToken verified =
                firebaseTokenVerifier.verify(request.firebaseIdToken());

        UserAccount account = userAccountRepository.findAccount(verified.firebaseUid())
                .orElseGet(() -> createMinimalAccount(verified));

        if (account.status() == UserAccount.Status.SUSPENDED) {
            throw new BusinessException(ErrorCode.USER_SUSPENDED);
        }
        if (account.status() == UserAccount.Status.WITHDRAWN) {
            throw new BusinessException(ErrorCode.AUTH_INVALID);
        }

        JwtTokenProvider.IssuedSessionToken session = jwtTokenProvider.issue(account.userId(), account.email());
        String customToken = firebaseCustomTokenIssuer.issue(account.userId());

        log.debug("Session issued: userId={} expiresAt={}", account.userId(), session.expiresAt());

        return new AuthSessionResponse(
                account.userId(),
                session.token(),
                customToken,
                session.expiresAt(),
                account.studentVerificationStatus().name());
    }

    public AuthSessionResponse refresh(AuthRefreshRequest request) {
        JwtTokenProvider.ParsedSession parsed = jwtTokenProvider.parse(request.sessionToken());
        UserAccount account = userAccountRepository.findAccount(parsed.userId())
                .orElseThrow(() -> new BusinessException(ErrorCode.AUTH_INVALID));

        if (account.status() != UserAccount.Status.ACTIVE) {
            throw new BusinessException(ErrorCode.USER_SUSPENDED);
        }

        JwtTokenProvider.IssuedSessionToken session = jwtTokenProvider.issue(account.userId(), account.email());
        String customToken = firebaseCustomTokenIssuer.issue(account.userId());
        return new AuthSessionResponse(
                account.userId(),
                session.token(),
                customToken,
                session.expiresAt(),
                account.studentVerificationStatus().name());
    }

    public void logout(String userId) {
        // 세션 폐기 정책은 stateless JWT이므로 별도 RTDB session 노드 cleanup만 수행한다.
        // 별도 sessions 노드 관리 정책은 후속 ADR 결정. 현재는 NoOp.
        log.debug("Logout requested: userId={}", userId);
    }

    private UserAccount createMinimalAccount(FirebaseTokenVerifier.VerifiedFirebaseToken verified) {
        Instant now = clockProvider.now();
        UserAccount account = new UserAccount(
                verified.firebaseUid(),
                verified.email(),
                deriveDisplayName(verified.email()),
                null,
                null,
                null,
                UserAccount.StudentVerificationStatus.RESERVED,
                UserAccount.Status.ACTIVE,
                now,
                now);
        userAccountRepository.save(account);
        log.info("Created minimal user account: userId={}", account.userId());
        return account;
    }

    private static String deriveDisplayName(String email) {
        if (email == null || !email.contains("@")) {
            return "사용자";
        }
        return email.substring(0, email.indexOf('@'));
    }
}
