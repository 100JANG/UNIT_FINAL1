# Frontend RTDB Subscription Contract

> 본 문서는 프론트가 Firebase Realtime Database에서 **직접 read subscription**할 수 있는 경로의 단일 출처이다.
> 실제 적용 룰은 [`../database.rules.json`](../database.rules.json), 사양은 [`../database/03_SECURITY_RULES.md`](../database/03_SECURITY_RULES.md).
> 본 문서와 코드/룰 간 불일치가 있으면 룰을 정답으로 본다.

## 0. 절대 원칙

1. **프론트는 어떤 RTDB 경로에도 write하지 않는다.** 모든 경로 `.write=false`. Firebase가 즉시 `PERMISSION_DENIED`로 거부한다.
2. **모든 변경은 REST API 통과.** 백엔드 Spring Boot가 Admin SDK로 RTDB write를 수행 (Admin SDK는 Security Rules를 우회하므로 영향 없음).
3. **인증되지 않은 사용자는 어떤 경로도 read 불가.** root에 `.read=false` default-deny 적용. 프론트는 `firebaseCustomToken`으로 `signInWithCustomToken` 한 뒤에만 read subscription 가능.
4. **Reserved 기능 경로**(`/ai`, `/ocr`, `/gemma`, `/recap`, `/moderation`, `/student_registry`, `/pwa`, `/service_worker`)**는 만들지 않는다.** 룰도 없으므로 default-deny에 의해 자동 차단.

## 1. Firebase 프론트 setup (예시)

```ts
// firebase-client.ts
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken } from 'firebase/auth';
import { getDatabase, ref, onValue, off } from 'firebase/database';

export const app = initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
});
export const auth = getAuth(app);
export const db = getDatabase(app);

// 로그인 직후 — POST /v1/auth/session 응답의 firebaseCustomToken 사용
export async function loginRtdb(firebaseCustomToken: string) {
  await signInWithCustomToken(auth, firebaseCustomToken);
}
```

## 2. 경로별 subscription 계약

### 2.1 Posts / Feed

#### `/post_feeds/all`
- **용도**: 글로벌 최신 피드 신규 글 도착 알림.
- **사용 화면**: `/feed` 홈, scope=all 탭.
- **read 조건**: `auth != null` (인증 사용자 전체).
- **write**: false.
- **`.indexOn`**: `["createdAt", "hotScore", "commentCount"]` (현재 `createdAt`만 사용).
- **권장 사용 패턴**: 첫 진입 시 `GET /v1/posts?scope=all&sort=latest`로 페이지 fetch + 같은 path에 `onValue` 구독해 신규 글 추가만 incremental update.
- **주의**: 전체 자식을 다 받으면 비용이 큰다. 가능하면 `query(ref, orderByChild('createdAt'), limitToLast(20))` 형태로 구독 범위 제한.

```ts
import { ref, query, orderByChild, limitToLast, onValue } from 'firebase/database';

const feedRef = query(ref(db, '/post_feeds/all'),
                      orderByChild('createdAt'), limitToLast(20));
const unsub = onValue(feedRef, snapshot => {
  const items = [];
  snapshot.forEach(child => items.push({ postId: child.key, ...child.val() }));
});
// cleanup: unsub() 또는 off(feedRef)
```

