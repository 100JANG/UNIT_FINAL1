package kr.unit.backend.reserved;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import kr.unit.backend.common.config.JacksonConfig;
import kr.unit.backend.common.error.ErrorCode;
import kr.unit.backend.reserved.controller.ReservedFeatureController;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Reserved 기능 endpoint가 절대로 200 OK / 실제 결과를 반환하지 않음을 검증한다.
 *
 * 계약:
 *  - HTTP 501 Not Implemented
 *  - body.code = "FEATURE_RESERVED"
 *  - body.message = "현재 버전에서 구현하지 않는 예약 기능입니다."
 *  - body.result = null
 */
class ReservedFeatureContractTest {

    private final ReservedFeatureController controller = new ReservedFeatureController();
    private final ObjectMapper mapper = JacksonConfig.baseMapper();

    @Test
    void studentCardOcrReturnsFeatureReserved() {
        assertReserved(controller.verifyStudentCard());
    }

    @Test
    void aiRefineReturnsFeatureReserved() {
        assertReserved(controller.aiRefine());
    }

    @Test
    void recapReturnsFeatureReserved() {
        assertReserved(controller.recap("2026-1"));
    }

    @Test
    void schoolRecapReturnsFeatureReserved() {
        assertReserved(controller.schoolRecap("ajou", "2026-1"));
    }

    private void assertReserved(ResponseEntity<?> response) {
        assertThat(response.getStatusCode().value()).isEqualTo(501);
        assertThat(response.getStatusCode()).isEqualTo(ErrorCode.FEATURE_RESERVED.status());

        JsonNode node = mapper.valueToTree(response.getBody());
        assertThat(node.get("code").asText()).isEqualTo("FEATURE_RESERVED");
        assertThat(node.get("message").asText()).isEqualTo("현재 버전에서 구현하지 않는 예약 기능입니다.");
        assertThat(node.get("result").isNull()).isTrue();
    }
}
