# Frontend Contract — Known Limitations

> 본 문서는 현재 백엔드 사이클 기준의 **알려진 제약/누락/TODO**를 단일 출처로 정리한다.
> 프론트는 이 제약을 인지한 채로 구현한다 — 우회/대체 구현 금지.

## 1. 미구현 endpoint (200 OK + 빈 페이지 응답)

다음 호출은 응답을 받지만 의미 있는 데이터는 비어 있다.

| Endpoint | 응답 | 이유 |
|---|---|---|
| `GET /v1/posts?sort=hot` | items=[], hasMore=false | hotScore 기반 인덱스 미사용 (등재만 됨) |
| `GET /v1/posts?sort=comments` | items=[], hasMore=false | commentCount 인덱스 미사용 |
| `GET /v1/jury/me/cases` | items=[], hasMore=false | summonedJurors 기반 인덱스 노드 미설계 |

→ 프론트는 빈 상태 UI를 노출. "정렬 옵션이 준비 중"이라는 inline 안내는 선택.

## 2. 미구현 endpoint (404 / 라우팅 자체 없음)

다음 endpoint는 백엔드에 라우팅이 정의되지 않았다. 호출 시 Spring의 기본 NOT_FOUND 응답.

| Endpoint | 메모 |
|---|---|
| `PATCH /v1/posts/{postId}` | 게시글 수정 — 후속 사이클 |
| `DELETE /v1/posts/{postId}` | 게시글 삭제 — 후속 사이클 |
| `PATCH /v1/posts/{postId}/comments/{commentId}` | 댓글 수정 (DELETE는 구현됨) |
| `POST /v1/courses/{id}/reviews/{rid}/report` | 강의평 신고 — 후속 사이클 |
| `GET /v1/reports/me` | 내 신고 목록 — 후속 사이클 |
| `PATCH /v1/users/me/settings` | 사용자 설정 변경 — 후속 사이클 |
| `POST /v1/jury/cases` (수동 case 생성) | 관리자 도구 — 후속 사이클 |

→ 프론트는 해당 화면/버튼을 노출하지 말 것. 노출하려면 disabled + "준비 중" 표시.

## 3. 빈 페이지로 응답되지만 schoolId 의존인 endpoint

| Endpoint | 조건 | 응답 |
|---|---|---|
| `GET /v1/courses` (`schoolId` 미지정) | 빈 페이지 (`items=[]`) | schoolId 필수 — 미지정 시 빈 페이지로 응답 |
| `GET /v1/posts?scope=school` (사용자 schoolId 미등록) | `422 BUSINESS_RULE_VIOLATION` | `/users/{userId}/schoolId` 미등록 사용자 |
| `GET /v1/posts?scope=department` (departmentId 미등록) | `422 BUSINESS_RULE_VIOLATION` | 동일 |

→ 프론트 학교 등록 화면이 (Reserved OCR 외에) 별도로 없으므로, 신규 사용자는 scope=school/department를 사용할 수 없다. 임시로 scope=all로 fallback 권장.

## 4. 인증/세션 정책 한계

| 항목 | 현재 상태 | 영향 |
|---|---|---|
| `studentVerificationStatus` | 항상 `RESERVED` | 학생증 OCR이 Reserved이므로 어떤 흐름으로도 VERIFIED로 자동 승격되지 않음. 학생 인증을 전제로 한 UI 흐름은 만들지 말 것. |
| sessionToken 폐기 (logout) | stateless JWT — 서버측 폐기 없음 | logout 후에도 만료시각 전까지 그 토큰은 기술적으로 유효. 재사용 방지는 클라이언트 책임. |
| 다중 디바이스 세션 추적 | 미구현 | "다른 기기에서 로그아웃" 같은 기능 없음. 후속 ADR. |
| sessionToken refresh-loop 보호 | axios 인터셉터 자체 책임 | 백엔드는 refresh 요청에 rate limit 미적용. 프론트가 1회만 retry. |
| Custom Token claim에 schoolId/departmentId | **미포함** | school/department 피드 RTDB 직접 read 시 path 위조 가능성. REST 경유는 안전. (자세한 내용은 §7) |

## 5. 데이터 정합성 / 응답 형식 한계

