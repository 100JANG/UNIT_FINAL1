package kr.unit.backend.users.dto;

import java.time.Instant;

/**
 * /v1/users/me 응답.
 *
 * studentNumberMasked는 masking된 학번이며 원본 studentNumber는 절대 노출하지 않는다.
 * enrollmentStatus는 학생증 OCR / 학적 검증이 Reserved 상태이므로 RESERVED로 시작하며 학교 이메일 검증으로 임의 승격되지 않는다.
 * sessionExpiresAt은 현재 sessionToken의 만료 시각으로, AuthenticationFilter가 JWT에서 추출해 principal에 주입한다.
 */
public record UserProfileResponse(
        String userId,
        String name,
        String schoolId,
        String schoolName,
        String departmentId,
        String departmentName,
        String studentNumberMasked,
        String enrollmentStatus,
        Instant sessionExpiresAt
) {
}
