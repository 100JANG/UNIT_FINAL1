# Risk Report

> UNIT Backend Architecture Harness  
> 기준 스택: Spring Boot + Firebase Auth + Firebase Admin SDK + Firebase Realtime Database  
> 제외: PWA, Gemma, Cloud CDN, Let's Encrypt, Compute Engine  
> 핵심 원칙: 모든 Write는 Spring Boot REST를 통과하고, 실시간 Read는 Firebase Realtime Database 읽기 구독으로 처리한다.  
> Reserved 기능은 구현/대체 구현하지 않고 문서상 자리만 남긴다.



| 리스크 | 발생 원인 | 영향도 | 가능성 | 방지 전략 |
|---|---|---:|---:|---|
| Reserved 기능 임시 구현 | 프론트 화면은 있는데 백엔드 기능이 비어 있음 | 높음 | 높음 | `04_RESERVED_FEATURE_POLICY.md` 우선 적용 |
| DB 경로 즉흥 추가 | RTDB가 트리형이라 쉽게 노드가 늘어남 | 높음 | 중간 | `database/02_RTDATABASE_PATHS_AND_INDEXES.md` 밖 경로 금지 |
| 프론트 직접 write | RTDB SDK를 프론트도 사용 | 높음 | 중간 | Security Rules에서 write 차단, Spring Boot만 Admin write |
| 신고 후 자동 처리 구현 | 배심원/AI 기능 공백을 메우려는 압박 | 높음 | 중간 | Reports는 RECEIVED까지만 |
| Recap 임시 집계 구현 | 발표 화면 요구사항 | 중간 | 중간 | Recap은 Reserved API만 |
| Service 비대화 | Firebase write/read 로직이 Service에 섞임 | 높음 | 중간 | Repository/Gateway 분리 |

## 핵심 대응

Reserved 기능을 구현하지 않는 것이 현재 레거시 방지 전략이다.
