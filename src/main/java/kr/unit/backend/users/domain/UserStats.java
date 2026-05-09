package kr.unit.backend.users.domain;

/**
 * 사용자 활동 통계 read model. /user_stats/{userId}와 1:1 매핑되거나, 인덱스에서 계산해 채운다.
 *
 * 정의:
 *  - posts: 작성한 글 누적 수
 *  - comments: 작성한 댓글 누적 수
 *  - likesReceived: 내 글이 받은 누적 좋아요 수 (직접 계산이 비싸므로 user_stats 노드가 없으면 0 fallback)
 *  - scraps: 스크랩한 글 수 (Scrap 도메인은 미구현이라 user_stats 없으면 0)
 *  - juryVotes: 배심원 투표 참여 누적 수 (user_jury_votes 인덱스가 별도이므로 user_stats 없으면 0)
 */
public record UserStats(
        long posts,
        long comments,
        long likesReceived,
        long scraps,
        long juryVotes
) {
    public static UserStats zero() {
        return new UserStats(0L, 0L, 0L, 0L, 0L);
    }
}
