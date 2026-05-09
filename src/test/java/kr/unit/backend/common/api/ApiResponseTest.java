package kr.unit.backend.common.api;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class ApiResponseTest {

    @Test
    void successHasFixedCode() {
        ApiResponse<String> r = ApiResponse.success("hello");
        assertThat(r.code()).isEqualTo("SUCCESS");
        assertThat(r.message()).isEqualTo("Success");
        assertThat(r.result()).isEqualTo("hello");
    }

    @Test
    void successWithMessage() {
        ApiResponse<String> r = ApiResponse.success("게시글 작성", "x");
        assertThat(r.code()).isEqualTo("SUCCESS");
        assertThat(r.message()).isEqualTo("게시글 작성");
        assertThat(r.result()).isEqualTo("x");
    }

    @Test
    void errorPropagatesAllFields() {
        ApiResponse<String> r = ApiResponse.error("FOO", "bar", "baz");
        assertThat(r.code()).isEqualTo("FOO");
        assertThat(r.message()).isEqualTo("bar");
        assertThat(r.result()).isEqualTo("baz");
    }
}
