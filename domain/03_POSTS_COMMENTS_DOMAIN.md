# Posts and Comments Domain

> UNIT Backend Architecture Harness  
> 기준 스택: Spring Boot + Firebase Auth + Firebase Admin SDK + Firebase Realtime Database  
> 제외: PWA, Gemma, Cloud CDN, Let's Encrypt, Compute Engine  
> 핵심 원칙: 모든 Write는 Spring Boot REST를 통과하고, 실시간 Read는 Firebase Realtime Database 읽기 구독으로 처리한다.  
> 제외된 기능은 대체 구현하지 않고 Reserved Placeholder로 비워둔다.


## 1. 게시글 규칙

- 제목 2~80자
- 본문 10~5000자
- 태그 최대 5개
- 익명 기본 true
- 작성자는 sessionToken의 userId 기준으로 저장
- 피드 요약은 상세 원본과 분리 저장

## 2. AI 다듬기/분탕 감지 상태

AI 글쓰기 다듬기와 AI 분탕 감지는 현재 Reserved 기능이다.

금지:
- AI/룰 기반 대체 moderation service를 만들지 않는다.
- 금칙어 seed list로 AI 기능을 대체하지 않는다.
- 반복 문자/URL 과다 감지 같은 임시 moderation 정책을 만들지 않는다.
- `aiRefineToken`을 요구하지 않는다.
- `TOXIC_CONTENT_DETECTED`, `POST_BLOCKED_FROM_FREE_BOARD`를 발생시키지 않는다.

## 3. 기본 검증

AI/Moderation이 아니라 데이터 무결성 검증만 수행한다.

- 제목 길이
- 본문 길이
- tags 배열 길이
- boardId 존재 여부
- 로그인 여부

## 4. 댓글 규칙

- 본문 1~1000자
- 대댓글은 1 depth만 허용
- 삭제된 글에는 댓글 작성 금지

## 5. 레거시 방지 관점

임시 moderation은 나중에 실제 AI/운영정책과 충돌한다. 현재는 순수 게시글 CRUD와 무결성 검증만 유지한다.
