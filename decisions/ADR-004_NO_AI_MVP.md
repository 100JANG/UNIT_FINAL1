# ADR-004: Reserved OCR / AI / Recap Features

> UNIT Backend Architecture Harness  
> 기준 스택: Spring Boot + Firebase Auth + Firebase Admin SDK + Firebase Realtime Database  
> 제외: PWA, Gemma, Cloud CDN, Let's Encrypt, Compute Engine  
> 핵심 원칙: 모든 Write는 Spring Boot REST를 통과하고, 실시간 Read는 Firebase Realtime Database 읽기 구독으로 처리한다.  
> Reserved 기능은 구현/대체 구현하지 않고 문서상 자리만 남긴다.



## Status

Accepted

## Context

기존 문서에는 학생증 OCR, Gemma, AI 글쓰기 다듬기, AI 신고 판정, AI Recap이 포함되어 있다. 하지만 이번 백엔드 범위에서는 PWA, Gemma, Compute Engine 등을 제외한다.

제외 기능을 다른 방식으로 대체하면, 나중에 진짜 기능을 붙일 때 제거해야 할 레거시가 된다.

## Decision

다음 기능은 구현하지 않고 Reserved로만 남긴다.

| 기능 | 현재 처리 | 금지 |
|---|---|---|
| 학생증 OCR | Reserved | 학교 이메일/학적부/registry 대체 검증 금지 |
| AI 글쓰기 다듬기 | Reserved | 금칙어/룰/문장교정 대체 금지 |
| AI 신고 판정 | Reserved | 신고 직후 자동 jury case 생성 금지 |
| AI Recap | Reserved | 정량 집계/핫글 집계 대체 금지 |

Reserved endpoint는 필요 시 `FEATURE_NOT_IMPLEMENTED`를 반환한다.

## Consequences

- 백엔드 MVP 범위가 명확해진다.
- 프론트의 일부 화면은 기능 연결 전까지 비활성 또는 Coming Soon 처리가 필요하다.
- 향후 진짜 OCR/AI/Recap 도입 시 기존 임시 로직 제거 비용이 없다.

## Legacy Prevention Effect

빈 기능은 유지보수 부채가 아니다. 임시 대체 구현이 유지보수 부채다. 이번 결정은 레거시를 만들지 않기 위해 기능 공백을 그대로 인정한다.

## Related Documents

- `04_RESERVED_FEATURE_POLICY.md`
- `01_BACKEND_SCOPE_AND_ASSUMPTIONS.md`
- `api/02_ENDPOINTS_MVP.md`
- `domain/08_RESERVED_FEATURES_DOMAIN.md`
