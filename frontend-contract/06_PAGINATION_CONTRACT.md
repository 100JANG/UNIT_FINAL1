# Frontend Pagination Contract

> 모든 cursor 기반 list endpoint가 따르는 통일 정책.
> 단일 출처: 백엔드 `kr.unit.backend.common.api.CursorCodec` + `PaginationLimits`.
> 본 문서는 그것의 프론트 사용 시점 약속만 정리한다.

## 1. 응답 envelope

모든 list 응답은 동일 구조:

```json
{
  "code": "SUCCESS",
  "message": "Success",
  "result": {
    "items": [...],
    "pagination": {
      "cursor": "eyJpZCI6...",
      "hasMore": true,
      "total": null
    }
  }
}
```

| 필드 | 타입 | 의미 |
|---|---|---|
| `items` | array | 페이지 데이터 (도메인별 DTO) |
| `pagination.cursor` | string \| null | 다음 페이지 cursor. **다음 페이지가 없으면 `null`**. |
| `pagination.hasMore` | boolean | 다음 페이지 존재 여부 |
| `pagination.total` | long \| null | 전체 개수. **항상 `null`이라고 가정.** 비용 큰 지표라 백엔드가 채우지 않음. |

## 2. Query parameters

| 이름 | 타입 | 기본 | 최대 | 비고 |
|---|---|---|---|---|
| `cursor` | string | (없음) | — | 첫 페이지는 cursor 없이 호출. 이후 응답의 `pagination.cursor`를 그대로 다음 호출에 전달. |
| `limit` | int | **20** | **50** | 0 또는 음수 → 기본 20으로 fallback. 50 초과 → 50으로 clamp. |

> **예외**: `GET /v1/notifications`는 역사적으로 `size` 파라미터를 사용한다 (기본 50, 최대 100, 최소 1). 다음 사이클에 통일 예정. 자세한 내용은 [`09_KNOWN_LIMITATIONS.md`](09_KNOWN_LIMITATIONS.md).

## 3. 정렬 방향

| Endpoint | 정렬 |
|---|---|
| `GET /v1/posts` (scope=all/school/department, sort=latest) | `createdAt` DESC |
| `GET /v1/posts/{postId}/comments` | `createdAt` ASC (작성 순) |
| `GET /v1/courses` | `courseName` ASC |
| `GET /v1/users/me/posts` | `createdAt` DESC |
| `GET /v1/users/me/comments` | `createdAt` DESC |
| `GET /v1/users/me/likes` | `likedAt` DESC |
| `GET /v1/users/me/scraps` | `scrappedAt` DESC |
| `GET /v1/notifications` | `createdAt` DESC (백엔드 메모리 정렬, cursor 미지원 — 다음 사이클에 인덱스 쿼리 전환) |

## 4. 사용 패턴

### 4.1 첫 페이지 + 더 보기 버튼 (기본 패턴)

```ts
const [items, setItems] = useState<FeedItem[]>([]);
const [cursor, setCursor] = useState<string | null>(null);
const [hasMore, setHasMore] = useState(true);

async function loadMore() {
  const { data } = await api.get('/v1/posts', {
    params: { scope: 'all', sort: 'latest', limit: 20, cursor: cursor ?? undefined },
  });
  setItems(prev => [...prev, ...data.result.items]);
  setCursor(data.result.pagination.cursor);
  setHasMore(data.result.pagination.hasMore);
}

useEffect(() => { loadMore(); /* 첫 페이지 */ }, []);
```

### 4.2 무한 스크롤 (TanStack Query 권장)

```ts
import { useInfiniteQuery } from '@tanstack/react-query';

const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: ['feed', 'all'],
  queryFn: ({ pageParam }) =>
    api.get('/v1/posts', {
      params: { scope: 'all', sort: 'latest', limit: 20, cursor: pageParam },
    }).then(r => r.data.result),
  initialPageParam: undefined,
  getNextPageParam: lastPage =>
    lastPage.pagination.hasMore ? lastPage.pagination.cursor : undefined,
});
```

## 5. cursor 다루기 — 절대 규칙

### 5.1 cursor는 opaque

cursor는 백엔드가 base64로 인코딩한 `<timestamp>|<id>` 또는 `<primary>|<id>` 문자열이다. **프론트는 절대 cursor를 파싱/조합/생성하지 말 것.** 잘못된 cursor는 `400 INVALID_REQUEST`로 거부된다.

```ts
// ❌ 절대 금지
const customCursor = btoa(`${someTime}|${someId}`);
api.get('/v1/posts', { params: { cursor: customCursor } });

// ✅ 직전 응답의 cursor 그대로 사용
api.get('/v1/posts', { params: { cursor: lastResponse.pagination.cursor } });
```

### 5.2 cursor가 null이면 더 이상 호출 금지

`hasMore=false` 또는 `cursor=null`이면 다음 페이지가 없다. 호출하지 말 것.

### 5.3 cursor는 정렬 변경에 무효

scope/sort/q 등 query parameter를 바꾼 채로 같은 cursor를 사용하면 동작이 미정의. 정렬 조건이 바뀌면 cursor를 버리고 첫 페이지부터 다시 시작.

