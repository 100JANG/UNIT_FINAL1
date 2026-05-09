# Missing Information Report

> UNIT Backend Architecture Harness  
> 기준 스택: Spring Boot + Firebase Auth + Firebase Admin SDK + Firebase Realtime Database  
> 제외: PWA, Gemma, Cloud CDN, Let's Encrypt, Compute Engine  
> 핵심 원칙: 모든 Write는 Spring Boot REST를 통과하고, 실시간 Read는 Firebase Realtime Database 읽기 구독으로 처리한다.  
> 제외된 기능은 대체 구현하지 않고 Reserved Placeholder로 비워둔다.


## 1. 확정 필요 항목

1. 학생증 OCR을 언제 어떤 방식으로 구현할지
2. AI 글쓰기 다듬기를 다시 넣을지 여부
3. 신고 후 배심원 자동 생성 조건
4. Recap 기능의 실제 범위
5. 학교/학과 권한을 학생 인증 없이 어디까지 허용할지
6. FCM 사용 여부
7. 운영자 페이지 필요 여부

## 2. 현재 비워둔 기능

| 기능 | 상태 |
|---|---|
| 학생증 OCR | Reserved |
| AI 글쓰기 다듬기 | Reserved |
| AI 신고 판정 | Reserved |
| AI Recap | Reserved |

## 3. Claude Code 주의

위 기능은 누락이 아니라 의도적으로 비워둔 범위다. 구현하지 않는다.
