package kr.unit.backend.jury.service;

import kr.unit.backend.common.error.BusinessException;
import kr.unit.backend.common.error.ErrorCode;
import kr.unit.backend.common.security.AuthenticatedUser;
import kr.unit.backend.common.time.ClockProvider;
import kr.unit.backend.jury.domain.JuryCase;
import kr.unit.backend.jury.domain.JuryCaseStatus;
import kr.unit.backend.jury.dto.JuryCaseResponse;
import kr.unit.backend.jury.dto.JuryVoteRequest;
import kr.unit.backend.jury.dto.JuryVoteResponse;
import kr.unit.backend.jury.repository.JuryFirebaseRepository;
import org.springframework.stereotype.Service;

import java.util.Map;

/**
 * Jury 서비스. 수동 생성된 case의 조회와 투표만 담당한다.
 *
 * 명시적 금지 (domain/05): 신고 직후 case 자동 생성, AI 판정 기반 자동 호출, 자동 제재.
 *           Reports → JuryCase 흐름은 만들지 않는다.
 */
@Service
public class JuryService {

    private final JuryFirebaseRepository juryFirebaseRepository;
    private final ClockProvider clockProvider;

    public JuryService(JuryFirebaseRepository juryFirebaseRepository, ClockProvider clockProvider) {
        this.juryFirebaseRepository = juryFirebaseRepository;
        this.clockProvider = clockProvider;
    }

    public JuryCaseResponse getCase(String caseId, AuthenticatedUser user) {
        JuryCase juryCase = juryFirebaseRepository.findCase(caseId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));

        if (!juryCase.summonedJurors().contains(user.userId())) {
            throw new BusinessException(ErrorCode.JURY_NOT_AUTHORIZED);
        }
        return JuryCaseResponse.from(juryCase);
    }

    public JuryVoteResponse vote(String caseId, AuthenticatedUser user, JuryVoteRequest request) {
        JuryCase juryCase = juryFirebaseRepository.findCase(caseId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));

        if (juryCase.status() != JuryCaseStatus.OPEN) {
            throw new BusinessException(ErrorCode.JURY_WINDOW_CLOSED);
        }
        if (juryCase.closesAt() != null && clockProvider.now().isAfter(juryCase.closesAt())) {
            throw new BusinessException(ErrorCode.JURY_WINDOW_CLOSED);
        }
        if (!juryCase.summonedJurors().contains(user.userId())) {
            throw new BusinessException(ErrorCode.JURY_NOT_AUTHORIZED);
        }
        if (juryFirebaseRepository.hasVoted(caseId, user.userId())) {
            throw new BusinessException(ErrorCode.JURY_ALREADY_VOTED);
        }

        juryFirebaseRepository.recordVote(caseId, user.userId(), request.verdict(), clockProvider.now());
        Map<String, Long> stats = juryFirebaseRepository.findStats(caseId);
        return new JuryVoteResponse(
                caseId,
                user.userId(),
                request.verdict().name(),
                stats.getOrDefault("problematic", 0L),
                stats.getOrDefault("ok", 0L));
    }
}
