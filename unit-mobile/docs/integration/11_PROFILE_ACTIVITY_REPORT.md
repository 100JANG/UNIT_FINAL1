# 11 — Profile / Activity Connection Report

> Cycle 6 (runbook). 6개 user 엔드포인트 연결 (`/me`, `/me/stats`, `/me/posts`,
> `/me/comments`, `/me/likes`, `/me/scraps`).

## 1. 연결한 API

```
GET /v1/users/me           -> MyProfileResponse
GET /v1/users/me/stats     -> MyStatsResponse
GET /v1/users/me/posts     -> CursorPage<UserPostActivityResponse>
GET /v1/users/me/comments  -> CursorPage<UserCommentActivityResponse>
GET /v1/users/me/likes     -> CursorPage<UserLikeActivityResponse>
GET /v1/users/me/scraps    -> CursorPage<UserScrapActivityResponse>
```

- 백엔드 컨트롤러: [`UserController`, `UserActivityController`](../../../UNIT_BACKEND/src/main/java/kr/unit/backend/users/controller/)
- Contract: [`docs/backend-contract/01_FRONTEND_API_CONTRACT.md` §4](../backend-contract/01_FRONTEND_API_CONTRACT.md)
- 모두 `Authorization: Bearer ...` 자동 부착.
- 페이지네이션: `cursor` + `limit` (기본 20, 최대 50). `size` 사용 0건.
- envelope unwrap apiClient 재사용.

응답 형태가 4개 활동 endpoint마다 다름 — generic factory hook으로 처리.

## 2. 생성/수정 파일

신규:
- [src/types/user.ts](../../src/types/user.ts) — 6쌍의 DTO + UI 타입
- [src/services/api/userApi.ts](../../src/services/api/userApi.ts) — 6 API 함수 + 공유 `fetchActivity<DtoT, UiT>` 헬퍼
- [src/services/api/mappers/userMapper.ts](../../src/services/api/mappers/userMapper.ts) — 6 mappers
- [src/hooks/useMyProfile.ts](../../src/hooks/useMyProfile.ts) — `/me` + `/me/stats` Promise.all
- [src/hooks/useMyActivity.ts](../../src/hooks/useMyActivity.ts) — generic `useActivityList<T>` + 4개 wrappers (`useMyPosts`/`useMyComments`/`useMyLikes`/`useMyScraps`)
- [docs/integration/11_PROFILE_ACTIVITY_REPORT.md](11_PROFILE_ACTIVITY_REPORT.md)

수정:
- [src/screens/v2/ProfileScreen.tsx](../../src/screens/v2/ProfileScreen.tsx) — hero + stats 영역만 와이어링. 매너학점/설정/스위치 등 다른 섹션은 placeholder 유지(별도 cycle 도메인).
- [src/screens/v2/MyPostsScreen.tsx](../../src/screens/v2/MyPostsScreen.tsx) — 전체 재작성. mock 제거 → `useMyPosts` + 7-state UI + 더보기.
- [src/screens/v2/MyCommentsScreen.tsx](../../src/screens/v2/MyCommentsScreen.tsx) — 전체 재작성. `useMyComments` + 7-state UI. deleted 댓글은 italic+회색.
- [src/screens/v2/ScrapsScreen.tsx](../../src/screens/v2/ScrapsScreen.tsx) — 전체 재작성. `useMyScraps` + 7-state UI + 더보기.
- [docs/integration/02_REMAINING_CONNECTION_PLAN.md](02_REMAINING_CONNECTION_PLAN.md) — Cycle F 완료 표시

수정 안 함:
- 백엔드 0건
- `OtherProfileScreen` 0건 변경 (runbook spec에 명시 안 됨 — 별도 cycle)
- `useMyLikes`는 hook만 준비. 전용 화면(MyLikesScreen)이 없음 → 다음 cycle에서 화면 추가 시 재사용.
- 다른 도메인(Feed/Post/Comment/Course) 0건 변경.

## 3. 정책

### `studentVerificationStatus` / `enrollmentStatus`

Runbook §6 주의:
> `studentVerificationStatus = RESERVED`를 실제 인증 완료처럼 표시하지 않음.

