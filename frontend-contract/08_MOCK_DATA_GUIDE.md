# Frontend Mock Data Guide

> 백엔드/Firebase 없이 프론트 UI를 개발/테스트할 때 사용하는 mock 데이터 시드 가이드.
> 모든 mock 객체는 [`01_FRONTEND_API_CONTRACT.md`](01_FRONTEND_API_CONTRACT.md)의 실 응답 구조와 1:1 일치한다.

## 1. Mock 사용 시점

| 시점 | 권장 방법 |
|---|---|
| 컴포넌트 단위 테스트 (Storybook 등) | 본 문서의 fixture 객체를 그대로 import |
| 페이지 단위 통합 테스트 | MSW (Mock Service Worker)로 endpoint 단위 mock |
| 백엔드 빌드 전 UI 선개발 | MSW handlers + 본 문서 fixture로 일주일 단위 prototype 가능 |
| 배포된 staging 백엔드 사용 | mock 사용 안 함. 실 API 호출 |

## 2. 공통 envelope helper

```ts
// mocks/envelope.ts
export const ok = <T>(result: T, message = 'Success') => ({
  code: 'SUCCESS',
  message,
  result,
});

export const err = (code: string, message: string, result: unknown = null) => ({
  code,
  message,
  result,
});

export const cursorPage = <T>(items: T[], cursor: string | null = null, hasMore = false) => ({
  items,
  pagination: { cursor, hasMore, total: null as number | null },
});
```

## 3. Auth fixture

```ts
// mocks/auth.ts
import { ok } from './envelope';

export const mockSession = ok({
  userId: 'u_mock',
  sessionToken: 'mock.session.jwt',
  firebaseCustomToken: 'mock-custom-token',
  expiresAt: '2026-08-31T23:59:59Z',
  studentVerificationStatus: 'RESERVED',
});
```

## 4. User profile / stats / activity

```ts
// mocks/users.ts
import { ok, cursorPage } from './envelope';

export const mockMe = ok({
  userId: 'u_mock',
  name: '이동혁',
  schoolId: 'ajou',
  schoolName: '아주대학교',
  departmentId: 'ajou_csi',
  departmentName: '융합시스템공학과',
  studentNumberMasked: '2020****',
  enrollmentStatus: 'RESERVED',
  sessionExpiresAt: '2026-08-31T23:59:59Z',
});

export const mockMyStats = ok({
  posts: 47,
  comments: 312,
  likesReceived: 89,
  scraps: 12,
  juryVotes: 4,
});

export const mockMyPosts = ok(cursorPage([
  {
    postId: 'p_001',
    boardId: 'free',
    title: '기숙사 식단의 질이 아쉽습니다',
    preview: '이번 학기 식단 개편 후...',
    createdAt: '2026-05-09T08:15:00Z',
    likes: 24,
    comments: 7,
  },
], null, false));

export const mockMyComments = ok(cursorPage([
  {
    commentId: 'c_001',
    postId: 'p_001',
    content: '저도 동감합니다',
    parentCommentId: null,
    deleted: false,
    createdAt: '2026-05-09T08:30:00Z',
  },
  {
    commentId: 'c_002',
    postId: 'p_001',
    content: '삭제된 댓글입니다.',
    parentCommentId: null,
    deleted: true,            // 마스킹된 채로 list에 남음
    createdAt: '2026-05-09T08:25:00Z',
  },
]));

export const mockMyLikes = ok(cursorPage([
  {
    postId: 'p_002',
    boardId: 'free',
    title: '시험기간 카페 추천',
    preview: '...',
    likedAt: '2026-05-09T09:00:00Z',
  },
]));

export const mockMyScraps = ok(cursorPage([
  {
    postId: 'p_001',
    boardId: 'free',
    boardName: '자유게시판',
    title: '기숙사 식단의 질이 아쉽습니다',
    preview: '이번 학기 식단 개편 후...',
    createdAt: '2026-05-09T08:15:00Z',
    scrappedAt: '2026-05-10T09:00:00Z',
    stats: { likes: 24, comments: 7, scraps: 3 },
  },
]));
```

## 5. Posts / Feed / Comments / Scrap

