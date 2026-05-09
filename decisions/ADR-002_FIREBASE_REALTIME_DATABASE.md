# ADR-002: Firebase Realtime Database

> UNIT Backend Architecture Harness  
> 기준 스택: Spring Boot + Firebase Auth + Firebase Admin SDK + Firebase Realtime Database  
> 제외: PWA, Gemma, Cloud CDN, Let's Encrypt, Compute Engine  
> 핵심 원칙: 모든 Write는 Spring Boot REST를 통과하고, 실시간 Read는 Firebase Realtime Database 읽기 구독으로 처리한다.


## Status

Accepted

## Context

핵심 UX는 피드 새 글, 댓글, 알림, 배심원 응답 수의 실시간 반영이다.

## Decision

Firestore가 아니라 Firebase Realtime Database를 선택한다.

## Alternatives

- Firestore
- Supabase Realtime
- PostgreSQL + WebSocket

## Consequences

- 실시간 구독 구조가 단순하다.
- JSON 트리 반정규화 설계가 필요하다.
- 복잡한 검색 쿼리는 Spring Boot 또는 별도 검색 도구로 보완해야 한다.

## Legacy Prevention Effect

처음부터 RTDB path와 반정규화 규칙을 문서화하여 임의 경로 난립을 방지한다.
