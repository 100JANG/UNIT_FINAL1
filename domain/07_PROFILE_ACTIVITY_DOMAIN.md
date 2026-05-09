# Profile and Activity Domain

> UNIT Backend Architecture Harness  
> 기준 스택: Spring Boot + Firebase Auth + Firebase Admin SDK + Firebase Realtime Database  
> 제외: PWA, Gemma, Cloud CDN, Let's Encrypt, Compute Engine  
> 핵심 원칙: 모든 Write는 Spring Boot REST를 통과하고, 실시간 Read는 Firebase Realtime Database 읽기 구독으로 처리한다.


## 1. 책임

- 내 프로필 조회
- 활동 통계 조회
- 내가 쓴 글/댓글/추천 조회
- 설정 변경
- 재인증 유도
- 로그아웃/탈퇴

## 2. Activity Paths

```text
/user_posts/{userId}
/user_comments/{userId}
/user_likes/{userId}
/user_scraps/{userId}
/user_jury_votes/{userId}
```

## 3. 금지

- 프로필 응답에 sessionToken 등 민감값 포함 금지
- 타인 학번 노출 금지
- 탈퇴 시 물리 삭제를 기본값으로 하지 않는다.
