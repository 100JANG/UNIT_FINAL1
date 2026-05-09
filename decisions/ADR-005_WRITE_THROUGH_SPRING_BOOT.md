# ADR-005: Write Through Spring Boot

> UNIT Backend Architecture Harness  
> 기준 스택: Spring Boot + Firebase Auth + Firebase Admin SDK + Firebase Realtime Database  
> 제외: PWA, Gemma, Cloud CDN, Let's Encrypt, Compute Engine  
> 핵심 원칙: 모든 Write는 Spring Boot REST를 통과하고, 실시간 Read는 Firebase Realtime Database 읽기 구독으로 처리한다.


## Status

Accepted

## Context

프론트가 RTDB에 직접 write하면 권한, 검증, 신고, 배심원 정책이 분산된다.

## Decision

모든 write 트랜잭션은 Spring Boot REST API를 통과한다. 프론트 RTDB 접근은 read subscription으로 제한한다.

## Alternatives

- 프론트 RTDB 직접 write
- Cloud Functions trigger 기반 검증
- REST polling only

## Consequences

- 정책 일관성이 높다.
- 서버 비용은 증가할 수 있다.
- 프론트 구현은 명확해진다.

## Legacy Prevention Effect

검증 로직이 프론트, Rules, Functions, API에 흩어지는 문제를 막는다.