```ts
// 사용자가 sort를 'latest'에서 'hot'으로 바꿨다면
setCursor(null);
setItems([]);
loadMore();
```

## 6. 가시 페이지 < limit 가능성 (트레이드오프)

다음 endpoint들은 query window를 가져온 뒤 **service-side에서 추가 필터**를 적용한다:

| Endpoint | 필터 |
|---|---|
| `GET /v1/users/me/posts` | 삭제된 글(`DELETED_BY_AUTHOR`/`REMOVED_BY_ADMIN`) 제외 |
| `GET /v1/users/me/likes` | 삭제된 글 제외 |
| `GET /v1/users/me/scraps` | 삭제된 글 제외 |
| `GET /v1/posts` | 삭제된 글 + boardId 필터 |

이 필터로 인해 **가시 `items.length`가 `limit`보다 작아질 수 있다.** 동시에 `hasMore=true`이고 `cursor`가 발급될 수 있다.

이는 정상 동작이다 — cursor advance 정책이 "query window 마지막 인덱스 entry 기준"이기 때문에, 다음 페이지로 정확히 이어지면서 deleted 항목을 안전하게 건너뛴다.

```ts
// 예: limit=20, items.length=15, hasMore=true → 정상.
// "다음 페이지" 버튼을 그대로 노출.
```

**프론트 권장**:
- `items.length >= limit`을 가정하는 UI 코드 작성 금지.
- "더 보기" 버튼은 `hasMore`만 보고 노출.
- 무한 스크롤은 `hasMore`로 다음 fetch trigger.

## 7. 빈 페이지 (200 OK + items=[])

다음 endpoint들은 의도적으로 항상 빈 페이지를 응답한다 (현재 사이클 미구현):

| Endpoint | 사유 |
|---|---|
| `GET /v1/posts?sort=hot` | hotScore 인덱스 미사용 |
| `GET /v1/posts?sort=comments` | commentCount 인덱스 미사용 |
| `GET /v1/jury/me/cases` | summonedJurors 인덱스 설계 미완 |
| `GET /v1/courses` (schoolId 미지정) | schoolId 필수 — 미지정 시 빈 페이지 |

이 경우 `items=[]`, `hasMore=false`, `cursor=null`. 프론트는 빈 상태 UI를 노출하면 된다.

## 8. cursor 에러 처리

`400 INVALID_REQUEST`로 응답되는 케이스 (cursor 형식 오류):

```json
{ "code": "INVALID_REQUEST", "message": "cursor 형식이 올바르지 않습니다", "result": null }
```

이 경우는 **거의 항상 프론트 코드 버그** (cursor 직접 조작, 다른 endpoint cursor 재사용 등). 정상 흐름에서는 발생하지 않는다.

응답 시 처리:
```ts
if (resp.code === 'INVALID_REQUEST') {
  // cursor 폐기 + 첫 페이지부터 다시
  setCursor(null);
  loadMore();
}
```

## 9. 디버그용 cursor 인코딩 사실

운영 트래픽에서는 절대 의존하지 말 것. 디버깅 시점에만 참고:

- 형식: base64url(`<primary>|<id>`)
- `primary`는 정렬 필드 값:
  - timestamp 기반 (대부분): ISO-8601 timestamp (예: `2026-05-09T08:15:00Z`)
  - String 기반 (`/v1/courses`): courseName (예: `데이터구조`)
- `id`는 tie-breaker:
  - 댓글: `commentId`
  - 글/스크랩/좋아요: `postId`
  - 강의: `courseId`

cursor 디버깅 헬퍼 (개발자 도구 콘솔에서):
```js
const decoded = atob('eyJpZCI6...'.replace(/-/g, '+').replace(/_/g, '/'));
console.log(decoded);   // "2026-05-09T08:15:00Z|p_abc"
```

## 10. limit 정책 요약

| 입력 | 효과 |
|---|---|
| `limit=20` | 정상 |
| `limit=50` | 정상 (최대값) |
| `limit=999` | 50으로 clamp |
| `limit=0` | 기본값 20 |
| `limit=-5` | 기본값 20 |
| `limit` 누락 | 기본값 20 |
| `size=...` (`/v1/posts` 등) | **무시** — `size` 파라미터는 더 이상 받지 않는다 (3차 사이클에 정합성 정리). 단 `/v1/notifications`는 `size`만 사용. |

## 11. 백엔드 검증 (참고)

- `RealtimeDatabaseClientQueryTest`: cursor advance / limit / tie-break / 빈 path 동작.
- `PostCommentServiceTest.getComments_clampsLimitToFiftyMax`: limit=999 → 50건 + hasMore=true.
- `PostCommentServiceTest.getComments_zeroOrNegativeLimitFallsBackToDefault20`: limit=0 → 20건.
- `UserActivityServiceTest.pagination_clampsLimitToFifty` / `pagination_zeroOrNegativeLimitFallsBackToDefault`: 동일 정책.
- `UserActivityServiceTest.getMyPosts_excludesDeletedPosts`: 삭제 글 제외 후 가시 페이지가 limit보다 작아지는 동작 강제.

이 테스트들이 본 contract의 백엔드 보장 출처이다.
