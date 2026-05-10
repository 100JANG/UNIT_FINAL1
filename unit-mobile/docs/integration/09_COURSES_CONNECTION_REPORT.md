# 09 — Courses Read (List + Detail) Connection Report

> Cycle 4 (runbook). 강의 목록과 강의 상세 API 연결.
> 강의평 작성/조회는 다음 사이클(Cycle 5).

## 1. 연결한 API

```
GET /v1/courses?q=&schoolId=&semester=&cursor=&limit=    -> CursorPage<CourseSummaryResponse>
GET /v1/courses/{courseId}                                -> CourseDetailResponse
```

- 백엔드 컨트롤러: [`CourseController`](../../../UNIT_BACKEND/src/main/java/kr/unit/backend/courses/controller/CourseController.java)
- Contract: [`docs/backend-contract/01_FRONTEND_API_CONTRACT.md` §7](../backend-contract/01_FRONTEND_API_CONTRACT.md)
- `Authorization: Bearer ...` 자동 부착 (apiClient).
- `courseId`는 string opaque (`c_xxxx`). `Number()`/`parseInt` 사용 0건. `encodeURIComponent`로만 path 삽입.
- 페이지네이션: `cursor` + `limit` (기본 20, 최대 50). `size` 사용 0건.
- envelope unwrap은 기존 apiClient 재사용.

### 응답 shape

`CourseSummaryResponse`:
```json
{ "courseId": "c_xxxx", "schoolId": "ajou", "courseName": "...", "professor": "...", "semester": "2026-1" }
```

`CourseDetailResponse`:
```json
{
  "courseId": "c_xxxx", "courseName": "...", "professor": "...", "semester": "2026-1",
  "recommend": 12, "notRecommend": 3, "skip": 2, "total": 17, "recommendRate": 0.8
}
```

`recommendRate`는 0..1 — UI는 mapper에서 `Math.round(* 100)`으로 percent 변환.
SKIP은 분모에서 제외, total에는 포함 (contract 명시).

## 2. 생성/수정 파일

신규:
- [src/types/course.ts](../../src/types/course.ts) — `CourseSummaryDto`, `CourseDetailDto`, UI `CourseSummary`, `CourseDetailUi`
- [src/services/api/courseApi.ts](../../src/services/api/courseApi.ts) — `getCourses`, `getCourseDetail`
- [src/services/api/mappers/courseMapper.ts](../../src/services/api/mappers/courseMapper.ts) — `mapCourseSummary`, `mapCourseDetail`
- [src/hooks/useCourses.ts](../../src/hooks/useCourses.ts) — cursor pagination + 8 상태 머신
- [src/hooks/useCourseDetail.ts](../../src/hooks/useCourseDetail.ts) — REVIEW_QUOTA_REQUIRED 전용 status 포함
- [docs/integration/09_COURSES_CONNECTION_REPORT.md](09_COURSES_CONNECTION_REPORT.md)

수정:
- [src/types.ts](../../src/types.ts) — `CourseDetail` / `CourseReview` `courseId: number` → `string`
- [src/types/unit-v2.ts](../../src/types/unit-v2.ts) — `CourseDetail` / `CourseReview` 양쪽 entries 모두 `{ courseId: string }`로 통일 (이전: `{ id: number }` / `{ courseId: number }`)
- [src/navigation/RootNavigator.tsx](../../src/navigation/RootNavigator.tsx) — `CourseDetailAdapter` / `CourseReviewAdapter` 제거. `<Stack.Screen ... component={CourseDetailV2} />`로 직결. `RootStackProps` import도 제거 (미사용).
- [src/screens/v2/CoursesScreen.tsx](../../src/screens/v2/CoursesScreen.tsx) — 전체 재작성. mock COURSES + 로컬 vote 상태 제거 → `useCourses` + 8 상태 UI + cursor 더보기 버튼. 카드 자체가 곧 navigate 트리거(추천/비추 vote 버튼은 Cycle 5에서 review 작성 화면을 통해 처리)
- [src/screens/v2/CourseDetailScreen.tsx](../../src/screens/v2/CourseDetailScreen.tsx) — mock COURSES + REVIEWS 제거 → `useCourseDetail` + 9 상태 UI + 통계 카드. 리뷰 리스트는 placeholder 한 줄 유지 (Cycle 5 이후 연결).
- [docs/integration/02_REMAINING_CONNECTION_PLAN.md](02_REMAINING_CONNECTION_PLAN.md) — Cycle E 일부 완료 표시

수정 안 함:
- 백엔드 0건
- 다른 화면(Profile/Notifications/RTDB 등) 0건
- 다른 hook(Feed/PostDetail/Comment 계열) 0건

## 3. Course route 마이그레이션 (PostDetail과 동일 패턴)

| 파일 | 라인 | 이전 | 이후 |
|---|---|---|---|
| `src/types.ts` | 11 | `CourseDetail: { courseId: number }` | `{ courseId: string }` |
| `src/types.ts` | 12 | `CourseReview: { courseId: number }` | `{ courseId: string }` |
| `src/types/unit-v2.ts` | 44 | `CourseDetail: { id: number }` | **`{ courseId: string }`** (field 이름도 통일) |
| `src/types/unit-v2.ts` | 45 | `CourseReview: { id: number }` | **`{ courseId: string }`** |
| `src/types/unit-v2.ts` | 90 | `CourseDetail: { courseId: number }` | `{ courseId: string }` |
| `src/types/unit-v2.ts` | 91 | `CourseReview: { courseId: number }` | `{ courseId: string }` |

