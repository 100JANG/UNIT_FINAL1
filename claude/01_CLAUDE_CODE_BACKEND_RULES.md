# Claude Code Backend Rules

> UNIT Backend Architecture Harness  
> 기준 스택: Spring Boot + Firebase Auth + Firebase Admin SDK + Firebase Realtime Database  
> 제외: PWA, Gemma, Cloud CDN, Let's Encrypt, Compute Engine  
> 핵심 원칙: 모든 Write는 Spring Boot REST를 통과하고, 실시간 Read는 Firebase Realtime Database 읽기 구독으로 처리한다.  
> 제외된 기능은 대체 구현하지 않고 Reserved Placeholder로 비워둔다.


## 1. Global Rules

이 프로젝트는 Spring Boot + Firebase Realtime Database 기준으로 개발한다.

## 2. 반드시 지킬 것

1. 모든 write 요청은 Spring Boot REST API로만 처리한다.
2. Firebase Realtime Database 직접 write를 프론트에 허용하지 않는다.
3. Firebase 접근은 Repository/Adapter 계층으로만 한다.
4. Controller에는 요청/응답 처리만 둔다.
5. Service에는 비즈니스 흐름만 둔다.
6. DTO에는 입력 검증만 둔다.
7. Reserved 기능을 구현하지 않는다.

## 3. Reserved 기능

다음은 만들지 않는다.

```text
학생증 OCR
student registry 대체 검증
AI 글쓰기 다듬기
RuleModerationService
AI 신고 판정
신고 후 자동 jury case 생성
AI Recap
Reserved Placeholder
Gemma
Compute Engine
PWA
Cloud CDN
Let's Encrypt
```

Reserved endpoint가 필요하면 `FEATURE_NOT_IMPLEMENTED` 계약만 작성한다.

## 4. 금지 파일명

- Util.java
- Helper.java
- Manager.java
- CommonService.java
- TempService.java
- FinalService.java
- NewService.java

## 5. 작업 순서

1. 관련 문서 읽기
2. 기능이 구현 대상인지 Reserved인지 확인
3. 수정/생성 파일 목록 제안
4. 테스트 케이스 제안
5. 구현
6. 테스트 실행
7. 변경 요약
