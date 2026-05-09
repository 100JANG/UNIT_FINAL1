# Security and Auth Architecture

> UNIT Backend Architecture Harness  
> 기준 스택: Spring Boot + Firebase Auth + Firebase Admin SDK + Firebase Realtime Database  
> 제외: PWA, Gemma, Cloud CDN, Let's Encrypt, Compute Engine  
> 핵심 원칙: 모든 Write는 Spring Boot REST를 통과하고, 실시간 Read는 Firebase Realtime Database 읽기 구독으로 처리한다.  
> Reserved 기능은 구현/대체 구현하지 않고 문서상 자리만 남긴다.



## 1. 책임

- Firebase ID Token 검증
- 백엔드 sessionToken 발급/검증
- Firebase Custom Token 발급
- Spring Security 인증 필터 구성
- 정지/탈퇴 사용자 차단

## 2. 구현 범위

```text
POST /v1/auth/session
POST /v1/auth/refresh
POST /v1/auth/logout
```

`/v1/auth/session`은 Firebase 로그인 사용자를 백엔드 세션으로 연결하는 기능이다. 학생증 OCR 인증이나 학적 검증을 대신하지 않는다.

## 3. 세션 발급 흐름

1. 클라이언트가 Firebase Auth로 로그인한다.
2. 클라이언트가 Firebase ID Token을 `/v1/auth/session`에 전달한다.
3. 백엔드는 Firebase Admin SDK로 ID Token을 검증한다.
4. User가 없으면 최소 프로필만 생성한다.
5. `studentVerificationStatus=RESERVED`로 둔다.
6. 자체 `sessionToken`을 발급한다.
7. RTDB read subscription용 `firebaseCustomToken`을 발급한다.

## 4. 금지

- 학교 이메일 도메인 검증을 학생 인증 완료로 간주하지 않는다.
- student registry를 만들지 않는다.
- 학번/학과 입력값을 학생 인증 근거로 쓰지 않는다.
- 학생증 OCR endpoint를 임시 구현하지 않는다.

## 5. Error

| 상황 | HTTP | code |
|---|---:|---|
| Firebase ID Token 누락 | 401 | AUTH_REQUIRED |
| Firebase ID Token 검증 실패 | 401 | AUTH_INVALID |
| sessionToken 만료 | 401 | AUTH_EXPIRED |
| 정지 사용자 | 403 | USER_SUSPENDED |
| Reserved 학생 인증 요구 | 501 | FEATURE_NOT_IMPLEMENTED |

## 6. 레거시 방지 관점

로그인 세션과 학생 인증을 분리하면, 나중에 진짜 OCR/학생 인증을 도입할 때 인증 흐름 전체를 갈아엎지 않아도 된다.
