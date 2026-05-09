package kr.unit.backend.posts.service;

import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class PostIdGenerator {

    public String generatePostId() {
        return "p_" + shortUuid();
    }

    public String generateReportId() {
        return "r_" + shortUuid();
    }

    public String generateCommentId() {
        return "c_" + shortUuid();
    }

    public String generateAnonymousId() {
        return "익명_" + UUID.randomUUID().toString().substring(0, 4);
    }

    private static String shortUuid() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 12);
    }
}