| 항목 | 동작 |
|---|---|
| `pagination.total` | **항상 `null`**. 비용이 큰 지표라 백엔드가 채우지 않음. UI에서 total에 의존하지 말 것. |
| `GET /v1/notifications`의 `isRead` 필터 | **미지원** — 모든 알림이 createdAt DESC로 응답된다. unread-only 화면이 필요하면 클라이언트가 `items.filter(n => !n.isRead)`로 후처리. 후속 사이클에 별도 인덱스 노드 또는 query 옵션으로 추가 예정. |
| `pagination.hasMore=true`인데 `items.length < limit` | **정상 동작**. 삭제 글/board 필터로 가시 항목 줄어듦. cursor advance는 query window 마지막 기준. |
| `studentNumberMasked` | 학번 미등록자는 `null`. 등록자는 `"2020****"` 형식. UI가 null 처리. |
| `schoolName`/`departmentName` | `/schools/{id}/name`, `/departments/{id}/name` lookup. 메타가 없으면 `null`. UI가 null 처리. |

## 6. RTDB read 한계

| 항목 | 동작 |
|---|---|
| `/post_feeds/schools/{schoolId}` 직접 구독 | 룰은 `auth != null`만 검사 — 다른 학교 path도 인증된 사용자가 알면 read 가능. **TODO**: custom token claim 강화 후 `auth.token.schoolId == $schoolId`. ([§7](#7-todo-목록-우선순위-순)) |
| `/post_feeds/departments/{departmentId}` 동일 | 동일. |
| `/jury_cases/{caseId}` 직접 구독 | 룰은 `auth != null`만 검사 — summonedJurors 외 사용자도 read 가능. REST 경유 시 백엔드가 `JURY_NOT_AUTHORIZED`로 거부. RTDB 직접 read는 우회 가능 (백엔드 개입 없음). |
| `/posts/{postId}` 직접 구독 | `status=DELETED_BY_AUTHOR/REMOVED_BY_ADMIN`이어도 본문이 그대로 read됨. UI에서 status 보고 자체 마스킹 필요. |
| `/post_likes/{postId}` 전체 구독 | `auth != null` 가능. UI가 본인 표시만 필요하면 `/post_likes/{postId}/{myUid}` 단일 키 read 권장 (트래픽 절감). |

## 7. TODO 목록 (우선순위 순)

본 문서가 다루는 이번 사이클 이후 후속 작업으로 백엔드/프론트가 함께 의식해야 할 항목.

### 7.1 Custom token claim 도입 (백엔드)

`FirebaseCustomTokenIssuer.issue(userId)` 시 사용자 schoolId/departmentId를 custom claim으로 굽고, RTDB 룰을 다음과 같이 강화:

```text
"post_feeds/schools/$schoolId": {
  ".read": "auth != null && auth.token.schoolId == $schoolId"
}
"post_feeds/departments/$departmentId": {
  ".read": "auth != null && auth.token.departmentId == $departmentId"
}
```

이때 프론트가 이미 RTDB 직접 구독 코드를 갖고 있다면, 사용자 schoolId 변경 시 customToken을 갱신해야 한다 — 현재는 `POST /v1/auth/refresh`가 새 customToken을 발급하므로 refresh 시점에 자동 갱신.

### 7.2 Jury me cases 인덱스 + 룰 강화 (백엔드)

`/jury_cases_summoned/{userId}/{caseId}` 인덱스 노드 추가 + write 흐름 갱신 + 룰에 본인-소유 read 조건. 그 이후 `GET /v1/jury/me/cases`가 활성화. 프론트는 활성화 시점까지 빈 상태.

### 7.3 Notifications `isRead` 필터 (백엔드)

현재 `GET /v1/notifications`는 모든 알림을 createdAt DESC로 응답한다 (unread-only 옵션 없음). 운영에서 안 읽은 알림 수가 누적되면 별도 인덱스 노드(`/notifications_unread/{userId}`) 또는 indexed query + 후처리 옵션 도입을 검토. 프론트는 그 시점에 `unreadOnly=true` 등 query parameter 추가에 대응.

(이전 사이클: `size` → `cursor + limit` 통일은 본 사이클에 완료.)

### 7.4 Hot score / comment count 인덱스 활성화 (백엔드)

`/post_feeds/*` 노드의 `hotScore`/`commentCount` 필드를 작성/갱신하는 batch job 또는 trigger 도입 + `sort=hot|comments` 활성화. 프론트는 정렬 옵션 활성화.

### 7.5 Like-on-deleted-comment 정책 결정

현재 삭제된 댓글에도 좋아요 토글 가능. 운영 후 UX 피드백에 따라 (a) NOT_FOUND 처리 / (b) 신규 좋아요만 차단 / (c) 카운터 동결 중 결정. 프론트는 결정 후 분기 추가.

### 7.6 Course review report (`POST /v1/courses/{id}/reviews/{rid}/report`)

신고 인덱스 모델 활용 — 후속 사이클에서 백엔드 추가. 프론트는 강의평 카드에 "신고" 메뉴를 disabled 상태로 미리 노출 가능.

### 7.7 User settings (`PATCH /v1/users/me/settings`)

displayName/알림 설정 변경. 후속 사이클.

### 7.8 RTDB Security Rules 운영 배포

본 사이클의 `database.rules.json`은 **아직 배포되지 않은 상태**. 운영 첫 배포 시까지는 dev/staging/prod 모두 default rule이 적용되거나 이전 룰이 유지될 수 있다. 프론트 staging 통합 시점에 백엔드 운영자가 [`../database/04_SECURITY_RULES_DEPLOYMENT_CHECKLIST.md`](../database/04_SECURITY_RULES_DEPLOYMENT_CHECKLIST.md)를 따라 배포하지 않으면 RTDB 권한이 의도와 다르게 동작할 수 있다.

체크: 첫 staging 통합 전에 백엔드 측에 룰 배포 여부 확인.

## 8. 프론트 측 잠재 함정

| 함정 | 회피 |
|---|---|
| `pagination.total`로 페이지 수 계산 | 항상 null이라 NaN 발생. 사용 금지. |
| 응답 `result`를 항상 객체로 가정 | Reserved endpoint는 `result=null`. null 가드 필수. |
| `studentVerificationStatus`로 화면 분기 | 항상 RESERVED. 분기 만들지 말 것. |
| RTDB `/post_feeds/all` 전체 구독 | 비용 큼. `query(orderByChild('createdAt'), limitToLast(20))` 형태로 제한. |
| cursor를 다른 endpoint에 재사용 | 400 INVALID_REQUEST. cursor는 endpoint 단위로만 유효. |
| `expiresAt`을 클라이언트 시계로 갱신 | 시계 어긋남으로 잘못된 만료 판정. 백엔드 응답 그대로 신뢰. |
| 삭제된 글의 status를 RTDB로 무시 | `/posts/{postId}/status`가 PUBLISHED 외이면 UI에서 마스킹/숨김 처리 직접. |
| 실시간 카운터를 REST 응답으로만 | 다른 사용자의 좋아요가 즉시 반영되지 않음. RTDB `/post_stats/{postId}` 구독이 권장. |

## 9. 백엔드 한계가 아니라 정책상 막힌 것

다음은 "막혀 있다"가 아니라 "원칙상 그렇게 하지 않는다". 우회 시도 금지.

- 학생증 OCR을 학교 이메일 검증으로 대체 — 정책상 금지.
- AI 글다듬기를 룰/금칙어 필터로 대체 — 정책상 금지.
- AI Recap을 통계 집계로 대체 — 정책상 금지.
- 신고 즉시 자동 jury 생성 — 정책상 금지.
- 프론트 RTDB 직접 write — 모든 경로에서 차단.

자세한 정책은 [`04_RESERVED_FEATURE_CONTRACT.md`](04_RESERVED_FEATURE_CONTRACT.md).

## 10. 본 문서 갱신 시점

다음 시점에 본 문서를 갱신한다 — 그 외에는 freeze된 contract.

- 백엔드 사이클이 끝나고 신규 endpoint 활성화/Reserved 해제 시
- RTDB 룰이 운영에 배포되거나 강화될 때
- 알려진 제약 중 하나가 해소될 때
- 운영 트래픽에서 새 한계/회귀가 발견될 때

갱신 시 백엔드 `IMPLEMENTATION_REPORT.md`의 "남은 확인 필요 사항" 섹션과 동기화.
