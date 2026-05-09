# 07. PR 계획 (16개)

각 PR은 독립적으로 리뷰·머지·롤백 가능해야 함.

---

## PR-01 · `feat: design tokens + ui/ scaffolding`
- `src/theme/tokens.ts` (01_TOKENS.md 기반)
- `src/components/ui/` 14개 컴포넌트 빈 껍데기 + 타입 + Storybook
- 기존 코드 0줄 수정
- 체크: 기존 빌드/테스트 PASS, Storybook에 14개 노출

## PR-02 · `feat: navigation routes for v2 screens`
- `src/navigation/UnitV2Stack.tsx` 추가
- 36개 라우트 등록 (placeholder 화면)
- 기존 네비게이션 그래프에 `<Stack.Screen name="UnitV2"/>` 한 줄만 추가
- 체크: deep link 동작, 라우트 충돌 없음

## PR-03 · `feat: 매너 학점 (MannerGrade, MannerLadder)`
- 컴포넌트: MannerBadge 완성
- 화면: 2개
- API mock + 실제 GET `/v1/me/manner`
- 체크: 9등급 색상 토큰 매칭, 진행바 애니메이션

## PR-04 · `feat: 인증·온보딩 (5)`
- AsyncStorage 키: `unit.token`, `unit.school`
- KeyboardAvoidingView, OTP 자동 포커스 이동
- FAQ 아코디언 5개
- 체크: cold start → SchoolSelect, 재진입 → Feed

## PR-05 · `feat: 검색·내 활동 (4)`
- 인기 검색어 행 48px, 클릭 시 검색 즉시 실행
- 키워드 하이라이트
- MyComments 에디토리얼 인용문 패턴
- 체크: 디바운스, 빈 상태

## PR-06 · `feat: 모더레이션 (5)`
- BlockList 2단계 해제 (가장 까다로움) — useEffect cleanup 검증
- Report 사유 라디오 6개
- CommentThread 카드형
- 체크: 2단계 해제 자동 취소 타이머

## PR-07 · `feat: 설정 (3)`
- ListRow 사용 일관성
- AccountSettings 탈퇴 2단계 + textarea
- 체크: 알림 채널 8개 토글

## PR-08 · `feat: 캠퍼스 허브 (6)`
- Timetable 친구 비교 토글
- Meal board view (Notion 스타일)
- Bus 5초 폴링, Library 5초 폴링
- Contacts 좌우 여백 px-5
- 체크: 폴링 cleanup

## PR-09 · `feat: 캠퍼스 심화 (4)`
- MarketWrite 사진 첨부
- 3개 Detail 화면 sticky CTA
- 체크: 키보드 처리

## PR-10 · `feat: 학생 생활 (4)`
- Contest D-day Pill, Jobs 거리/시급, Market 거래완료 필터, Friends 학과/학번 필터
- 체크: 필터 상태 유지

---

> 여기까지 PR-01~10은 **기존 코드 수정 0**. 신규만 추가.

---

## PR-11 · `refactor: 자치/알림/나 (3) v2 교체`
- Jury, Notifications, Profile
- feature flag `flags.unitV2.profile` 도입
- 기존 화면을 v2/로 옮긴 후 정식 위치에 새 구현
- 체크: flag off 시 기존 화면 정상

## PR-12 · `refactor: 강의평 (3) v2 교체`
- 어댑터: 기존 API 응답 → 새 컴포넌트 props
- 1탭 vote API 추가
- 체크: 기존 라우트 호출처 모두 동작

## PR-13 · `refactor: 채팅 (2) v2 교체`
- 소켓 어댑터 (기존 이벤트 → 신규 typing/read)
- 입력바 pb-8 (safe area 위)
- 체크: 메시지 페이지네이션, scroll 위치 복원

## PR-14 · `refactor: 피드 (3) v2 교체` ⚠️ 가장 위험
- Feed/PostDetail/Write
- 카드형 + 토글 액션
- 사진 첨부 multipart
- 체크: 무한 스크롤, pull-to-refresh, draft 자동 저장

## PR-15 · `chore: v2 → 정식 승격`
- `src/components/v2/` → 정식 위치로 이동
- import 경로 일괄 수정 (codemod)
- 체크: 빌드/테스트 PASS

## PR-16 · `feat: 다크모드 + 레거시 정리`
- 토큰 light/dark 분리
- ThemeProvider 적용
- 미사용 레거시 컴포넌트 삭제
- 체크: 토글 시 모든 화면 정상

---

## 각 PR 공통 체크리스트

- [ ] iOS·Android 둘 다 실기 테스트
- [ ] 키보드 올라온 상태에서 액션 가능
- [ ] 빈 상태 / 로딩 / 에러 3개 상태 모두 처리
- [ ] 다국어 hardcode 한글 모음 (i18n 키로 빼면 더 좋음)
- [ ] Storybook 스토리 1개 이상
- [ ] 단위 테스트 (적어도 reducer/util)
- [ ] PR 설명에 화면 스크린샷 (변경 화면만)
