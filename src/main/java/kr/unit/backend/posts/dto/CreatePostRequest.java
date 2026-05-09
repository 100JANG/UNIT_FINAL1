package kr.unit.backend.posts.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

public record CreatePostRequest(
        @NotBlank String boardId,
        @NotBlank @Size(min = 2, max = 80) String title,
        @NotBlank @Size(min = 10, max = 5000) String content,
        @Size(max = 5) List<@Size(max = 20) String> tags,
        Boolean isAnonymous
) {
}
