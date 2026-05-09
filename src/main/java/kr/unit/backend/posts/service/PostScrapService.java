package kr.unit.backend.posts.service;

import kr.unit.backend.common.error.BusinessException;
import kr.unit.backend.common.error.ErrorCode;
import kr.unit.backend.common.security.AuthenticatedUser;
import kr.unit.backend.common.time.ClockProvider;
import kr.unit.backend.posts.domain.Post;
import kr.unit.backend.posts.dto.PostScrapResponse;
import kr.unit.backend.posts.repository.PostFirebaseRepository;
import kr.unit.backend.posts.repository.PostScrapFirebaseRepository;
import kr.unit.backend.posts.repository.PostScrapFirebaseRepository.ScrapToggleResult;
import org.springframework.stereotype.Service;

/**
 * 게시글 스크랩 toggle 서비스.
 *
 * 정책:
 *  - 인증 사용자만 호출 가능 (Controller에서 강제)
 *  - postId가 없으면 NOT_FOUND
 *  - 삭제된 글(soft-deleted)은 NOT_FOUND로 응답 (PostService.getDetail와 동일 패턴)
 *  - 본인 글 스크랩 허용
 *  - 같은 사용자 재호출 시 toggle (등록 ↔ 취소)
 *  - 카운터는 음수가 되지 않도록 Repository 단계에서 floor(0) 보호
 */
@Service
public class PostScrapService {

    private final PostFirebaseRepository postFirebaseRepository;
    private final PostScrapFirebaseRepository postScrapFirebaseRepository;
    private final ClockProvider clockProvider;

    public PostScrapService(PostFirebaseRepository postFirebaseRepository,
                            PostScrapFirebaseRepository postScrapFirebaseRepository,
                            ClockProvider clockProvider) {
        this.postFirebaseRepository = postFirebaseRepository;
        this.postScrapFirebaseRepository = postScrapFirebaseRepository;
        this.clockProvider = clockProvider;
    }

    public PostScrapResponse toggleScrap(String postId, AuthenticatedUser user) {
        Post post = postFirebaseRepository.findById(postId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));

        if (post.status() != Post.Status.PUBLISHED) {
            throw new BusinessException(ErrorCode.NOT_FOUND);
        }

        boolean wasScrapped = postScrapFirebaseRepository.isScrapped(postId, user.userId());
        ScrapToggleResult result = wasScrapped
                ? postScrapFirebaseRepository.removeScrap(postId, user.userId())
                : postScrapFirebaseRepository.addScrap(postId, user.userId(), clockProvider.now());

        return new PostScrapResponse(postId, result.scrapped(), result.totalPostScraps());
    }
}
