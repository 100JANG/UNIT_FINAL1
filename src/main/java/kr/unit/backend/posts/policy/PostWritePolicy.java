package kr.unit.backend.posts.policy;

import kr.unit.backend.common.error.BusinessException;
import kr.unit.backend.common.error.ErrorCode;
import kr.unit.backend.common.error.ValidationFailureDetail;
import kr.unit.backend.posts.dto.CreatePostRequest;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * 게시글 작성 도메인 정책. AI 다듬기 / 분탕 감지 / 룰 모더레이션은 Reserved.
 * 여기서는 데이터 무결성만 검증한다 (제목/본문 길이는 DTO @Size로 1차 검증되며, 여기서는 비즈니스 무결성만 본다).
 */
@Component
public class PostWritePolicy {

    public void validate(CreatePostRequest request) {
        List<ValidationFailureDetail.FieldError> errors = new ArrayList<>();

        if (request.boardId() == null || request.boardId().isBlank()) {
            errors.add(new ValidationFailureDetail.FieldError("boardId", "boardId는 필수입니다"));
        }
        if (request.title() != null) {
            int len = request.title().trim().length();
            if (len < 2 || len > 80) {
                errors.add(new ValidationFailureDetail.FieldError("title", "제목은 2~80자여야 합니다"));
            }
        }
        if (request.content() != null) {
            int len = request.content().trim().length();
            if (len < 10 || len > 5000) {
                errors.add(new ValidationFailureDetail.FieldError("content", "본문은 10~5000자여야 합니다"));
            }
        }
        if (request.tags() != null && request.tags().size() > 5) {
            errors.add(new ValidationFailureDetail.FieldError("tags", "태그는 최대 5개까지 가능합니다"));
        }

        if (!errors.isEmpty()) {
            throw new BusinessException(
                    ErrorCode.VALIDATION_FAILED,
                    ErrorCode.VALIDATION_FAILED.defaultMessage(),
                    new ValidationFailureDetail(errors));
        }
    }
}
