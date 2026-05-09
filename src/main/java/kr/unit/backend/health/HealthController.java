package kr.unit.backend.health;

import kr.unit.backend.common.api.ApiResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/v1/health")
public class HealthController {

    @GetMapping
    public ApiResponse<Map<String, Object>> health() {
        return ApiResponse.success(Map.of(
                "status", "OK",
                "service", "unit-backend",
                "timestamp", Instant.now().toString()));
    }
}