```ts
// mocks/posts.ts
import { ok, cursorPage } from './envelope';

export const mockFeed = ok(cursorPage([
  {
    postId: 'p_001',
    boardId: 'free',
    title: '기숙사 식단의 질이 아쉽습니다',
    preview: '이번 학기 식단 개편 후 만족도가...',
    anonymousId: '익명_a3f9',
    createdAt: '2026-05-09T08:15:00Z',
    stats: { likes: 24, comments: 7, scraps: 3 },
  },
  {
    postId: 'p_002',
    boardId: 'free',
    title: '시험기간 카페 추천',
    preview: '도서관 옆 OOO 카페가...',
    anonymousId: '익명_b1c2',
    createdAt: '2026-05-09T09:00:00Z',
    stats: { likes: 12, comments: 3, scraps: 1 },
  },
], 'eyJjdXJzb3IiOiJtb2NrIn0', true));

export const mockPostDetail = ok({
  postId: 'p_001',
  boardId: 'free',
  title: '기숙사 식단의 질이 아쉽습니다',
  content: '이번 학기 식단 개편 후 만족도가 떨어진 것 같습니다. 특히 점심...',
  tags: ['기숙사', '학식'],
  anonymousId: '익명_a3f9',
  visibility: 'PUBLIC',
  status: 'PUBLISHED',
  createdAt: '2026-05-09T08:15:00Z',
  updatedAt: '2026-05-09T08:15:00Z',
  stats: { likes: 24, comments: 7, scraps: 3 },
});

export const mockPostCreated = ok({
  postId: 'p_new',
  boardId: 'free',
  createdAt: '2026-05-10T10:00:00Z',
  url: '/post/p_new',
}, '게시글이 작성되었습니다');

export const mockLikeOn = ok({ postId: 'p_001', liked: true, likes: 25 });
export const mockLikeOff = ok({ postId: 'p_001', liked: false, likes: 24 });

export const mockScrapOn = ok({ postId: 'p_001', scrapped: true, totalScraps: 4 });

export const mockReportCreated = ok(
  { reportId: 'r_001', status: 'RECEIVED' },
  '신고가 접수되었습니다',
);

export const mockComments = ok(cursorPage([
  {
    commentId: 'c_001',
    postId: 'p_001',
    anonymousId: '익명_x1y2',
    content: '저도 이번 학기 식단 별로였어요',
    parentCommentId: null,
    deleted: false,
    likes: 3,
    createdAt: '2026-05-09T08:30:00Z',
  },
  {
    commentId: 'c_002',
    postId: 'p_001',
    anonymousId: '익명_z3w4',
    content: '저번 학기보다 좋아진 것 같은데...',
    parentCommentId: 'c_001',
    deleted: false,
    likes: 0,
    createdAt: '2026-05-09T08:35:00Z',
  },
]));
```

## 6. Courses

```ts
// mocks/courses.ts
import { ok, cursorPage } from './envelope';

export const mockCourseSearch = ok(cursorPage([
  {
    courseId: 'c_001',
    schoolId: 'ajou',
    courseName: '데이터구조',
    professor: '김교수',
    semester: '2026-1',
  },
  {
    courseId: 'c_002',
    schoolId: 'ajou',
    courseName: '알고리즘',
    professor: '박교수',
    semester: '2026-1',
  },
]));

export const mockCourseDetail = ok({
  courseId: 'c_001',
  courseName: '데이터구조',
  professor: '김교수',
  semester: '2026-1',
  recommend: 12,
  notRecommend: 3,
  skip: 2,
  total: 17,
  recommendRate: 0.8,
});

export const mockReviewQuotaRequired = err(
  'REVIEW_QUOTA_REQUIRED',
  '강의평 작성 후 열람 가능합니다',
);

export const mockCourseReviewCreated = ok(
  {
    reviewId: 'rv_001',
    courseId: 'c_001',
    stats: {
      recommend: 13,
      notRecommend: 3,
      skip: 2,
      total: 18,
      recommendRate: 0.8125,
    },
  },
  '강의평이 등록되었습니다',
);
```

## 7. Notifications / Jury

