# Notifications Domain

> UNIT Backend Architecture Harness  
> 기준 스택: Spring Boot + Firebase Auth + Firebase Admin SDK + Firebase Realtime Database  
> 제외: PWA, Gemma, Cloud CDN, Let's Encrypt, Compute Engine  
> 핵심 원칙: 모든 Write는 Spring Boot REST를 통과하고, 실시간 Read는 Firebase Realtime Database 읽기 구독으로 처리한다.


## 1. 책임

- 알림 생성
- 알림 목록 조회
- 읽음 처리
- 삭제 처리
- FCM 토큰 등록
- 배심원 호출 푸시 발송

## 2. Notification Type

```text
JURY_SUMMON
POST_COMMENT
POST_LIKE
RECAP_READY
REPORT_RESULT
SYSTEM
```

## 3. FCM

FCM은 선택 유지한다. 구현 시 알림 저장이 먼저이고, FCM 발송은 실패해도 핵심 트랜잭션이 롤백되지 않는다.

## 4. 금지

- 푸시 광고 금지
- 알림 실패로 게시글/신고/투표 트랜잭션 전체 실패 금지
- 본인 외 알림 조회 금지
