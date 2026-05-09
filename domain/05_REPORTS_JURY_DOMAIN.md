# Reports and Jury Domain

> UNIT Backend Architecture Harness  
> 기준 스택: Spring Boot + Firebase Auth + Firebase Admin SDK + Firebase Realtime Database  
> 제외: PWA, Gemma, Cloud CDN, Let's Encrypt, Compute Engine  
> 핵심 원칙: 모든 Write는 Spring Boot REST를 통과하고, 실시간 Read는 Firebase Realtime Database 읽기 구독으로 처리한다.  
> 제외된 기능은 대체 구현하지 않고 Reserved Placeholder로 비워둔다.


## 1. 책임

Reports:
- 신고 접수
- 중복 신고 방지
- 신고 사유/상세 저장
- 신고 상태 조회

Jury:
- 배심원 기능은 화면과 도메인 요구사항이 존재하지만, 자동 생성 흐름은 현재 Reserved로 둔다.

## 2. 신고 흐름

```text
POST /posts/{postId}/report
→ duplicate check
→ report 저장
→ status=RECEIVED
→ response 반환
```

여기서 끝낸다.

## 3. 금지된 대체 흐름

```text
신고 접수
→ AI 판정 대체 로직
→ jury case 자동 생성
→ 같은 학과 후보 30명 선정
→ notifications + FCM 발송
```

위 흐름은 이번 범위에서 만들지 않는다.

## 4. Report 상태

```text
RECEIVED
RESERVED_FOR_REVIEW
CANCELLED
```

`AI_PROCESSING`, `JURY_REQUESTED`, `RESOLVED_AUTO`, `RESOLVED_JURY`는 기존 문서에는 있지만 이번 범위에서는 사용하지 않는다.

## 5. JuryCase 상태

JuryCase는 후속 구현을 위해 타입만 예약할 수 있다.

```text
RESERVED
OPEN
RESOLVED
NEEDS_ADMIN_REVIEW
CLOSED_EXPIRED
CANCELLED
```

단, 자동 생성하지 않는다.

## 6. 레거시 방지 관점

AI 판정 제거 후 곧바로 배심원 케이스를 자동 생성하면, 나중에 AI triage를 다시 붙일 때 신고/배심원 경계가 무너진다. 지금은 신고 저장까지만 구현한다.
