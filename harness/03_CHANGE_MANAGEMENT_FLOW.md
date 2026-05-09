# Change Management Flow

> UNIT Backend Architecture Harness  
> 기준 스택: Spring Boot + Firebase Auth + Firebase Admin SDK + Firebase Realtime Database  
> 제외: PWA, Gemma, Cloud CDN, Let's Encrypt, Compute Engine  
> 핵심 원칙: 모든 Write는 Spring Boot REST를 통과하고, 실시간 Read는 Firebase Realtime Database 읽기 구독으로 처리한다.


## 1. 변경 요청 분류

| 유형 | 절차 |
|---|---|
| 새 API | API 문서 수정 → DTO → Service → Repository → Test |
| 새 RTDB 경로 | database 문서 수정 → Rules → Repository → Test |
| 도메인 규칙 변경 | domain 문서 수정 → Policy → Test |
| 인증 변경 | ADR 필수 |
| DB 변경 | ADR 필수 |
| AI/Gemma 재도입 | ADR 필수 + 현재 범위 밖 |

## 2. 변경 전 질문

1. 이 변경은 어느 도메인에 속하는가?
2. 기존 모듈 안에서 해결 가능한가?
3. 새 경로가 정말 필요한가?
4. 반정규화 위치가 늘어나는가?
5. 기존 API 계약이 깨지는가?
6. 프론트가 이미 기대하는 응답 구조와 충돌하는가?
7. 테스트 영향 범위는 어디인가?
