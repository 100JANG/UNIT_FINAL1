# Backend Architecture

> UNIT Backend Architecture Harness  
> 기준 스택: Spring Boot + Firebase Auth + Firebase Admin SDK + Firebase Realtime Database  
> 제외: PWA, Gemma, Cloud CDN, Let's Encrypt, Compute Engine  
> 핵심 원칙: 모든 Write는 Spring Boot REST를 통과하고, 실시간 Read는 Firebase Realtime Database 읽기 구독으로 처리한다.


## 1. 전체 구조

```text
React Frontend
  ├─ REST write/read initial ──> Spring Boot API
  └─ realtime read subscribe ──> Firebase Realtime Database

Spring Boot API
  ├─ Security Filter
  ├─ Controller Layer
  ├─ Application Service Layer
  ├─ Domain Policy Layer
  ├─ Firebase Repository/Gateway Layer
  └─ Event Publisher / Notification Service

Firebase
  ├─ Firebase Authentication
  ├─ Firebase Admin SDK
  ├─ Firebase Realtime Database
  └─ Firebase Cloud Messaging 선택
```

## 2. 핵심 데이터 흐름

### Write Flow

```text
Frontend
→ Spring Boot Controller
→ DTO validation
→ Auth context extraction
→ Application Service
→ Domain Policy validation
→ Firebase Repository/Gateway
→ RTDB write
→ Optional notification event
→ ApiResponse 반환
```

### Realtime Read Flow

```text
Frontend
→ Spring Boot REST initial load
→ TanStack Query cache
→ Firebase RTDB read subscription
→ cache patch
```

### 금지 흐름

```text
Frontend → RTDB write
Controller → RTDB 직접 접근
Service → Firebase Admin SDK 직접 호출
Repository → 비즈니스 판단
```

## 3. 모듈 구성

```text
auth
users
schools
boards
posts
comments
courses
reviews
reports
jury
notifications
recap
common
firebase
```

## 4. 레이어 책임

| Layer | 책임 | 금지 |
|---|---|---|
| Controller | HTTP 요청/응답, DTO 받기 | 비즈니스 판단, RTDB 접근 |
| Application Service | 유스케이스 실행 | HTTP 객체 의존 |
| Domain Policy | 도메인 규칙 검증 | 외부 API 호출 |
| Repository/Gateway | RTDB CRUD | 권한/정책 판단 |
| Event Publisher | 알림/카운터 갱신 이벤트 | 핵심 트랜잭션 직접 변경 |

## 5. 트랜잭션 전략

1. 카운터 증가/감소는 RTDB transaction API를 사용한다.
2. 멱등성이 필요한 작업은 `/idempotency_keys/{userId}/{actionKey}`를 확인한다.
3. 다중 경로 업데이트는 `updateChildren` 방식의 multi-location update를 사용한다.
4. 실패 시 재시도 가능한 작업과 불가능한 작업을 분리한다.

## 6. 레거시 방지 규칙

- `FirebaseDatabase` 객체를 Service에서 직접 주입받지 않는다.
- 모든 RTDB 접근은 `*FirebaseRepository` 또는 `*Gateway`로 감싼다.
- DTO와 Domain Model을 분리한다.
- `Map<String,Object>`를 서비스 로직에 직접 넘기지 않는다.