```ts
// mocks/notifications.ts
import { ok, cursorPage } from './envelope';

export const mockNotifications = ok(cursorPage([
  {
    notificationId: 'n_001',
    type: 'POST_COMMENT',
    title: '댓글이 달렸습니다',
    body: '저도 이번 학기 식단 별로였어요',
    isRead: false,
    createdAt: '2026-05-09T08:30:00Z',
  },
  {
    notificationId: 'n_002',
    type: 'POST_LIKE',
    title: '게시글에 좋아요',
    body: '누군가 회원님의 글을 추천했습니다',
    isRead: true,
    createdAt: '2026-05-09T08:00:00Z',
  },
]));
```

```ts
// mocks/jury.ts
import { ok } from './envelope';

export const mockJuryCase = ok({
  caseId: 'case_001',
  departmentId: 'ajou_csi',
  status: 'OPEN',
  summonedJurors: ['u_mock', 'u_b', 'u_c'],
  createdAt: '2026-05-08T00:00:00Z',
  closesAt: '2026-05-10T00:00:00Z',
});

export const mockJuryVote = ok({
  caseId: 'case_001',
  userId: 'u_mock',
  verdict: 'PROBLEMATIC',
  problematicVotes: 5,
  okVotes: 2,
}, '투표가 등록되었습니다');
```

## 8. Reserved fixtures

```ts
// mocks/reserved.ts
export const mockReserved = {
  status: 501,
  body: {
    code: 'FEATURE_RESERVED',
    message: '현재 버전에서 구현하지 않는 예약 기능입니다.',
    result: null,
  },
};
```

4개 Reserved endpoint 모두 동일 응답.

## 9. Validation 에러 fixture

```ts
// mocks/errors.ts
export const mockValidationFailed = {
  status: 400,
  body: {
    code: 'VALIDATION_FAILED',
    message: '입력값 검증에 실패했습니다',
    result: {
      fields: [
        { field: 'title', reason: '최소 2자 이상이어야 합니다' },
        { field: 'content', reason: '본문은 10~5000자여야 합니다' },
      ],
    },
  },
};

export const mockAuthExpired = {
  status: 401,
  body: { code: 'AUTH_EXPIRED', message: '세션이 만료되었습니다', result: null },
};

export const mockNotFound = {
  status: 404,
  body: { code: 'NOT_FOUND', message: '리소스를 찾을 수 없습니다', result: null },
};

export const mockReportDuplicate = {
  status: 422,
  body: { code: 'REPORT_DUPLICATE', message: '이미 신고한 게시글입니다', result: null },
};

export const mockBusinessRuleViolation = {
  status: 422,
  body: {
    code: 'BUSINESS_RULE_VIOLATION',
    message: '학교 정보가 등록되지 않은 사용자는 school 피드를 조회할 수 없습니다',
    result: null,
  },
};
```

## 10. MSW handlers (예시)

```ts
// mocks/handlers.ts
import { http, HttpResponse } from 'msw';
import { mockSession, mockMe, mockMyStats, mockMyPosts } from './users';
import { mockFeed, mockPostDetail, mockComments } from './posts';
import { mockReserved, mockValidationFailed } from './errors';

const BASE = import.meta.env.VITE_API_BASE;

export const handlers = [
  http.post(`${BASE}/v1/auth/session`, () => HttpResponse.json(mockSession)),

  http.get(`${BASE}/v1/users/me`, () => HttpResponse.json(mockMe)),
  http.get(`${BASE}/v1/users/me/stats`, () => HttpResponse.json(mockMyStats)),
  http.get(`${BASE}/v1/users/me/posts`, () => HttpResponse.json(mockMyPosts)),

  http.get(`${BASE}/v1/posts`, () => HttpResponse.json(mockFeed)),
  http.get(`${BASE}/v1/posts/:postId`, () => HttpResponse.json(mockPostDetail)),
  http.get(`${BASE}/v1/posts/:postId/comments`, () => HttpResponse.json(mockComments)),

  // Reserved 4개
  http.post(`${BASE}/v1/auth/student-card/verify`,
            () => HttpResponse.json(mockReserved.body, { status: 501 })),
  http.post(`${BASE}/v1/ai/refine`,
            () => HttpResponse.json(mockReserved.body, { status: 501 })),
  http.get(`${BASE}/v1/recap/:semester`,
           () => HttpResponse.json(mockReserved.body, { status: 501 })),
  http.get(`${BASE}/v1/recap/schools/:schoolId/:semester`,
           () => HttpResponse.json(mockReserved.body, { status: 501 })),

  // 폼 validation 실패 시나리오 (조건부)
  http.post(`${BASE}/v1/posts`, async ({ request }) => {
    const body = await request.json() as any;
    if (!body.title || body.title.length < 2) {
      return HttpResponse.json(mockValidationFailed.body, { status: 400 });
    }
    return HttpResponse.json({
      code: 'SUCCESS',
      message: '게시글이 작성되었습니다',
      result: {
        postId: 'p_new',
        boardId: body.boardId,
        createdAt: new Date().toISOString(),
        url: '/post/p_new',
      },
    });
  }),
];
```

