# RTDB Paths and Indexes

> UNIT Backend Architecture Harness  
> 기준 스택: Spring Boot + Firebase Auth + Firebase Admin SDK + Firebase Realtime Database  
> 제외: PWA, Gemma, Cloud CDN, Let's Encrypt, Compute Engine  
> 핵심 원칙: 모든 Write는 Spring Boot REST를 통과하고, 실시간 Read는 Firebase Realtime Database 읽기 구독으로 처리한다.  
> Reserved 기능은 구현/대체 구현하지 않고 문서상 자리만 남긴다.



## 1. 주요 경로

### Auth / Users

```text
/users/{userId}
/sessions/{userId}/{sessionId}
```

### Posts

```text
/posts/{postId}
/post_feeds/all/{postId}
/post_feeds/schools/{schoolId}/{postId}
/post_feeds/departments/{departmentId}/{postId}
/post_stats/{postId}
/post_likes/{postId}/{userId}
/post_scraps/{postId}/{userId}
/user_posts/{userId}/{postId}
```

### Comments

```text
/comments/{postId}/{commentId}
/comment_stats/{commentId}
/user_comments/{userId}/{commentId}
```

### Courses / Reviews

```text
/courses/{courseId}
/courses_by_school/{schoolId}/{courseId}
/course_reviews/{courseId}/{reviewId}
/course_stats/{courseId}
/review_locks/{userId}/{courseId}
```

### Reports

```text
/reports/{reportId}
/reports_by_post/{postId}/{reportId}
/user_reports/{userId}/{reportId}
```

Reports는 접수까지만 저장한다. AI 판정 결과 경로를 만들지 않는다.

### Jury

```text
/jury_cases/{caseId}
/jury_cases_by_department/{departmentId}/{caseId}
/jury_votes/{caseId}/{userId}
/jury_case_stats/{caseId}
```

Jury case는 MVP에서 수동 생성 또는 관리자 생성만 허용한다. 신고 직후 자동 생성하지 않는다.

### Notifications

```text
/notifications/{userId}/{notificationId}
/fcm_tokens/{userId}/{deviceId}
```

## 2. 생성하지 않는 경로

```text
/student_registry/...
/ai_refine/...
/ai_judgments/...
/moderation_results/...
/recaps/...
/recap_jobs/...
/ocr_results/...
```

## 3. Index Rules

```json
{
  "rules": {
    "post_feeds": {
      "all": { ".indexOn": ["createdAt", "hotScore", "commentCount"] },
      "schools": {
        "$schoolId": { ".indexOn": ["createdAt", "hotScore", "commentCount"] }
      },
      "departments": {
        "$departmentId": { ".indexOn": ["createdAt", "hotScore", "commentCount"] }
      }
    },
    "courses_by_school": {
      "$schoolId": { ".indexOn": ["courseName", "professor", "semester"] }
    },
    "notifications": {
      "$userId": { ".indexOn": ["createdAt", "isRead"] }
    }
  }
}
```

## 4. 금지

- 전체 노드 스캔 금지
- 클라이언트에서 대량 필터링 금지
- RTDB 경로를 화면마다 즉흥적으로 추가 금지
- Reserved 기능 경로 생성 금지
