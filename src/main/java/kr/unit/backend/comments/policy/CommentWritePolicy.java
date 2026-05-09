package kr.unit.backend.comments.policy;

import kr.unit.backend.comments.dto.CreateCommentRequest;
import kr.unit.backend.common.error.BusinessException;
import kr.unit.backend.common.error.ErrorCode;
import kr.unit.backend.common.error.ValidationFailureDetail;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * 댓글 작성 도메인 정책. AI moderation/룰 기반 검열은 Reserved이므로 데이터 무결성 검증만 한다.
 *
 * 명시적 금지: 금칙어 필터, RuleModerationService, 반복 문자/URL 감지 같은 임시 moderation은 만들지 않는다.
 *           (domain/03_POSTS_COMMENTS_DOMAIN.md §2 참고)
 */
@Component
public class CommentWritePolicy {

    public void validate(CreateCommentRequest request) {
        List<ValidationFailureDetail.FieldError> errors = new ArrayList<>();

        if (request.content() == null || request.content().trim().isEmpty()) {
            errors.add(new ValidationFailureDetail.FieldError("content", "댓글 내용은 비어있을 수 없습니다"));
        } else {
            int len = request.content().trim().length();
            if (len < 1 || len > 1000) {
                errors.add(new ValidationFailureDetail.FieldError("content", "댓글은 1~1000자여야 합니다"));
            }
        }

        if (!errors.isEmpty()) {
            throw new BusinessException(
                    ErrorCode.VALIDATION_FAILED,
                    ErrorCode.VALIDATION_FAILED.defaultMessage(),
                    new ValidationFailureDetail(errors));
        }
    }
}
