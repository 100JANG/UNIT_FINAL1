# Firebase Admin Integration

> UNIT Backend Architecture Harness  
> 기준 스택: Spring Boot + Firebase Auth + Firebase Admin SDK + Firebase Realtime Database  
> 제외: PWA, Gemma, Cloud CDN, Let's Encrypt, Compute Engine  
> 핵심 원칙: 모든 Write는 Spring Boot REST를 통과하고, 실시간 Read는 Firebase Realtime Database 읽기 구독으로 처리한다.


## 1. 환경 변수

```text
FIREBASE_PROJECT_ID=
FIREBASE_DATABASE_URL=
FIREBASE_CREDENTIALS_PATH=
JWT_SECRET=
JWT_ISSUER=unit-api
UNIT_CURRENT_SEMESTER=2026-1
UNIT_SEMESTER_EXPIRES_AT=2026-08-31T23:59:59Z
```

## 2. FirebaseConfig

```java
@Configuration
public class FirebaseConfig {
    @Bean
    FirebaseApp firebaseApp(...) { ... }

    @Bean
    FirebaseAuth firebaseAuth(FirebaseApp app) { ... }

    @Bean
    FirebaseDatabase firebaseDatabase(FirebaseApp app) { ... }
}
```

## 3. RealtimeDatabaseClient

Firebase Admin SDK 세부 API를 직접 노출하지 않고 얇은 래퍼를 둔다.

책임:

- `get(path, type)`
- `set(path, value)`
- `update(Map<String,Object> updates)`
- `delete(path)`
- `runTransaction(path, handler)`

## 4. FirebasePath

RTDB 경로 문자열은 한 곳에서만 생성한다.

```java
public final class FirebasePath {
    public static String post(String postId) { return "/posts/" + postId; }
    public static String schoolFeed(String schoolId, String postId) { ... }
    public static String juryCase(String caseId) { ... }
}
```

## 5. 금지

- 문자열 경로를 Service 내부에 직접 쓰지 않는다.
- `/posts/` + id 같은 조합을 여기저기 만들지 않는다.
- Firebase Admin SDK 객체를 Controller나 Domain에 노출하지 않는다.
