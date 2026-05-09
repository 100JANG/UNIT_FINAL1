# Request / Response Contracts

> UNIT Backend Architecture Harness  
> 기준 스택: Spring Boot + Firebase Auth + Firebase Admin SDK + Firebase Realtime Database  
> 제외: PWA, Gemma, Cloud CDN, Let's Encrypt, Compute Engine  
> 핵심 원칙: 모든 Write는 Spring Boot REST를 통과하고, 실시간 Read는 Firebase Realtime Database 읽기 구독으로 처리한다.  
> Reserved 기능은 구현/대체 구현하지 않고 문서상 자리만 남긴다.



## 1. 공통 응답

```json
{
  "code": "SUCCESS",
  "message": "Success",
  "result": {}
}
```

## 2. 페이지네이션 응답

```json
{
  "code": "SUCCESS",
  "message": "Success",
  "result": {
    "items": [],
    "pagination": {
      "cursor": "eyJpZCI6MTIzfQ==",
      "hasMore": true,
      "total": 1247
    }
  }
}
```

## 3. Auth Session

### POST `/v1/auth/session`

Request:

```json
{
  "firebaseIdToken": "firebase-id-token"
}
```

Response:

```json
{
  "code": "SUCCESS",
  "message": "Success",
  "result": {
    "userId": "u_123",
    "sessionToken": "jwt",
    "firebaseCustomToken": "firebase-custom-token",
    "expiresAt": "2026-08-31T23:59:59Z",
    "studentVerificationStatus": "RESERVED"
  }
}
```

## 4. Reserved Endpoint Response

Reserved endpoint는 필요 시 아래 계약만 가진다.

```json
{
  "code": "FEATURE_NOT_IMPLEMENTED",
  "message": "아직 구현되지 않은 기능입니다",
  "result": {
    "feature": "STUDENT_CARD_OCR",
    "status": "RESERVED"
  }
}
```

## 5. Post Create

Request:

```json
{
  "boardId": "free",
  "title": "기숙사 식단의 질이 아쉽습니다",
  "content": "이번 학기 식단 개편 후 만족도가 떨어진 것 같습니다.",
  "tags": ["기숙사", "학식"],
  "isAnonymous": true
}
```

Response:

```json
{
  "code": "SUCCESS",
  "message": "게시글이 작성되었습니다",
  "result": {
    "postId": "p_x9y8z7",
    "boardId": "free",
    "createdAt": "2026-05-09T08:15:00Z",
    "url": "/post/p_x9y8z7"
  }
}
```

## 6. Report Create

Request:

```json
{
  "reason": "TOXIC",
  "detail": "부가 설명"
}
```

Response:

```json
{
  "code": "SUCCESS",
  "message": "신고가 접수되었습니다",
  "result": {
    "reportId": "r_8a7b6c",
    "status": "RECEIVED"
  }
}
```

신고 접수 응답은 AI 판정 상태를 포함하지 않는다.
