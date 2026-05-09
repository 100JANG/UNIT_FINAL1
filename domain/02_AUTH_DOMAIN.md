# Auth Domain

> UNIT Backend Architecture Harness  
> 기준 스택: Spring Boot + Firebase Auth + Firebase Admin SDK + Firebase Realtime Database  
> 제외: PWA, Gemma, Cloud CDN, Let's Encrypt, Compute Engine  
> 핵심 원칙: 모든 Write는 Spring Boot REST를 통과하고, 실시간 Read는 Firebase Realtime Database 읽기 구독으로 처리한다.  
> Reserved 기능은 구현/대체 구현하지 않고 문서상 자리만 남긴다.



## 1. 책임

- Firebase ID Token 검증
- 백엔드 sessionToken 발급
- Firebase Custom Token 발급
- 세션 만료 관리
- 정지 사용자 차단

## 2. 책임이 아닌 것

- 학생증 OCR
- 학적 검증
- student registry 검증
- 학번/학과 입력값 검증

## 3. 사용자 인증 상태

```text
AUTHENTICATED
STUDENT_VERIFICATION_RESERVED
SUSPENDED
WITHDRAWN
```

## 4. Session 발급 흐름

1. Firebase ID Token 검증
2. email 추출
3. 기존 User 조회 또는 생성
4. `studentVerificationStatus=RESERVED` 유지
5. sessionToken 발급
6. firebaseCustomToken 발급
7. sessions 노드 저장

## 5. Reserved Student Verification

학생 인증 기능은 현재 빈 자리다.

금지:
- 학교 이메일 도메인 검증을 학생 인증으로 간주하지 않는다.
- 학번/학과 입력을 인증 완료로 처리하지 않는다.
- student registry seed 데이터를 만들지 않는다.

## 6. 레거시 방지 관점

로그인 세션과 학생 인증을 분리하면 나중에 진짜 학생 인증이 들어올 때 인증 시스템을 갈아엎지 않아도 된다.
