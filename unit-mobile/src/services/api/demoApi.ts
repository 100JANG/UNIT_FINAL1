// DEMO_MODE_START
// 시연용 코드: 운영 환경에서는 비활성화되어야 한다.
//
// POST /v1/dev/demo-login — 백엔드의 DemoAuthController(@ConditionalOnProperty
// app.demo.enabled=true)가 등록된 환경에서만 동작한다. 운영 백엔드에서는 컨트롤러가
// 등록되지 않으므로 404 응답이 돌아오며, demoLogin() 은 ApiError 로 surface된다.
//
// 응답 envelope unwrap 은 기존 apiClient 가 처리하며, 본 함수는 result 부분만 받는다.

import { apiClient } from './apiClient';

export type DemoUser = {
  userId: string;
  schoolId: string;
  schoolName: string;
  departmentId: string;
  departmentName: string;
  /** 항상 "RESERVED" — 학생인증을 통과한 척 표현하지 않는다. */
  studentVerificationStatus: string;
};

export type DemoLoginResult = {
  sessionToken: string;
  expiresAt: string;
  user: DemoUser;
};

/**
 * 인증 헤더 없이 호출한다 (백엔드 AuthenticationFilter PERMIT_PREFIXES 에 포함됨).
 * 성공하면 caller 가 sessionToken 을 SecureStore 에 저장하고 Feed 로 이동한다.
 */
export async function demoLogin(): Promise<DemoLoginResult> {
  return apiClient.post<DemoLoginResult>('/dev/demo-login', undefined, { auth: false });
}
// DEMO_MODE_END
