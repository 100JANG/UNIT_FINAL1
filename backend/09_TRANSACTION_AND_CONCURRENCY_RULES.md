# Transaction and Concurrency Rules

> UNIT Backend Architecture Harness  
> 기준 스택: Spring Boot + Firebase Auth + Firebase Admin SDK + Firebase Realtime Database  
> 제외: PWA, Gemma, Cloud CDN, Let's Encrypt, Compute Engine  
> 핵심 원칙: 모든 Write는 Spring Boot REST를 통과하고, 실시간 Read는 Firebase Realtime Database 읽기 구독으로 처리한다.


## 1. Firebase RTDB 동시성 원칙

Realtime Database는 실시간 JSON 트리이므로 카운터, 중복 방지, 다중 경로 업데이트를 명확히 설계해야 한다.

## 2. 좋아요 토글

경로:

```text
/post_likes/{postId}/{userId}: true
/post_stats/{postId}/likes: number
/users_activity/{userId}/liked_posts/{postId}: timestamp
```

처리:

1. 이미 좋아요가 있는지 확인
2. 없으면 multi-location update로 like 노드 추가
3. stats.likes는 transaction으로 +1
4. 있으면 like 노드 삭제 및 transaction -1

## 3. 댓글 작성

Multi-location update:

```text
/comments/{postId}/{commentId}
/post_stats/{postId}/comments
/user_comments/{userId}/{commentId}
```

댓글 카운터는 transaction으로 증가시킨다.

## 4. 배심원 투표

중복 방지:

```text
/jury_votes/{caseId}/{userId}
```

처리:

1. `jury_cases/{caseId}` 상태가 `OPEN`인지 확인
2. `summonedJurors/{userId}` 포함 여부 확인
3. `/jury_votes/{caseId}/{userId}` 존재 여부 확인
4. 투표 저장
5. `jury_case_stats/{caseId}` transaction 증가
6. 조건 충족 시 `jury_cases/{caseId}/status`를 `RESOLVED`로 변경

## 5. 금지

- 카운터를 읽고 단순 set으로 업데이트하지 않는다.
- 다중 경로 업데이트가 필요한 작업을 여러 번의 독립 write로 나누지 않는다.
- 실패 시 절반만 반영되는 구조를 만들지 않는다.
