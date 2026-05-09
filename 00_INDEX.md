# UNIT Backend MD — Reserved Clean Index

> UNIT Backend Architecture Harness  
> 기준 스택: Spring Boot + Firebase Auth + Firebase Admin SDK + Firebase Realtime Database  
> 제외: PWA, Gemma, Cloud CDN, Let's Encrypt, Compute Engine  
> 핵심 원칙: 모든 Write는 Spring Boot REST를 통과하고, 실시간 Read는 Firebase Realtime Database 읽기 구독으로 처리한다.  
> Reserved 기능은 구현/대체 구현하지 않고 문서상 자리만 남긴다.



## 1. 문서팩 목적

이 문서팩은 `React + Tailwind CSS` 프론트와 연결될 `Spring Boot + Firebase Realtime Database` 백엔드의 기준 문서다.

이번 버전의 핵심은 **제외 기능을 다른 기능으로 대체하지 않는 것**이다. 기존 문서에 있던 OCR, Gemma, AI 다듬기, AI 신고 판정, AI Recap은 모두 Reserved로만 표시한다.

## 2. 반드시 지킬 원칙

1. `PWA`, `Gemma`, `Compute Engine`, `Cloud CDN`, `Let's Encrypt` 관련 구현을 만들지 않는다.
2. 학생증 OCR은 구현하지 않는다.
3. 학생증 OCR을 학교 이메일 검증, 수동 학적부 검증, registry 검증 등으로 대체하지 않는다.
4. AI 글쓰기 다듬기를 금칙어 필터, RuleModeration, 문장 교정 서비스로 대체하지 않는다.
5. AI 신고 판정을 신고 직후 자동 배심원 생성, 자동 제재, 룰 기반 처분으로 대체하지 않는다.
6. AI Recap을 임시 통계 집계, 핫글 TOP10, 개인 활동 집계로 대체하지 않는다.
7. Reserved 기능은 `04_RESERVED_FEATURE_POLICY.md`에서만 정책화하고, 실제 도메인/DB/테스트 구현 문서에서는 제거한다.

## 3. 개발자가 먼저 읽을 문서

1. `01_BACKEND_SCOPE_AND_ASSUMPTIONS.md`
2. `04_RESERVED_FEATURE_POLICY.md`
3. `backend/01_BACKEND_ARCHITECTURE.md`
4. `backend/02_PACKAGE_STRUCTURE.md`
5. `database/01_REALTIME_DATABASE_MODEL.md`
6. `api/02_ENDPOINTS_MVP.md`
7. `domain/01_DOMAIN_OVERVIEW.md`
8. `harness/01_BACKEND_CODING_HARNESS.md`
9. `claude/01_CLAUDE_CODE_BACKEND_RULES.md`

## 4. MVP 구현 대상

- Auth session 발급/갱신/로그아웃
- Users profile/settings/activity
- Boards metadata
- Posts feed/create/detail/update/delete/like/scrap
- Comments create/update/delete/like
- Courses search/detail
- Reviews create/report
- Reports receive only
- Jury manual case/vote only, 자동 생성 없음
- Notifications / FCM token

## 5. Reserved 대상

| 기능 | 처리 |
|---|---|
| Student Card OCR | Reserved only |
| AI Writing Refine | Reserved only |
| AI Report Judgment | Reserved only |
| AI Recap | Reserved only |

## 6. 레거시 방지 효과

임시 대체 구현은 나중에 진짜 기능을 붙일 때 삭제해야 하는 레거시가 된다. 이번 버전은 빈 자리를 명확히 표시하고, 실제 구현 대상만 문서화한다.
