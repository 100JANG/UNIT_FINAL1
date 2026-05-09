package kr.unit.backend.users.dto;

import kr.unit.backend.users.domain.UserStats;

public record UserStatsResponse(
        long posts,
        long comments,
        long likesReceived,
        long scraps,
        long juryVotes
) {
    public static UserStatsResponse from(UserStats stats) {
        return new UserStatsResponse(
                stats.posts(),
                stats.comments(),
                stats.likesReceived(),
                stats.scraps(),
                stats.juryVotes());
    }
}
