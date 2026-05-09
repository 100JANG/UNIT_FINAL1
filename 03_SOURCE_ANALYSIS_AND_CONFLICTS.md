# Source Analysis and Conflicts

> UNIT Backend Architecture Harness  
> 기준 스택: Spring Boot + Firebase Auth + Firebase Admin SDK + Firebase Realtime Database  
> 제외: PWA, Gemma, Cloud CDN, Let's Encrypt, Compute Engine  
> 핵심 원칙: 모든 Write는 Spring Boot REST를 통과하고, 실시간 Read는 Firebase Realtime Database 읽기 구독으로 처리한다.  
> Reserved 기능은 구현/대체 구현하지 않고 문서상 자리만 남긴다.



## 1. 분석한 소스

| 문서 | 핵심 내용 | 백엔드 반영 |
|---|---|---|
| UNIT API Spec | REST API, 공통 응답, Firebase RTDB, Auth, Posts, Courses, Jury | 구현 가능한 API 계약으로 정리 |
| UNIT Frontend Architecture | 5탭, 12개 핵심 페이지, `/feed`, `/write`, `/courses`, `/jury`, `/recap` | 화면별 API 요구사항 도출 |
| UNIT UI Prompts | Spring Boot REST write, RTDB read subscription, React/Tailwind 화면 구조 | 프론트-백엔드 계약에 반영 |
| UNIT PPT | 문제, 자치 커뮤니티, 배심원, 강의평, Recap | 도메인 요구사항으로 반영 |

## 2. 충돌 항목

| 원문 기능 | 현재 결정 | 이유 |
|---|---|---|
| PWA / Offline | 제외 | 현재 스택에서 제외 |
| Gemma / AI | 제외 | 현재 스택에서 제외 |
| Compute Engine | 제외 | 현재 스택에서 제외 |
| 학생증 OCR | Reserved | 대체 구현 금지 |
| AI 글쓰기 다듬기 | Reserved | 대체 구현 금지 |
| AI 신고 판정 | Reserved | 대체 구현 금지 |
| AI Recap | Reserved | 대체 구현 금지 |

## 3. 이번 문서팩에서 삭제한 대체 구현

- 학생증 OCR 대체 검증 문서 제거
- AI 글쓰기 다듬기 대체 문서 제거
- AI 신고 판정 대체 문서 제거
- Recap 임시 집계 문서 제거

## 4. 레거시 방지 규칙

1. 제외된 기능은 다른 방식으로 흉내 내지 않는다.
2. API 계약과 DB 경로에 구현 가능 기능만 둔다.
3. Reserved 기능은 `04_RESERVED_FEATURE_POLICY.md`와 `domain/08_RESERVED_FEATURES_DOMAIN.md`에서만 관리한다.
4. Reserved 기능 구현은 후속 ADR 승인 전까지 금지한다.
