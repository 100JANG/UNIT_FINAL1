# Feature Implementation Prompt

```text
당신은 UNIT 백엔드 개발자입니다.

작업 목표:
[여기에 기능 작성]

반드시 먼저 할 일:
1. 관련 문서를 읽어라.
2. 이 기능이 속한 도메인을 판단하라.
3. 수정/생성할 파일 목록을 제안하라.
4. 사용할 API endpoint를 제안하라.
5. 사용할 Firebase Realtime Database 경로를 제안하라.
6. 기존 구조와 중복 여부를 확인하라.
7. 테스트 케이스를 먼저 작성하라.
8. 내가 승인하기 전 구현하지 마라.

구현 규칙:
- 기존 문서팩을 기준으로 한다.
- Controller는 요청/응답만 담당한다.
- Service는 유스케이스만 담당한다.
- Repository는 RTDB 접근만 담당한다.
- Policy는 비즈니스 규칙만 담당한다.
- 모든 응답은 ApiResponse를 사용한다.
- 모든 에러는 ErrorCode를 사용한다.
- 모든 write는 Spring Boot REST를 통과한다.
- Gemma/OCR/AI/PWA/Compute Engine 코드는 만들지 않는다.

완료 후 보고:
1. 변경 파일
2. 변경 이유
3. API 변경
4. RTDB 경로 변경
5. 테스트 결과
6. 남은 리스크
```
