# ADR-001: Spring Boot Backend Stack

> UNIT Backend Architecture Harness  
> 기준 스택: Spring Boot + Firebase Auth + Firebase Admin SDK + Firebase Realtime Database  
> 제외: PWA, Gemma, Cloud CDN, Let's Encrypt, Compute Engine  
> 핵심 원칙: 모든 Write는 Spring Boot REST를 통과하고, 실시간 Read는 Firebase Realtime Database 읽기 구독으로 처리한다.


## Status

Accepted

## Context

UNIT 백엔드는 React 프론트의 모든 write 트랜잭션을 검증하고 Firebase Realtime Database에 반영해야 한다.

## Decision

Spring Boot 3.x + Java 21 + Firebase Admin SDK + Firebase Realtime Database를 사용한다.

## Alternatives

- Node.js Express
- NestJS
- Firebase Cloud Functions

## Consequences

- 초기 구조가 명확하다.
- Controller/Service/Repository 분리에 유리하다.
- Firebase Admin SDK를 서버에서 안정적으로 사용할 수 있다.
- Cloud Functions보다 도메인 구조를 관리하기 쉽다.

## Legacy Prevention Effect

백엔드 정책이 Spring Boot 한 곳에 모여 프론트 직접 write와 분산 규칙을 방지한다.