## 11. RTDB mock (Firebase Emulator 권장)

RTDB read subscription을 mock하려면 두 가지 방법:

### 11.1 Firebase Emulator (권장)

```bash
firebase emulators:start --only database
```

프론트의 `databaseURL`을 emulator로 가리킨 뒤 mock 데이터를 emulator에 직접 seed:

```ts
// mocks/seed-rtdb.ts (개발 모드 전용)
import { ref, set } from 'firebase/database';
import { db } from '../firebase-client';

export async function seedDevRtdb() {
  await set(ref(db, '/post_feeds/all/p_001'), {
    postId: 'p_001',
    createdAt: '2026-05-09T08:15:00Z',
    boardId: 'free',
    title: '기숙사 식단의 질이 아쉽습니다',
    preview: '이번 학기 식단 개편 후...',
    schoolId: 'ajou',
    departmentId: 'ajou_csi',
  });
  await set(ref(db, '/post_stats/p_001'), { likes: 24, comments: 7, scraps: 3 });
}
```

emulator는 룰을 적용하므로, **인증된 사용자**로 emulator 로그인 후 seed 해야 한다 (그렇지 않으면 룰 거부). emulator는 보통 보안 룰을 무시하는 모드도 제공.

### 11.2 onValue 대체 mock (권장하지 않음)

`onValue`를 모킹하기는 까다롭다. 대신 Firebase Emulator를 사용하거나, 컴포넌트 단위 테스트에서는 onValue 호출 자체를 mock해 callback에 mock 데이터를 즉시 전달하는 패턴.

```ts
// jest.setup.ts
jest.mock('firebase/database', () => ({
  ...jest.requireActual('firebase/database'),
  onValue: jest.fn((_ref, callback) => {
    callback({ val: () => ({ likes: 24, comments: 7, scraps: 3 }) });
    return () => {};   // unsubscribe
  }),
}));
```

## 12. Mock 데이터 동기화 의무

백엔드 DTO가 변경되면 본 문서의 fixture와 MSW handlers를 동시에 업데이트한다. 그렇지 않으면 mock으로 통합 테스트한 코드가 실제 백엔드와 불일치.

체크리스트:
- [ ] `01_FRONTEND_API_CONTRACT.md`의 응답 예시와 본 문서 fixture가 형식 일치
- [ ] 응답 envelope (`code`/`message`/`result`) 변경 없음 — 본 문서는 항상 envelope 포함

## 13. 절대 만들지 말아야 할 것

- ❌ Reserved endpoint를 mock으로 200 OK 응답 — Reserved 정책 위반. 항상 501 + FEATURE_RESERVED.
- ❌ studentVerificationStatus를 VERIFIED로 mock — 백엔드는 항상 RESERVED. UI가 VERIFIED 분기를 가정하면 실 백엔드 연결 시 깨짐.
- ❌ `total` 필드를 0이 아닌 값으로 mock — 백엔드는 항상 null. UI가 total 의존하면 안 됨.
- ❌ cursor를 직접 만든 형식으로 — opaque 문자열 그대로 사용 ([`06_PAGINATION_CONTRACT.md §5.1`](06_PAGINATION_CONTRACT.md#51-cursor는-opaque)).
