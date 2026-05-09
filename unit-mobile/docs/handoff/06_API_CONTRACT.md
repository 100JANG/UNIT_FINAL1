# 06. API 계약 (REST + WS)

> 백엔드와 합의된 형태가 있다면 그걸로 덮어씌우고, 없다면 이걸 초안으로 사용.

## REST 공통

- Base: `/v1`
- Auth: `Authorization: Bearer {jwt}` (AsyncStorage `unit.token`)
- Cursor 페이징: `?cursor=&limit=20` → `{ items, nextCursor }`
- 에러: `{ code: 'ERR_BLOCKED', message: '...' }` + status

## 인증

```
POST /v1/auth/email-otp
  body { email }                → { sent: true, expires: number }

POST /v1/auth/verify
  body { email, code }          → { token, isNewUser }

GET  /v1/me                     → User
PUT  /v1/me/profile             → User
DELETE /v1/me                   → 204
```

## 피드

```
GET  /v1/posts?board=&cursor=   → { items: Post[], nextCursor }
GET  /v1/posts/:id              → Post + comments
POST /v1/posts                  → Post (multipart: title, body, board, anonymous, photos[])
POST /v1/posts/:id/like         → { liked, likes }
POST /v1/posts/:id/scrap        → { scrapped, scraps }
POST /v1/posts/:id/report       → 204

POST /v1/comments               → Comment (postId, body, parentId?)
POST /v1/comments/:id/like      → { liked, likes }
GET  /v1/comments/:id/thread    → CommentThread
```

## 강의평

```
GET  /v1/courses?search=&dept=  → Course[]
GET  /v1/courses/:id            → CourseDetail
POST /v1/courses/:id/vote       → { rec, no, total } (body: { vote: 'rec'|'no' })
POST /v1/courses/:id/review     → Review
```

## 캠퍼스

```
GET /v1/timetable               → Timetable
GET /v1/friends/timetable?ids=  → Timetable[]
GET /v1/meal?date=YYYY-MM-DD    → MealMenu[]
GET /v1/bus/routes              → BusRoute[]
GET /v1/bus/eta?route=          → { eta: number, next: number[] }
GET /v1/library/rooms           → LibraryRoom[]
GET /v1/contacts                → ContactGroup[]
GET /v1/contest                 → Contest[]
GET /v1/jobs                    → Job[]
GET /v1/market                  → MarketItem[]
POST /v1/market                 → MarketItem
```

## 채팅

```
GET /v1/chats                   → ChatRoom[]
GET /v1/chats/:id/messages      → Message[]
WS  /ws/chat/:id
  → server: { type: 'msg', data: Message }
        | { type: 'typing', userId }
        | { type: 'read', messageId, userId }
  ← client: { type: 'send', body }
```

## 알림

```
GET   /v1/notifications         → Notification[]
PATCH /v1/notifications/read-all
PATCH /v1/notifications/:id/read
```

## 자치 (배심원)

```
GET  /v1/jury                   → JuryCase[]
POST /v1/jury/:id/vote          → { vote: 'keep'|'remove'|'skip' }
```

## 매너 학점

```
GET /v1/me/manner               → {
  grade: 'A+' | ... | 'F',
  score: number,             // 0~100
  axes: { kindness, truth, activity, reports },  // 0~100
  history: ManerEvent[],
  rules: { weights, principles }
}
```

## 검색

```
GET /v1/search?q=&type=         → {
  posts: Post[],
  courses: Course[],
  users: UserSummary[],
  market: MarketItem[]
}
GET /v1/search/trends           → { recent, popular: { word, dir, change }[], updatedAt }
```

## 모더레이션

```
GET /v1/me/blocks               → User[]
DELETE /v1/me/blocks/:id        → 204
GET /v1/friends/requests        → { in: Req[], out: Req[] }
POST /v1/friends/requests/:id/accept
POST /v1/friends/requests/:id/reject
POST /v1/reports                → Report
```

## 내 활동

```
GET /v1/me/posts                → Post[]
GET /v1/me/comments             → Comment[]
GET /v1/me/scraps?type=         → ScrapItem[]
```

## 타입 정의 (TS)

```ts
// src/types/unit.ts
export type Grade = 'A+'|'A0'|'B+'|'B0'|'C+'|'C0'|'D+'|'D0'|'F';
export type User = { id: string; nick: string; school: string; dept: string; year: number;
  manner: { grade: Grade; score: number }; };
export type Post = { id: number; board: string; nick: string; time: string;
  title: string; body: string; photos?: string[]; up: number; cmt: number; scrap: number;
  liked?: boolean; scrapped?: boolean; tags?: string[]; };
export type Comment = { id: number; postId: number; nick: string; time: string;
  body: string; up: number; liked?: boolean; parentId?: number; };
export type Course = { id: number; name: string; prof: string; dept: string;
  credit: number; rec: number; total: number; };
// ... 나머지 타입은 화면 사양 따라 추가
```
