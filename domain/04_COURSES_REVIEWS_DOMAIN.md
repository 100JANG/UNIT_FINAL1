# Courses and Reviews Domain

> UNIT Backend Architecture Harness  
> 기준 스택: Spring Boot + Firebase Auth + Firebase Admin SDK + Firebase Realtime Database  
> 제외: PWA, Gemma, Cloud CDN, Let's Encrypt, Compute Engine  
> 핵심 원칙: 모든 Write는 Spring Boot REST를 통과하고, 실시간 Read는 Firebase Realtime Database 읽기 구독으로 처리한다.


## 1. 책임

- 강의 검색
- 강의 상세 조회
- 강의평 작성
- 참여율 계산
- 추천/비추/Skip 집계
- 미작성자 열람 제한

## 2. 강의평 3초 의무

사용자가 특정 강의를 열람하려고 할 때, 해당 강의평을 아직 작성하지 않았다면 `REVIEW_QUOTA_REQUIRED`를 반환한다. 프론트는 `/courses/:courseId/review`로 이동한다.

## 3. Review Vote

```text
RECOMMEND
NOT_RECOMMEND
SKIP
```

Skip도 참여율 계산에는 포함한다. 추천률 계산에는 포함하지 않는다.
