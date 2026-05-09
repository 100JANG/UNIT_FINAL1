# API Conventions

> UNIT Backend Architecture Harness  
> 기준 스택: Spring Boot + Firebase Auth + Firebase Admin SDK + Firebase Realtime Database  
> 제외: PWA, Gemma, Cloud CDN, Let's Encrypt, Compute Engine  
> 핵심 원칙: 모든 Write는 Spring Boot REST를 통과하고, 실시간 Read는 Firebase Realtime Database 읽기 구독으로 처리한다.


## 1. Base Path

```text
/v1
```

도메인은 환경별로 다르므로 문서에서는 경로만 고정한다.

## 2. 인증 헤더

일반 API:

```http
Authorization: Bearer {sessionToken}
Content-Type: application/json
```

인증 검증 API:

```http
Authorization: Bearer {firebaseIdToken}
Content-Type: application/json
```

## 3. 응답 구조

```json
{
  "code": "SUCCESS",
  "message": "Success",
  "result": {}
}
```

## 4. 목록 응답

```json
{
  "code": "SUCCESS",
  "message": "Success",
  "result": {
    "items": [],
    "pagination": {
      "cursor": "base64url",
      "hasMore": true,
      "total": 1247
    }
  }
}
```

`total`은 비용이 큰 경우 생략 가능하다.

## 5. HTTP Method

| Method | 용도 |
|---|---|
| GET | 조회 |
| POST | 생성 또는 명령 |
| PATCH | 일부 수정 |
| DELETE | 삭제 또는 숨김 처리 |

## 6. 날짜 형식

모든 날짜는 ISO-8601 UTC 문자열을 사용한다.
