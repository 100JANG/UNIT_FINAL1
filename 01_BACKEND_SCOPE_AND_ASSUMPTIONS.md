# Backend Scope and Assumptions

> UNIT Backend Architecture Harness  
> 기준 스택: Spring Boot + Firebase Auth + Firebase Admin SDK + Firebase Realtime Database  
> 제외: PWA, Gemma, Cloud CDN, Let's Encrypt, Compute Engine  
> 핵심 원칙: 모든 Write는 Spring Boot REST를 통과하고, 실시간 Read는 Firebase Realtime Database 읽기 구독으로 처리한다.  
> Reserved 기능은 구현/대체 구현하지 않고 문서상 자리만 남긴다.



## 1. 확정 스택

| 영역 | 결정 |
|---|---|
| Backend | Spring Boot |
| Auth | Firebase Auth + Spring Security |
| Database | Firebase Realtime Database |
| Firebase Server SDK | Firebase Admin SDK |
| API | REST API v1 |
| Realtime Read | Firebase Realtime Database client subscription |
| Write Path | React → Spring Boot REST → Firebase RTDB |

## 2. 범위 제외

- PWA / Service Worker / Offline-first
- Gemma / AI 모델 / 온디바이스 모델
- Compute Engine / GPU inference
- Cloud CDN
- Let's Encrypt
- 학생증 OCR 구현
- AI 글쓰기 다듬기 구현
- AI 신고 판정 구현
- AI Recap 구현

## 3. 대체 구현 금지

제외 기능은 다른 방식으로 메우지 않는다.

| 제외 기능 | 금지되는 대체 |
|---|---|
| 학생증 OCR | 학교 이메일 검증, registry 검증, 수동 학적부 검증으로 대체 금지 |
| AI 글쓰기 다듬기 | 금칙어 필터, RuleModeration, 문장 교정 서비스로 대체 금지 |
| AI 신고 판정 | 신고 즉시 자동 jury 생성, 자동 제재, 룰 기반 처분으로 대체 금지 |
| AI Recap | 통계 기반 recap, hot topic 집계, 개인 활동 집계로 대체 금지 |

## 4. 인증 범위

이번 백엔드는 Firebase ID Token을 검증하고 자체 `sessionToken`을 발급한다. 이것은 사용자 로그인 세션이며, 학생증 OCR 인증의 대체가 아니다.

사용자 상태는 아래처럼 분리한다.

```text
AUTHENTICATED       Firebase 로그인과 백엔드 세션 발급 완료
STUDENT_RESERVED    학생 인증 기능은 Reserved라 아직 완료 불가
SUSPENDED           제재 상태
WITHDRAWN           탈퇴 상태
```

## 5. 프론트 연결 기준

프론트는 모든 write를 Spring Boot REST로 보낸다. RTDB는 실시간 read subscription만 허용한다.

## 6. 확인 필요 사항

- 학생 인증 기능을 언제 도입할지
- AI 기능을 언제 재도입할지
- Jury case를 MVP에서 수동 생성으로 둘지, 후속 관리자 기능을 만들지
- Recap을 추후 AI 요약으로 갈지, 통계 요약으로 갈지
