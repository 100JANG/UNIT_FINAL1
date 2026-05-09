# Regression Checklist

> UNIT Backend Architecture Harness  
> 기준 스택: Spring Boot + Firebase Auth + Firebase Admin SDK + Firebase Realtime Database  
> 제외: PWA, Gemma, Cloud CDN, Let's Encrypt, Compute Engine  
> 핵심 원칙: 모든 Write는 Spring Boot REST를 통과하고, 실시간 Read는 Firebase Realtime Database 읽기 구독으로 처리한다.


## Auth

- [ ] Firebase ID Token 검증 실패 시 AUTH_INVALID
- [ ] 학교 이메일 도메인 불일치 시 SCHOOL_EMAIL_REQUIRED
- [ ] 세션 만료 시 AUTH_EXPIRED
- [ ] 정지 사용자 접근 차단

## Posts

- [ ] 피드 scope all/school/department 정상
- [ ] 글 생성 후 post_feeds 3개 경로 반영
- [ ] 댓글 수 카운터 정상
- [ ] 좋아요 토글 중복 방지

## Reports / Jury

- [ ] 중복 신고 차단
- [ ] 신고 시 jury case 생성
- [ ] 같은 학과 배심원만 투표 가능
- [ ] 이미 투표한 사용자 차단
- [ ] 마감 이후 투표 차단

## Courses

- [ ] 미작성자 상세 열람 제한
- [ ] 리뷰 작성 후 열람 가능
- [ ] 참여율 계산 정상
