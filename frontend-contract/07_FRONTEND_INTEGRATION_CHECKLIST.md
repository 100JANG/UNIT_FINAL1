# Frontend Integration Checklist

> 본 문서는 React + Tailwind 프론트가 **첫 PR을 백엔드에 연결하기 전**에 점검해야 할 항목 모음이다.
> 모든 항목을 통과하지 못하면 통합이 의도대로 동작하지 않는다.

## 1. 환경 변수 (필수)

프론트는 다음 환경 변수를 설정한다 (Vite 기준):

```
VITE_API_BASE=https://api.example.com         # 백엔드 base URL (말미 슬래시 없이)
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_DATABASE_URL=https://<your>.firebaseio.com
VITE_FIREBASE_PROJECT_ID=...
```

체크:
- [ ] `VITE_API_BASE`가 `/v1` 접두 없이 base URL만 포함
- [ ] `VITE_FIREBASE_DATABASE_URL`이 백엔드의 `FIREBASE_DATABASE_URL`과 동일 인스턴스
- [ ] `.env` 파일은 `.gitignore`에 등재 (Firebase API key는 공개 가능하지만 환경 분리 차원)
- [ ] `serviceAccountKey.json` 등 Firebase 서버측 자격증명을 프론트에 절대 포함하지 않음

## 2. API 클라이언트

