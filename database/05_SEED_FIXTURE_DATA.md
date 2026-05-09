# Seed and Fixture Data

> UNIT Backend Architecture Harness  
> 기준 스택: Spring Boot + Firebase Auth + Firebase Admin SDK + Firebase Realtime Database  
> 제외: PWA, Gemma, Cloud CDN, Let's Encrypt, Compute Engine  
> 핵심 원칙: 모든 Write는 Spring Boot REST를 통과하고, 실시간 Read는 Firebase Realtime Database 읽기 구독으로 처리한다.  
> Reserved 기능은 구현/대체 구현하지 않고 문서상 자리만 남긴다.



## 1. 목적

로컬 테스트와 데모 실행에 필요한 최소 seed 데이터를 정의한다.

## 2. 허용 seed

```json
{
  "schools": {
    "ajou": { "schoolId": "ajou", "name": "아주대학교" },
    "inha": { "schoolId": "inha", "name": "인하대학교" }
  },
  "departments": {
    "ajou_csi": { "departmentId": "ajou_csi", "schoolId": "ajou", "name": "융합시스템공학과" }
  },
  "boards": {
    "free": { "boardId": "free", "name": "자유게시판" },
    "info": { "boardId": "info", "name": "정보게시판" },
    "job": { "boardId": "job", "name": "취업게시판" }
  },
  "courses": {
    "ajou_data_2026_1": {
      "courseId": "ajou_data_2026_1",
      "schoolId": "ajou",
      "courseName": "데이터분석개론",
      "professor": "김교수",
      "credits": 3,
      "semester": "2026-1"
    }
  }
}
```

## 3. 만들지 않는 seed

```text
student_registry
ai_refine
ai_judgments
recaps
ocr_results
moderation_results
```

## 4. 테스트 Fixture 원칙

- 테스트 user는 Firebase ID Token 검증 Stub으로 만든다.
- 학생 인증 완료 사용자는 만들지 않는다.
- Reserved 기능 성공 fixture를 만들지 않는다.