PostDetail과 같은 이유로 `id` ↔ `courseId` 분리는 TS overload resolver를 깨뜨리므로 양쪽 stack 모두 `courseId`로 통일. 결과적으로 RootNavigator의 `CourseDetailAdapter` / `CourseReviewAdapter`는 단순 pass-through가 되어 제거 가능 → 제거함.

## 4. 화면 상태 처리

### CoursesScreen (`useCourses`)

| status | UI |
|---|---|
| `idle`/`loading` | ActivityIndicator (중앙) |
| `success` | `CourseRow` 리스트 + 끝에 "강의 더보기" 버튼 (hasMore=true 때) |
| `empty` | "표시할 강의가 없어요 / 학교 정보가 등록되면 강의가 표시됩니다." |
| `auth-required` | "로그인이 필요합니다" + DEV 패널 안내 |
| `business-rule` | server message |
| `reserved` | "준비 중인 기능입니다" 방어 |
| `error` | message + "다시 시도" 버튼 |

### CourseDetailScreen (`useCourseDetail`)

| status | UI |
|---|---|
| `idle`/`loading`/`review-required` | ActivityIndicator (review-required는 즉시 redirect되므로 짧게 보임) |
| `success` | hero/통계 카드(추천 %, 분포 막대, breakdown 추천/비추/Skip) + 리뷰 placeholder + "평가하기" CTA |
| `not-found` | "강의를 찾을 수 없습니다" + 뒤로가기 |
| `auth-required` | "로그인이 필요합니다" + DEV 패널 안내 + 뒤로가기 |
| `forbidden` | "접근할 수 없습니다" |
| `reserved` | "준비 중인 기능입니다" 방어 |
| `error` | message + "다시 시도" 버튼 |

## 5. REVIEW_QUOTA_REQUIRED 처리

Contract: 강의평을 작성하지 않은 viewer가 GET `/v1/courses/{courseId}` 호출 시 422 `REVIEW_QUOTA_REQUIRED`. 프론트는 toast가 아니라 review 화면으로 라우팅해야 함.

구현:
- `useCourseDetail`이 422를 받으면 `status: 'review-required'`로 매핑 (에러로 분류하지 않음)
- `CourseDetailScreen`은 `useEffect([status])`에서 status === 'review-required'일 때 `navigation.replace('CourseReview', { courseId })` 호출
  - `replace`를 쓰는 이유: 사용자가 뒤로 가기 시 detail이 또 나타나 무한 루프되지 않도록
- review 작성 후 다시 detail로 들어오면 자연스럽게 success로 전환됨 (Cycle 5에서 작성 후 navigate 흐름 정착)

토스트 0건 / 에러 메시지 0건 / forced empty 0건.

## 6. schoolId 처리

Contract: `schoolId`가 빠지면 백엔드는 빈 페이지로 응답.

현재:
- `CoursesScreen`은 `FALLBACK_SCHOOL_ID = 'ajou'`를 hardcode
- `// TODO(profile-cycle): /v1/users/me.schoolId로 교체` 주석 명시
- Cycle 6 (Profile) 완료 후 user profile에서 동적 주입으로 교체

검색어(`q`), 학기 필터(`semester`)는 hook의 인자로 노출되어 있으나 현재 화면에 입력 UI 미연결 — Search 화면 / 필터 시트에서 활용 예정 (별도 cycle).

## 7. 검증 결과

```
./node_modules/.bin/tsc --noEmit  → exit 0 ✅
```

`package.json`의 lint/build 스크립트 미정의. 새 native module 0건 → `expo install --check` 재실행 불필요.

## 8. 회귀 여부

| 항목 | 결과 |
|---|---|
| Feed / PostDetail / Comments / Post Like-Scrap | ✅ 변경 없음 (route param 마이그레이션이 이전 cycle의 `postId: string`과 일관) |
| `usePostActions`, `usePostComments`, `useCreateComment`, `useCommentActions` | ✅ 0건 변경 |
| `apiClient` envelope unwrap / Auth 정책 | ✅ 0건 변경 |
| `CourseReviewScreen` | 라우트 타입은 `{ courseId: string }`로 변경됐지만 화면이 params를 소비하지 않으므로 동작 동일. Cycle 5에서 와이어링. |

## 9. 남은 문제 / TODO

1. **schoolId hardcode**: `'ajou'` 임시. Profile cycle에서 `/v1/users/me`로 교체.
2. **검색 / 학기 필터 UI 미연결**: hook은 `q`/`semester`/`limit` 모두 받으나 Coursees 화면에 입력 UI 없음.
3. **CourseDetail 리뷰 리스트**: placeholder 한 줄. Cycle 5 (Course Review write) 또는 별도 review-list cycle에서 연결.
4. **vote 버튼이 카드에서 사라짐**: 기존 mock 카드의 추천/비추 즉시 토글 버튼 제거 — review는 별도 화면에서 작성하는 흐름으로 통일됨. UX 변경에 가까운 결정.
5. **CourseSummary에 stats 필드 부재**: 백엔드 list 응답이 minimal — 카드에서 추천% 미표시. `total` 등을 list에도 포함시키려면 backend contract 확장 필요.
6. **`isMyComment` / `myActions`** 등 viewer-context 신호는 본 cycle 도메인 외.

## 10. 다음 Cycle (runbook)

- **Cycle 5. Course Review 작성 연결** (`POST /v1/courses/{courseId}/reviews`)
  - vote: RECOMMEND / NOT_RECOMMEND / SKIP
  - comment 선택, 200자
  - 작성 후 CourseDetail refetch 또는 navigate
  - REVIEW_QUOTA_REQUIRED는 본 cycle에서 routing 흐름 정착 → review write 사이클에서 작성 성공 후 detail 재진입으로 자연 해소