#### `/post_feeds/schools/{schoolId}`
- **용도**: 학교 피드 실시간.
- **사용 화면**: `/feed` 학교 탭.
- **read 조건**: 현재 `auth != null` (인증 사용자 전체). **TODO**: custom token claim에 schoolId가 추가되면 `auth.token.schoolId == $schoolId`로 강화 — 현재는 path 위조 가능성 존재. ([`../database/03 §6 TODO`](../database/03_SECURITY_RULES.md#6-todo))
- **write**: false. **`.indexOn`**: `["createdAt", "hotScore", "commentCount"]`.

#### `/post_feeds/departments/{departmentId}`
- 위와 동일 패턴. 학과 피드.

#### `/posts/{postId}`
- **용도**: 게시글 본문 실시간 (수정/삭제 반영).
- **사용 화면**: `/post/:postId` 상세.
- **read 조건**: `auth != null`. write false.
- **주의**: `status`가 `DELETED_BY_AUTHOR`/`REMOVED_BY_ADMIN`이면 프론트가 알아서 마스킹/숨김 처리. (백엔드 REST는 NOT_FOUND로 막지만 RTDB는 본문이 그대로 보임.)

#### `/post_stats/{postId}`
- **용도**: likes/comments/scraps 카운터 실시간 동기화.
- **사용 화면**: 상세 페이지 좋아요/스크랩/댓글 수 실시간.
- read 조건: `auth != null`. write false. indexOn: 없음 (단일 노드).

```ts
onValue(ref(db, `/post_stats/${postId}`), snap => {
  const { likes = 0, comments = 0, scraps = 0 } = snap.val() ?? {};
  setStats({ likes, comments, scraps });
});
```

#### `/post_likes/{postId}`, `/post_scraps/{postId}`
- **용도**: "이 글에 누가 좋아요/스크랩했나" — 본인 표시 toggle 동기화 등에 사용.
- read 조건: `auth != null`. write false.
- 권장: 본인 한 키만 read (`/post_likes/{postId}/{myUserId}`)해서 boolean 동기화.

### 2.2 Comments

#### `/comments/{postId}`
- **용도**: 댓글 list 실시간.
- **사용 화면**: 게시글 상세의 댓글 영역.
- read 조건: `auth != null`. write false.
- **`.indexOn`**: `["createdAt"]`.

```ts
const cref = query(ref(db, `/comments/${postId}`),
                    orderByChild('createdAt'), limitToFirst(20));
onValue(cref, snap => { /* incremental render */ });
```

#### `/comment_stats/{commentId}`, `/comment_likes/{commentId}`
- 댓글 좋아요 카운터 + 본인 좋아요 표시. read `auth != null`, write false.

### 2.3 Courses

#### `/courses/{courseId}`
- 강의 본체. read `auth != null`, write false.

#### `/courses_by_school/{schoolId}`
- 학교별 강의 검색 인덱스. read `auth != null`, write false. **`.indexOn`**: `["courseName", "professor", "semester"]`.
- 검색은 REST `GET /v1/courses?schoolId=...&q=...`를 사용하는 것이 권장. 직접 RTDB query는 권장하지 않음 (semester 후처리, q contains 등 server-side에서만 정확).

#### `/course_reviews/{courseId}`
- 강의평 list 실시간. read `auth != null`, write false.

#### `/course_stats/{courseId}`
- 강의평 stats 카운터. read `auth != null`, write false.

### 2.4 Notifications

#### `/notifications/{userId}`
- **용도**: 알림 push 실시간.
- **사용 화면**: 헤더의 알림 뱃지, 알림 리스트 화면.
- **read 조건**: `auth != null && auth.uid == $userId` — **본인만**.
- write false. **`.indexOn`**: `["createdAt", "isRead"]`.

```ts
const myUid = auth.currentUser!.uid;
onValue(ref(db, `/notifications/${myUid}`), snap => {
  const map = snap.val() ?? {};
  const items = Object.entries(map)
    .map(([id, v]) => ({ notificationId: id, ...v }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  setNotifications(items);
});
```

### 2.5 User activity (본인만)

#### `/user_posts/{userId}`, `/user_comments/{userId}`, `/user_likes/{userId}`, `/user_scraps/{userId}`, `/user_stats/{userId}`
- **read 조건**: `auth != null && auth.uid == $userId` — **본인만**.
- write false.
- **`.indexOn`** (각 노드별):
  - `user_posts/$userId`: `["createdAt"]`
  - `user_comments/$userId`: `["createdAt"]`
  - `user_likes/$userId`: `["likedAt"]`
  - `user_scraps/$userId`: `["scrappedAt"]`
  - `user_stats/$userId`: 없음 (단일 노드)
- **사용**: 프론트가 RTDB 직접 쿼리해도 되지만, REST `/v1/users/me/*`가 boardName lookup, 삭제글 필터, deleted 댓글 마스킹 등 후처리를 수행하므로 **REST 우선 권장**. 실시간 동기화가 필요할 때만 RTDB 구독.

#### `/users/{userId}`
- 본인 프로필. read `auth.uid == $userId`. write false.

### 2.6 Jury

#### `/jury_cases/{caseId}`
- **사용 화면**: `/jury/:caseId`.
- **read 조건**: 현재 `auth != null` (인증 사용자 전체).
  **TODO**: summonedJurors 기반 제한 — `/jury_cases_summoned/{userId}/{caseId}` 인덱스 노드 추가 후 강화 예정 ([`../database/03 §6 TODO`](../database/03_SECURITY_RULES.md#6-todo)). 현재는 백엔드 `JuryService.getCase`가 `JURY_NOT_AUTHORIZED`로 거부하므로 REST 경유는 안전.
- write false.

#### `/jury_votes/{caseId}`
- 투표 결과 read. write false.

#### `/jury_case_stats/{caseId}`
- 투표 진척 카운터. 실시간 진행률 표시에 사용.

```ts
onValue(ref(db, `/jury_case_stats/${caseId}`), snap => {
  const { problematic = 0, ok = 0 } = snap.val() ?? {};
  setVoteStats({ problematic, ok });
});
```

## 3. 완전 차단 경로 (read 자체 거부)

다음 경로는 인증된 사용자도 RTDB 직접 read 불가. 데이터는 백엔드 응답으로만 받을 수 있다.

| 경로 | 사유 |
|---|---|
| `/reports/{reportId}` | 신고자/대상자 노출 차단. 신고는 백엔드만 read/write (Admin SDK는 룰 우회). |
| `/reports_by_post/{postId}` | 동일. |
| `/sessions/{userId}` (타인) | 본인 sessions만 read. 타 사용자 sessions 차단. |
| `/fcm_tokens/{userId}` (타인) | 동일. |
| `/review_locks/{userId}` (타인) | 동일. |
| `/users/{userId}` (타인) | 본인 프로필만 read. 타 사용자 private 정보 차단. |

## 4. 룰 자체가 만들어지지 않은 경로 (default-deny)

다음 경로는 `database.rules.json`에 룰 자체가 없으므로 root의 default-deny에 의해 read/write 모두 차단된다.

```text
/ai/...
/ocr/...
/gemma/...
/recap/...
/moderation/...
/moderation_results/...
/moderation_rules/...
/student_registry/...
/pwa/...
/service_worker/...
/ai_refine/...
/ai_judgments/...
/ocr_results/...
/recaps/...
/recap_jobs/...
```

프론트가 이 경로를 시도하면 즉시 `PERMISSION_DENIED`. Reserved 기능은 REST 경유로도 `501 FEATURE_RESERVED`만 반환되므로 어떤 우회 경로도 없다 ([`04_RESERVED_FEATURE_CONTRACT.md`](04_RESERVED_FEATURE_CONTRACT.md)).

## 5. 직접 write 시도 시 어떤 일이 일어나는가

```ts
// ❌ 절대 금지
await set(ref(db, `/posts/p_xxx`), { title: 'hacked' });
```

→ Firebase 즉시 거부:
```
Error: Permission denied
  at @firebase/database
  PERMISSION_DENIED: Permission denied
```

→ RTDB 데이터 변동 없음. 백엔드 transaction 일관성 보장.

→ 프론트는 이 시도를 catch해서 사용자에게 "변경은 서버를 통해서만 가능합니다" 형태의 generic 메시지를 노출하지 말 것 — 정상 흐름에서는 발생하지 않아야 하므로, 발생 시 sentry 등에 보고해 코드 버그로 식별.

올바른 패턴:

```ts
// ✅ REST 호출 → 백엔드가 RTDB write → 구독 중인 path에 새 데이터 도달
await api.post(`/v1/posts/${postId}/like`);   // 백엔드가 /post_stats/{postId}/likes +1
// 같은 시점에 /post_stats/{postId} 구독자는 새 likes 값 자동 수신
```

## 6. Subscription 라이프사이클 (메모리 누수 방지)

React에서 `onValue` 구독 후 cleanup을 빠뜨리면 컴포넌트 unmount 후에도 구독이 유지되어 메모리 누수 + 불필요 트래픽이 발생한다.

```tsx
useEffect(() => {
  const r = ref(db, `/post_stats/${postId}`);
  const unsub = onValue(r, snap => setStats(snap.val()));
  return () => unsub();   // 또는 off(r)
}, [postId]);
```

`postId`가 바뀔 때마다 구독을 갈아끼우는 패턴이 안전. 라우트 변경 시 자동 cleanup.

## 7. 디버그 팁

- 룰 거부 시: Firebase Console > Database > Logs에서 PERMISSION_DENIED 발생 path/uid 확인.
- 인덱스 미사용 경고: 콘솔에 `Using an unspecified index` warning이 뜨면 `.indexOn` 누락. 즉시 [`../database/03 §5`](../database/03_SECURITY_RULES.md) 표와 대조해 코드/룰 정합성 확인.
- 테스트 환경에서는 Firebase emulator 사용을 권장. `firebase emulators:start --only database` 후 `databaseURL`을 emulator로 가리키면 된다 — 룰 검증도 동일하게 적용된다.