대응:
- `mapMyProfile`이 `enrollmentStatus === 'RESERVED'` → `isStudentVerificationReserved: true` boolean으로 surfacing
- ProfileScreen은 RESERVED일 때 "학생 인증 준비 중" 작은 안내 문구만 노출. 체크마크/배지/완료 표시 0건.

### 학번 마스킹

- `studentNumberMasked`는 백엔드가 이미 마스킹된 값(`"2020****"`)으로 응답. 프론트에서 추가 마스킹/원본 노출 0건.
- 미등록이면 `null`. UI는 "학번 미등록"으로 fallback.

### profile settings 수정

- Runbook 명시: profile settings 수정 API는 본 cycle에서 연결하지 않음.
- ProfileScreen의 "편집" 링크는 placeholder 유지 (no-op).

### `userId` 직접 RTDB write

- 0건. 프론트는 `/me` REST endpoint로만 user 정보 접근. RTDB direct read/write 모두 0건.

## 4. 화면 상태 처리

### ProfileScreen

| status | UI |
|---|---|
| `idle`/`loading` | hero 영역에 ActivityIndicator (다른 섹션은 그대로 노출) |
| `success` | 이름/학교/학과/학번/RESERVED 안내 + 작성/댓글/받은 추천 통계 3칸 |
| `auth-required` | "로그인이 필요합니다" + DEV 패널 안내 |
| `error` | "프로필을 불러오지 못했습니다" + 메시지 |
| `reserved` | (RESERVED 분기는 hook에서 매핑되긴 하나 본 endpoint에서 정상 케이스로 거의 발생하지 않음) |

### MyPosts / MyComments / Scraps

7-state machine (idle/loading/success/empty/auth-required/reserved/error) — 다른 hook과 일관.
- 카드 tap → `navigate('PostDetail', { postId })` (string)
- 더보기 버튼: cursor pagination (size 미사용)

`useMyComments`는 deleted 댓글도 list에 포함 (백엔드가 마스킹된 content로 반환). UI는 italic + 회색 처리.

## 5. 검증 결과

```
./node_modules/.bin/tsc --noEmit  → exit 0 ✅
```

새 native module 0건 → `expo install --check` 재실행 불필요. lint/build 미정의.

## 6. 회귀 여부

| 항목 | 결과 |
|---|---|
| Feed / PostDetail / Comments / Post Like-Scrap / Comment Write/Like/Delete / Courses / Course Review | ✅ 0건 변경 |
| `useFeedPosts`, `usePostDetail`, `usePostComments`, `usePostActions`, `useCreateComment`, `useCommentActions`, `useCourses`, `useCourseDetail`, `useCreateCourseReview` | ✅ 0건 변경 |
| route param 마이그레이션 | ✅ 변경 없음 |
| apiClient envelope unwrap / Auth 정책 | ✅ 0건 변경 |
| `OtherProfileScreen` (mock 그대로) | runbook 범위 외 — 변경 없음 |

## 7. 남은 문제 / TODO

1. **ProfileScreen 매너학점 / 설정 섹션은 mock**: 본 cycle 범위 외. 별도 endpoint가 backend에 추가되면 연결.
2. **MyLikesScreen 부재**: hook은 준비됐으나 전용 화면이 없음. 다음 cycle에서 화면 추가하거나 ScrapsScreen과 통합 검토.
3. **Profile settings 수정 미구현** (의도적 — runbook 범위 외).
4. **CoursesScreen.FALLBACK_SCHOOL_ID**: ProfileScreen 마운트 후 `useMyProfile.profile.schoolId`에서 받아 동적 주입하도록 격상 가능. 본 cycle은 ProfileScreen 자체 와이어링까지만.
5. **OtherProfileScreen 미연결** (runbook 범위 외).
6. **편집 / 친구 요청 / 차단 목록 등 사이드 기능 미연결** (cycle 범위 외).

## 8. 다음 Cycle (runbook)

- **Cycle 7. Notifications 연결**
  - `GET /v1/notifications`, `PATCH /v1/notifications/{id}`, `POST /v1/notifications/mark-all-read`
  - RTDB subscription / push notification은 본 cycle 범위 아님 (Cycle 8에서 별도)
  - FCM 등록 endpoint는 미사용 (Push 구현 금지)
