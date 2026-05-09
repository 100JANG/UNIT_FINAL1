# Reserved Feature Policy

> UNIT Backend Architecture Harness  
> 기준 스택: Spring Boot + Firebase Auth + Firebase Admin SDK + Firebase Realtime Database  
> 제외: PWA, Gemma, Cloud CDN, Let's Encrypt, Compute Engine  
> 핵심 원칙: 모든 Write는 Spring Boot REST를 통과하고, 실시간 Read는 Firebase Realtime Database 읽기 구독으로 처리한다.  
> Reserved 기능은 구현/대체 구현하지 않고 문서상 자리만 남긴다.



## 1. 목적

이 문서는 제외된 기능을 임시 대체 구현으로 메우는 것을 막기 위한 하네스 문서다.

## 2. Reserved 기능 목록

| 기능 | 상태 | 현재 문서 처리 |
|---|---|---|
| Student Card OCR | Reserved | endpoint/API 계약에만 표시 가능, 구현 문서 제거 |
| AI Writing Refine | Reserved | endpoint/API 계약에만 표시 가능, 구현 문서 제거 |
| AI Report Judgment | Reserved | Reports는 접수까지만, 자동 판정/자동 제재 없음 |
| AI Recap | Reserved | endpoint/API 계약에만 표시 가능, DB/job/read model 없음 |

## 3. 금지 사항

- Reserved 기능을 다른 기능으로 대체하지 않는다.
- Reserved 기능의 DB 경로를 만들지 않는다.
- Reserved 기능의 Service, Repository, Scheduler, Job, Policy 클래스를 만들지 않는다.
- Reserved 기능 테스트 케이스를 구현 테스트로 만들지 않는다.
- Reserved 기능은 후속 ADR 승인 전까지 `FEATURE_NOT_IMPLEMENTED` 또는 프론트 비활성 상태로만 다룬다.

## 4. 허용 사항

- API 문서에 Reserved endpoint를 표시하는 것
- ErrorCode에 `FEATURE_NOT_IMPLEMENTED`를 두는 것
- Claude Code 규칙에 Reserved 금지 목록을 두는 것
- 보고서에 추후 결정 필요 사항으로 남기는 것

## 5. Claude Code 규칙

Claude Code는 아래 키워드가 포함된 기능 요청을 받으면 구현 전에 멈추고 확인해야 한다.

```text
OCR
student card
Gemma
AI refine
AI moderation
AI judgment
Recap
RuleModeration
student registry
```

## 6. 레거시 방지 관점

빈 기능은 빚이 아니다. 임시 대체 구현이 빚이다. 이번 버전은 기능 공백을 인정하고, 구현 대상과 Reserved 대상을 분리한다.
