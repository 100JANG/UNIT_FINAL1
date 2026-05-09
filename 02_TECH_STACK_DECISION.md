# Tech Stack Decision

> UNIT Backend Architecture Harness  
> 기준 스택: Spring Boot + Firebase Auth + Firebase Admin SDK + Firebase Realtime Database  
> 제외: PWA, Gemma, Cloud CDN, Let's Encrypt, Compute Engine  
> 핵심 원칙: 모든 Write는 Spring Boot REST를 통과하고, 실시간 Read는 Firebase Realtime Database 읽기 구독으로 처리한다.


## 1. 선택 스택

```text
Runtime: Java 21
Framework: Spring Boot 3.x
Build: Gradle 권장
Auth: Firebase Authentication + Spring Security
Session: 자체 JWT sessionToken
Realtime DB: Firebase Realtime Database
Firebase Access: Firebase Admin SDK
Test: JUnit 5, AssertJ, Mockito, SpringBootTest
API Docs: Springdoc OpenAPI
Validation: Jakarta Bean Validation
```

## 2. DB 선택: Firebase Realtime Database

Firestore가 아니라 Realtime Database를 선택한다.

### 선택 이유

1. 배심원 투표 응답률 실시간 반영이 핵심이다.
2. 알림과 댓글 카운트가 실시간으로 변해야 한다.
3. 피드 새 글 도착을 프론트가 구독해야 한다.
4. 기존 프론트 UX 문서가 RTDB 직접 구독 구조를 전제한다.
5. MVP에서는 복합 쿼리보다 실시간 동기화가 더 중요하다.

## 3. Firestore를 선택하지 않는 이유

Firestore는 복합 쿼리, 컬렉션 그룹, 문서 기반 권한에는 강하지만 이번 MVP는 실시간 카운트와 단순 경로 기반 구독이 핵심이다. 검색 고도화가 필요해질 때 Firestore 또는 별도 검색 엔진을 추가 검토한다.

## 4. 금지 스택

- Spring WebFlux: 실시간 구독은 RTDB가 담당하므로 초기 MVP에서는 불필요하다.
- RDBMS: 현재 요구사항에는 별도 SQL DB를 넣지 않는다.
- Redis: 초기 MVP에서는 불필요하다.
- Kafka/RabbitMQ: 초기 MVP에서는 불필요하다.
- Cloud Functions: 백엔드 정책은 Spring Boot에서 일관되게 처리한다.
