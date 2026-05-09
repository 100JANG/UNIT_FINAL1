package kr.unit.backend.jury.service;

import kr.unit.backend.common.error.BusinessException;
import kr.unit.backend.common.error.ErrorCode;
import kr.unit.backend.common.security.AuthenticatedUser;
import kr.unit.backend.jury.domain.JuryVerdict;
import kr.unit.backend.jury.dto.JuryVoteRequest;
import kr.unit.backend.jury.repository.JuryFirebaseRepository;
import kr.unit.backend.support.FakeRealtimeDatabaseClient;
import kr.unit.backend.support.FixedClockProvider;
import kr.unit.backend.support.FixtureFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JuryServiceTest {

    private FakeRealtimeDatabaseClient fakeDb;
    private JuryService service;

    @BeforeEach
    void setUp() {
        fakeDb = new FakeRealtimeDatabaseClient();
        service = new JuryService(new JuryFirebaseRepository(fakeDb),
                FixedClockProvider.at("2026-05-09T00:00:00Z"));

        fakeDb.set("/jury_cases/case_1", Map.of(
                "caseId", "case_1",
                "departmentId", "ajou_csi",
                "status", "OPEN",
                "summonedJurors", List.of("u_a", "u_b"),
                "createdAt", "2026-05-08T00:00:00Z",
                "closesAt", "2026-05-10T00:00:00Z"));
    }

    @Test
    void getCase_rejectsNonSummonedJuror() {
        AuthenticatedUser outsider = FixtureFactory.authenticated("u_outsider", "x@ajou.ac.kr");
        assertThatThrownBy(() -> service.getCase("case_1", outsider))
                .isInstanceOf(BusinessException.class)
                .extracting(ex -> ((BusinessException) ex).errorCode())
                .isEqualTo(ErrorCode.JURY_NOT_AUTHORIZED);
    }

    @Test
    void vote_rejectsNonSummonedJuror() {
        AuthenticatedUser outsider = FixtureFactory.authenticated("u_outsider", "x@ajou.ac.kr");
        assertThatThrownBy(() -> service.vote("case_1", outsider,
                new JuryVoteRequest(JuryVerdict.PROBLEMATIC)))
                .isInstanceOf(BusinessException.class)
                .extracting(ex -> ((BusinessException) ex).errorCode())
                .isEqualTo(ErrorCode.JURY_NOT_AUTHORIZED);
    }

    @Test
    void vote_rejectsDuplicateVote() {
        AuthenticatedUser juror = FixtureFactory.authenticated("u_a", "a@ajou.ac.kr");
        service.vote("case_1", juror, new JuryVoteRequest(JuryVerdict.OK));

        assertThatThrownBy(() -> service.vote("case_1", juror,
                new JuryVoteRequest(JuryVerdict.PROBLEMATIC)))
                .isInstanceOf(BusinessException.class)
                .extracting(ex -> ((BusinessException) ex).errorCode())
                .isEqualTo(ErrorCode.JURY_ALREADY_VOTED);
    }

    @Test
    void vote_rejectsClosedCase() {
        fakeDb.set("/jury_cases/case_closed", Map.of(
                "caseId", "case_closed",
                "departmentId", "ajou_csi",
                "status", "CLOSED_EXPIRED",
                "summonedJurors", List.of("u_a"),
                "createdAt", "2026-05-01T00:00:00Z",
                "closesAt", "2026-05-02T00:00:00Z"));

        AuthenticatedUser juror = FixtureFactory.authenticated("u_a", "a@ajou.ac.kr");
        assertThatThrownBy(() -> service.vote("case_closed", juror,
                new JuryVoteRequest(JuryVerdict.OK)))
                .isInstanceOf(BusinessException.class)
                .extracting(ex -> ((BusinessException) ex).errorCode())
                .isEqualTo(ErrorCode.JURY_WINDOW_CLOSED);
    }

    @Test
    void vote_rejectsCaseAfterClosesAt() {
        fakeDb.set("/jury_cases/case_late", Map.of(
                "caseId", "case_late",
                "departmentId", "ajou_csi",
                "status", "OPEN",
                "summonedJurors", List.of("u_a"),
                "createdAt", "2026-05-01T00:00:00Z",
                "closesAt", "2026-05-08T00:00:00Z"));

        AuthenticatedUser juror = FixtureFactory.authenticated("u_a", "a@ajou.ac.kr");
        assertThatThrownBy(() -> service.vote("case_late", juror,
                new JuryVoteRequest(JuryVerdict.OK)))
                .isInstanceOf(BusinessException.class)
                .extracting(ex -> ((BusinessException) ex).errorCode())
                .isEqualTo(ErrorCode.JURY_WINDOW_CLOSED);
    }
}
