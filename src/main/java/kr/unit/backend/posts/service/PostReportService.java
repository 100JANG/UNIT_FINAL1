package kr.unit.backend.posts.service;

import kr.unit.backend.common.error.BusinessException;
import kr.unit.backend.common.error.ErrorCode;
import kr.unit.backend.common.security.AuthenticatedUser;
import kr.unit.backend.common.time.ClockProvider;
import kr.unit.backend.posts.dto.ReportCreatedResponse;
import kr.unit.backend.posts.dto.ReportPostRequest;
import kr.unit.backend.posts.repository.PostFirebaseRepository;
import kr.unit.backend.posts.repository.PostReportFirebaseRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * 신고 접수 서비스. 접수까지만 처리한다.
 *
 * 명시적 금지: AI 신고 판정, 자동 jury case 생성, 자동 제재, 같은 학과 30명 자동 호출.
 *           이 서비스는 신고 데이터를 저장하고 응답을 반환하는 것이 전부다. (domain/05_REPORTS_JURY_DOMAIN.md)
 */
@Service
public class PostReportService {

    private static final Logger log = LoggerFactory.getLogger(PostReportService.class);

    private final PostFirebaseRepository postFirebaseRepository;
    private final PostReportFirebaseRepository postReportFirebaseRepository;
    private final PostIdGenerator postIdGenerator;
    private final ClockProvider clockProvider;

    public PostReportService(PostFirebaseRepository postFirebaseRepository,
                             PostReportFirebaseRepository postReportFirebaseRepository,
                             PostIdGenerator postIdGenerator,
                             ClockProvider clockProvider) {
        this.postFirebaseRepository = postFirebaseRepository;
        this.postReportFirebaseRepository = postReportFirebaseRepository;
        this.postIdGenerator = postIdGenerator;
        this.clockProvider = clockProvider;
    }

    public ReportCreatedResponse report(String postId, AuthenticatedUser reporter, ReportPostRequest request) {
        if (postFirebaseRepository.findById(postId).isEmpty()) {
            throw new BusinessException(ErrorCode.NOT_FOUND);
        }
        if (postReportFirebaseRepository.existsByReporterAndPost(postId, reporter.userId())) {
            throw new BusinessException(ErrorCode.REPORT_DUPLICATE);
        }

        String reportId = postIdGenerator.generateReportId();
        postReportFirebaseRepository.save(
                reportId,
                postId,
                reporter.userId(),
                request.reason(),
                request.detail(),
                clockProvider.now());

        log.debug("Report received: reportId={} postId={} reporterId={}", reportId, postId, reporter.userId());
        return new ReportCreatedResponse(reportId, "RECEIVED");
    }
}
