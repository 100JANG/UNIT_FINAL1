# 10 — Course Review Write Connection Report

> Cycle 5 (runbook). 강의평 작성 API 연결.

## 1. 연결한 API

```
POST /v1/courses/{courseId}/reviews
Body: { "vote": "RECOMMEND" | "NOT_RECOMMEND" | "SKIP", "comment": "..." }
```

- 백엔드 컨트롤러: [`CourseController.createReview`](../../../UNIT_BACKEND/src/main/java/kr/unit/backend/courses/controller/CourseController.java)
- Contract: [`docs/backend-contract/01_FRONTEND_API_CONTRACT.md` §7 POST /v1/courses/{courseId}/reviews](../backend-contract/01_FRONTEND_API_CONTRACT.md)
- `Authorization: Bearer ...` 자동 부착.
- `courseId`는 string opaque. `Number()`/`parseInt` 0건. `encodeURIComponent`로 path 삽입.
- envelope unwrap apiClient 재사용.

응답: `{ reviewId, courseId, stats: { recommend, notRecommend, skip, total, recommendRate } }`.

## 2. 생성/수정 파일

신규:
- [src/hooks/useCreateCourseReview.ts](../../src/hooks/useCreateCourseReview.ts) — vote/comment/submit/skip + 200자 cap + reqId-style in-flight 가드
- [docs/integration/10_COURSE_REVIEW_WRITE_REPORT.md](10_COURSE_REVIEW_WRITE_REPORT.md)

수정:
- [src/types/course.ts](../../src/types/course.ts) — `CourseReviewVote`, `CreateCourseReviewRequest`, `CourseReviewCreatedResponseDto` 추가
- [src/services/api/courseApi.ts](../../src/services/api/courseApi.ts) — `createCourseReview` 추가
- [src/screens/v2/CourseReviewScreen.tsx](../../src/screens/v2/CourseReviewScreen.tsx) — 전체 재작성. 로컬 vote state 제거 → `useCreateCourseReview` 사용. 작성 성공 시 `navigation.replace('CourseDetail')`로 detail 재진입(refetch). 건너뛰기 → SKIP 제출.
- [docs/integration/02_REMAINING_CONNECTION_PLAN.md](02_REMAINING_CONNECTION_PLAN.md) — Cycle E `POST reviews` 완료 표시

수정 안 함:
- 백엔드 0건
- Profile/Notifications/RTDB 0건
- 다른 hook 0건

## 3. UX 정책

- **추천 / 비추천 / 건너뛰기(SKIP)**: brief의 "별점 기반 UI 임의 변경 금지" + "추천/비추/Skip 중심 유지" 준수
- 두 큰 버튼(추천/비추) + AppBar trailing의 "건너뛰기" 텍스트 = 3가지 vote 분기를 유지
- 댓글 입력은 선택, 200자 이내 (백엔드 contract)
- 글자 수 카운터: 입력 시작 후 노출, over-limit 시 빨강
- 에러 박스: validation field-error 항목별 노출
- 등록 / 등록 중… 라벨 토글, 제출 중 모든 입력 잠금

## 4. 작성 후 흐름

성공 시:
1. `setVote(null)`, `setComment('')`로 draft 초기화
2. `onSuccess` 콜백 → `navigation.replace('CourseDetail', { courseId })`
3. CourseDetailScreen 마운트 → useCourseDetail이 자동으로 refetch → 422 REVIEW_QUOTA_REQUIRED가 더 이상 발생하지 않으므로 success로 정착

`replace`를 사용한 이유: 사용자가 뒤로가기 시 review 화면이 다시 나오면 사이클이 깨짐. detail에서 뒤로 가면 courses list로 자연스럽게 복귀.

## 5. ErrorCode 처리

| code | UI |
|---|---|
| `AUTH_REQUIRED`/`AUTH_INVALID`/`AUTH_EXPIRED` | "강의평을 작성하려면 로그인이 필요합니다" |
| `VALIDATION_FAILED` | message + fieldErrors 항목별 |
| `BUSINESS_RULE_VIOLATION` | server message (이미 작성한 경우 등) |
| `NOT_FOUND` | "강의를 찾을 수 없습니다" |
| `FORBIDDEN`/`USER_SUSPENDED` | "강의평을 작성할 권한이 없습니다" |
| `FEATURE_RESERVED` | "준비 중인 기능입니다" 방어 |
| `NETWORK_ERROR` | "네트워크 연결을 확인해주세요" |
| 그 외 | message 또는 "강의평을 등록하지 못했습니다" |

토큰 클리어는 apiClient가 자동(cycle 2 정책 그대로).

클라 사이드 검증:
- vote == null이면 등록 비활성
- comment.length > 200이면 로컬 validation 에러
- isSubmitting이면 모든 입력 잠금

## 6. 검증 결과

```
./node_modules/.bin/tsc --noEmit  → exit 0 ✅
```

`package.json` lint/build 미정의. 새 native module 0건.

## 7. 회귀 여부

| 항목 | 결과 |
|---|---|
| Feed / PostDetail / Comments / Post Like-Scrap / Post Comment Write/Like/Delete | ✅ 0건 변경 |
| Courses 목록/상세 (cycle 4) | ✅ 0건 변경. CourseDetail은 review 작성 후 replace로 자연 refetch |
| `useCourses`, `useCourseDetail` | ✅ 0건 변경 |
| route param `{ courseId: string }` | ✅ 유지 |
| 댓글/게시글 hook 0건 변경 | ✅ |

## 8. 남은 문제 / TODO

1. **REVIEW_QUOTA_REQUIRED 무한 루프 방어**: review 작성 도중 사용자가 뒤로가기 → courses 진입 → 같은 강의 진입 시 다시 422 → review로 redirect. 정상 흐름이지만 사용자 입장에서 살짝 매끄럽지 않을 수 있음. 후속 cycle에서 "review 미작성 안내 + 명시적 버튼" UX로 격상 검토.
2. **CourseDetail의 reviews 목록 placeholder** 유지 (별도 review-list endpoint 없음). 다음 cycle 또는 backend 협의.
3. **CourseReview 화면에서 강의명 표시 부재**: 현재 GET /v1/courses/{courseId}는 미작성자에게 422를 반환 → review 작성 화면에서 강의명을 가져올 수 없음. 백엔드에 minimal-info endpoint 추가 협의 또는 list에서 navigate 시 name을 route param으로 함께 전달하는 방식 검토.
4. **SKIP 버튼은 trailing "건너뛰기" 텍스트로만 노출**: 큰 버튼 영역엔 추천/비추 두 개. 디자인적으로 SKIP 버튼이 덜 강조됨. 사용자 의도가 "비교적 의식하기 어려운 위치"이므로 의도적이지만, 추후 UX 검토 가능.

## 9. 다음 Cycle (runbook)

- **Cycle 6. Profile / Activity 연결** (`GET /v1/users/me`, `/me/stats`, `/me/posts`, `/me/comments`, `/me/likes`, `/me/scraps`)
  - 학번 마스킹, `studentVerificationStatus = RESERVED` 처리
  - profile-cycle 완료 시 `CoursesScreen.FALLBACK_SCHOOL_ID`도 동적 주입으로 교체 가능
