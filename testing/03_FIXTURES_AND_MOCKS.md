# Fixtures and Mocks

> UNIT Backend Architecture Harness  
> 기준 스택: Spring Boot + Firebase Auth + Firebase Admin SDK + Firebase Realtime Database  
> 제외: PWA, Gemma, Cloud CDN, Let's Encrypt, Compute Engine  
> 핵심 원칙: 모든 Write는 Spring Boot REST를 통과하고, 실시간 Read는 Firebase Realtime Database 읽기 구독으로 처리한다.


## 1. Mock / Stub 구분

- Mock: 호출 여부를 검증
- Stub: 고정 응답 제공
- Fixture: 고정 테스트 데이터

## 2. Firebase Stub Interface

```java
public interface RealtimeDatabaseClient {
    <T> Optional<T> get(String path, Class<T> type);
    void set(String path, Object value);
    void update(Map<String, Object> updates);
    void delete(String path);
    long increment(String path, long delta);
}
```

테스트에서는 `FakeRealtimeDatabaseClient` 구현체 사용.

## 3. Auth Fixture

```text
u_ajou_001
- schoolId: ajou
- departmentId: ajou_csi
- role: STUDENT
```
