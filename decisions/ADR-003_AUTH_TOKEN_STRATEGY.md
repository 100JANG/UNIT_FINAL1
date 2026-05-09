# ADR-003: Session Token and Firebase Custom Token Strategy

> UNIT Backend Architecture Harness  
> 기준 스택: Spring Boot + Firebase Auth + Firebase Admin SDK + Firebase Realtime Database  
> 제외: PWA, Gemma, Cloud CDN, Let's Encrypt, Compute Engine  
> 핵심 원칙: 모든 Write는 Spring Boot REST를 통과하고, 실시간 Read는 Firebase Realtime Database 읽기 구독으로 처리한다.


## Status

Accepted

## Context

Spring Boot REST 인증과 Firebase RTDB 구독 인증이 모두 필요하다.

## Decision

- REST: 자체 sessionToken 사용
- RTDB: Firebase Custom Token으로 로그인 후 read 구독

## Alternatives

- Firebase ID Token만 사용
- 자체 JWT만 사용
- RTDB 구독 없이 REST polling만 사용

## Consequences

- 권한 통제가 명확하다.
- 프론트는 두 토큰을 관리해야 한다.
- 세션 만료/정지 시 두 경로 모두 차단해야 한다.

## Legacy Prevention Effect

REST 권한과 RTDB 권한이 뒤섞이지 않는다.