체크:
- [ ] axios (또는 fetch wrapper)에 `baseURL = VITE_API_BASE` 설정
- [ ] 모든 호출 경로는 `/v1/...`로 시작
- [ ] `Content-Type: application/json` 자동 주입
- [ ] `Authorization: Bearer ${sessionToken}` 인터셉터 설정 — `localStorage`(또는 메모리)의 sessionToken을 자동 첨부
- [ ] 401 `AUTH_EXPIRED` 응답 시 1회 `POST /v1/auth/refresh` 후 원 요청 재시도. 실패 시 로그인 화면 리다이렉트
- [ ] 401 `AUTH_REQUIRED`/`AUTH_INVALID` 시 즉시 로그아웃 + 로그인 화면
- [ ] 403 `USER_SUSPENDED` 시 정지 안내 화면
- [ ] Reserved endpoint 4종은 호출 자체를 차단 ([`04_RESERVED_FEATURE_CONTRACT.md §3.1`](04_RESERVED_FEATURE_CONTRACT.md#31-호출-자체를-차단-권장))

## 3. Firebase 클라이언트

체크:
- [ ] `firebase/app`, `firebase/auth`, `firebase/database` 만 import (Firestore/Storage 등 미사용)
- [ ] 로그인 직후 `signInWithCustomToken(auth, firebaseCustomToken)` 호출
- [ ] 로그아웃 시 `signOut(auth)` 호출 + sessionToken 폐기
- [ ] `onValue` 구독 후 `useEffect` cleanup에서 unsubscribe ([`02_RTDATABASE_SUBSCRIPTION_CONTRACT.md §6`](02_RTDATABASE_SUBSCRIPTION_CONTRACT.md#6-subscription-라이프사이클-메모리-누수-방지))
- [ ] 어떤 RTDB 경로에도 `set`/`update`/`push`/`remove` 호출하지 않음 — 모두 REST 경유
- [ ] RTDB query에 `orderByChild`를 쓸 때 [`02 §2`](02_RTDATABASE_SUBSCRIPTION_CONTRACT.md)의 indexable field 사용

## 4. 인증 플로우 (수동 테스트)

체크:
- [ ] Firebase Auth로 로그인 → ID Token 획득 → `POST /v1/auth/session`으로 sessionToken 수신
- [ ] sessionToken으로 `GET /v1/users/me` 호출 → 200 응답 + `studentVerificationStatus="RESERVED"` 확인
- [ ] firebaseCustomToken으로 `signInWithCustomToken` → RTDB `/users/{myUid}` read 성공
- [ ] 다른 사용자 `/users/{otherUid}` read 시도 → `PERMISSION_DENIED` 확인 (룰 검증)
- [ ] sessionToken 만료 시뮬레이션 (백엔드 `JWT_SESSION_TTL_SECONDS=60`으로 설정 후 60초 대기) → 자동 refresh 동작 확인
- [ ] 로그아웃 → `POST /v1/auth/logout` 호출 + Firebase signOut + localStorage 클리어

## 5. 도메인별 통합 시나리오

### 5.1 피드 (`/feed`)
- [ ] `GET /v1/posts?scope=all&sort=latest&limit=20` 호출 → items 표시
- [ ] "더 보기" 클릭 시 `cursor` 동봉해 다음 페이지 fetch
- [ ] `hasMore=false`면 더 보기 버튼 숨김
- [ ] `onValue(ref(db, '/post_feeds/all'))` 구독으로 새 글 도착 알림
- [ ] scope=school 탭 클릭 시 사용자 schoolId 미등록이면 `BUSINESS_RULE_VIOLATION` 응답 → 학교 등록 안내 (또는 scope=all로 fallback)

### 5.2 글 작성 (`/write`)
- [ ] title/content/tags validation: 클라이언트 단에서도 길이 검사 (제목 2~80, 본문 10~5000, tags ≤ 5)
- [ ] `POST /v1/posts` 성공 응답의 `result.url`로 라우팅 (`/post/{postId}`)
- [ ] `VALIDATION_FAILED` 응답 시 `result.fields[]`로 폼 인라인 에러 표시

### 5.3 게시글 상세 (`/post/:postId`)
- [ ] `GET /v1/posts/{postId}` 본문 표시 + `NOT_FOUND` 시 빈 상태
- [ ] `GET /v1/posts/{postId}/comments?limit=20` 댓글 표시 + 무한 스크롤
- [ ] `POST /v1/posts/{postId}/like` toggle UI (낙관적 업데이트 권장)
- [ ] `POST /v1/posts/{postId}/scrap` toggle UI
- [ ] `POST /v1/posts/{postId}/comments` 작성 → 응답 받으면 댓글 list 갱신
- [ ] `DELETE /v1/posts/{postId}/comments/{commentId}` 본인 댓글에만 버튼 노출
- [ ] `POST /v1/posts/{postId}/report` 신고 UI + `REPORT_DUPLICATE` 토스트 처리
- [ ] `onValue(ref(db, '/post_stats/{postId}'))` 구독으로 카운터 실시간 동기화

### 5.4 강의평 (`/courses`)
- [ ] `GET /v1/courses?schoolId=...&q=...` 검색
- [ ] `GET /v1/courses/{courseId}` 상세 → `REVIEW_QUOTA_REQUIRED`이면 `/courses/:id/review` 자동 라우팅 (에러 토스트 노출 금지)
- [ ] `POST /v1/courses/{courseId}/reviews` 작성 → 성공 후 상세 화면으로 복귀
- [ ] vote: `RECOMMEND` / `NOT_RECOMMEND` / `SKIP` 3개 라디오

### 5.5 알림 (`/notifications`)
- [ ] `GET /v1/notifications?size=50` 초기 로드 (※ `size` 파라미터, `limit` 아님)
- [ ] `onValue(ref(db, '/notifications/{myUid}'))` 구독
- [ ] `PATCH /v1/notifications/{notificationId}` 단건 읽음
- [ ] `POST /v1/notifications/mark-all-read` 전체 읽음
- [ ] FCM 토큰: 디바이스 권한 획득 후 `POST /v1/notifications/fcm-token` 등록 (실제 push 발송은 미구현이지만 토큰은 등록 가능)

### 5.6 내 활동 (`/me`, `/me/posts`, `/me/comments`, `/me/likes`, `/me/scraps`)
- [ ] `GET /v1/users/me` 프로필 (학번 마스킹 확인)
- [ ] `GET /v1/users/me/stats` 통계 5개 카운터
- [ ] `GET /v1/users/me/posts|comments|likes|scraps?limit=20` 각 활동 list
- [ ] `items.length < limit`이지만 `hasMore=true`인 경우 정상 처리 ([`06_PAGINATION_CONTRACT.md §6`](06_PAGINATION_CONTRACT.md#6-가시-페이지--limit-가능성-트레이드오프))

### 5.7 배심원 (`/jury/:caseId`)
- [ ] `GET /v1/jury/cases/{caseId}` → `JURY_NOT_AUTHORIZED` 시 목록으로 돌아가기
- [ ] `POST /v1/jury/cases/{caseId}/vote` → `JURY_ALREADY_VOTED`/`JURY_WINDOW_CLOSED` 처리
- [ ] `onValue(ref(db, '/jury_case_stats/{caseId}'))` 진척률 실시간

### 5.8 Reserved 영역
- [ ] `/auth/student-card`, `/ai/refine`, `/recap/...` 라우트는 placeholder 화면만
- [ ] 실수로 호출되더라도 `501 FEATURE_RESERVED`를 placeholder로 매핑 ([`04_RESERVED_FEATURE_CONTRACT.md`](04_RESERVED_FEATURE_CONTRACT.md))

## 6. 보안 점검

체크:
- [ ] sessionToken / firebaseCustomToken을 URL query에 노출하지 않음
- [ ] `console.log`로 토큰 출력하지 않음 (프로덕션 빌드)
- [ ] 다른 사용자의 path를 RTDB에서 read 시도하지 않음 (`/notifications/{otherUid}` 등)
- [ ] HTML form action으로 백엔드 endpoint를 직접 hit 하지 않음 (CSRF 위험)
- [ ] 외부 도메인의 Iframe에서 sessionToken 사용 금지
- [ ] `localStorage`에 사용자 PII (학번 원본 등) 저장 금지 — 백엔드 응답은 마스킹된 값만

## 7. 빌드 / 배포

체크:
- [ ] `VITE_API_BASE`가 환경별로 다르게 주입되는 구조 (dev/staging/prod)
- [ ] Firebase project가 환경별로 분리되거나 분리 계획 명시
- [ ] 프로덕션 빌드에서 sourcemap 노출 정책 결정
- [ ] CSP 헤더 설정 시 `connect-src`에 백엔드 도메인 + Firebase 도메인 (`*.firebaseio.com`, `*.firebaseapp.com`, `*.googleapis.com`) 허용

## 8. 백엔드 변경 사항 동기화

다음이 변경되면 프론트도 갱신 필요:

- [ ] [`01_FRONTEND_API_CONTRACT.md`](01_FRONTEND_API_CONTRACT.md) — 응답 DTO 변경 시 TypeScript 인터페이스 동기화
- [ ] [`03_ERROR_HANDLING_CONTRACT.md`](03_ERROR_HANDLING_CONTRACT.md) — 신규 ErrorCode 추가 시 axios interceptor 분기 추가
- [ ] [`02_RTDATABASE_SUBSCRIPTION_CONTRACT.md`](02_RTDATABASE_SUBSCRIPTION_CONTRACT.md) — Security Rules 변경 시 read 권한 영향 확인
- [ ] [`04_RESERVED_FEATURE_CONTRACT.md`](04_RESERVED_FEATURE_CONTRACT.md) — Reserved 기능이 활성화되면 호출 차단 해제

## 9. 테스트 권장 (프론트 측)

- [ ] axios 인터셉터에 대한 단위 테스트 (401 자동 refresh, 403 라우팅 등)
- [ ] Reserved endpoint 호출 시 차단되는지 테스트
- [ ] cursor pagination 무한 스크롤 통합 테스트
- [ ] RTDB onValue cleanup이 unmount 시 호출되는지 (메모리 누수 방지)
- [ ] sessionToken 만료 시 자동 refresh 후 재시도 시나리오

## 10. 첫 통합 PR 머지 전 마지막 점검

- [ ] 백엔드 staging 환경에 `database.rules.json` 배포 완료 확인 ([`../database/04_SECURITY_RULES_DEPLOYMENT_CHECKLIST.md`](../database/04_SECURITY_RULES_DEPLOYMENT_CHECKLIST.md))
- [ ] 프론트 staging 환경 변수가 백엔드 staging URL을 가리킴
- [ ] 신규 사용자가 처음 로그인 → `/feed` 진입 → 글 작성 → 댓글 작성 → 좋아요 → 스크랩 → 본인 활동 확인까지 happy path 1회 수동 검증
- [ ] 인증되지 않은 상태로 `/feed` 진입 → 로그인 화면으로 리다이렉트 확인
- [ ] 만료된 sessionToken으로 진입 → 자동 refresh 또는 로그인 라우팅 확인
- [ ] Reserved 4개 endpoint 직접 호출 → 모두 placeholder 노출 또는 차단
