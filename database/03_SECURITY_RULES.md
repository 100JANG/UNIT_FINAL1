# Firebase Realtime Database Security Rules

> UNIT Backend Architecture Harness  
> 기준 스택: Spring Boot + Firebase Auth + Firebase Admin SDK + Firebase Realtime Database  
> 제외: PWA, Gemma, Cloud CDN, Let's Encrypt, Compute Engine  
> 핵심 원칙: 모든 Write는 Spring Boot REST를 통과하고, 실시간 Read는 Firebase Realtime Database 읽기 구독으로 처리한다.


## 1. 원칙

프론트의 RTDB 권한은 읽기 구독 중심이다. 쓰기는 원칙적으로 Spring Boot Admin SDK가 수행한다.

## 2. 기본 전략

- 인증된 사용자만 읽을 수 있다.
- 본인 알림과 본인 활동만 읽을 수 있다.
- 학교/학과별 피드는 claim과 path가 일치해야 읽을 수 있다.
- 모든 일반 클라이언트 write는 false로 둔다.
- 특별히 허용하는 write가 필요할 경우 별도 ADR 작성 후 허용한다.

## 3. Rules 초안

```json
{
  "rules": {
    ".read": false,
    ".write": false,

    "post_feeds": {
      "all": {
        ".read": "auth != null",
        ".write": false
      },
      "schools": {
        "$schoolId": {
          ".read": "auth != null && auth.token.schoolId == $schoolId",
          ".write": false
        }
      },
      "departments": {
        "$departmentId": {
          ".read": "auth != null && auth.token.departmentId == $departmentId",
          ".write": false
        }
      }
    },

    "notifications": {
      "$userId": {
        ".read": "auth != null && auth.uid == $userId",
        ".write": false
      }
    }
  }
}
```

## 4. 금지

- 개발 편의를 위해 `".read": true`, `".write": true`를 넣지 않는다.
- 프론트 직접 write를 허용하지 않는다.
- 인증 claim 없이 schoolId를 클라이언트 path만으로 판단하지 않는다.

## 5. `.indexOn` 요건

서버측(Spring Boot Admin SDK)이 사용하는 `orderByChild` 쿼리는 `.indexOn`이 등재되지 않으면 RTDB가
client-side 정렬 fallback으로 처리해 비싸진다. 본 백엔드에서 사용 중인 인덱스는 다음과 같으며,
배포 전에 Security Rules에 함께 포함해야 한다.

```json
{
  "rules": {
    "post_feeds": {
      "all":         { ".indexOn": ["createdAt", "hotScore", "commentCount"] },
      "schools":     { "$schoolId":     { ".indexOn": ["createdAt", "hotScore", "commentCount"] } },
      "departments": { "$departmentId": { ".indexOn": ["createdAt", "hotScore", "commentCount"] } }
    },
    "comments": {
      "$postId": { ".indexOn": ["createdAt"] }
    },
    "courses_by_school": {
      "$schoolId": { ".indexOn": ["courseName", "professor", "semester"] }
    },
    "user_posts": {
      "$userId": { ".indexOn": ["createdAt"] }
    },
    "user_comments": {
      "$userId": { ".indexOn": ["createdAt"] }
    },
    "user_likes": {
      "$userId": { ".indexOn": ["likedAt"] }
    },
    "user_scraps": {
      "$userId": { ".indexOn": ["scrappedAt"] }
    },
    "notifications": {
      "$userId": { ".indexOn": ["createdAt", "isRead"] }
    }
  }
}
```

본 사이클에서는 룰 배포는 수행하지 않으며 (사용자 지시), 위 선언만 문서로 보존한다.
실제 운영 배포 시 §3의 read/write 룰과 §5의 `.indexOn`을 병합해 함께 배포한다.
