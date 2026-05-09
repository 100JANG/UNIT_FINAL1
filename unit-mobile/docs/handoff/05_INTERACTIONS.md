# 05. 상호작용 디테일

화면별로 빠뜨리기 쉬운 마이크로 인터랙션. 누락 시 RN 결과물이 정적이라 디자인 의도가 사라짐.

---

## 글로벌

- **Pressable에 항상 `pressed` 상태 적용** — 옅은 회색 바닥색
- **터치 시 햅틱** — `import * as Haptics from 'expo-haptics'`, 추천/스크랩/투표 같은 성공 액션에 `Haptics.impactAsync('light')`
- **숫자 변경 시 카운트업 애니메이션** — `react-native-reanimated`의 `withTiming`

---

## 피드

- **Feed 카드**: pressed 시 bg `C.surface`, scale 0.99 (0.1s)
- **Pull-to-refresh**: RefreshControl tintColor `C.inkNavy`
- **새 글 알림 칩**: 위에서 슬라이드다운, 탭하면 스크롤 top + 갱신

## PostDetail

| 요소 | 동작 |
|---|---|
| 추천 버튼 | 1차 탭 → 채움(navy)+1, 2차 탭 → 해제 |
| 스크랩 버튼 | 토글, 골드 |
| 공유 버튼 | 탭 → "복사됨" 1.2s + check 아이콘, 후 원상복귀 |
| 댓글 좋아요 | 동일 토글, mono 숫자 |
| 댓글 입력 | draft 비어있으면 등록 버튼 disabled (회색), 입력하면 navy |

## Write

- 사진 첨부 시 썸네일 그리드 (최대 5)
- 첨부 → 길게 누르면 삭제 모드 (X 표시)
- 게시판 선택 → BottomSheet
- 익명 토글 시 즉시 미리보기 닉네임 변경 ("익명12")

## Courses

- 추천/비추 버튼: 탭 즉시 색 채움 + 햅틱, 0.3s 후 같은 행에 "의견 등록됨" 인라인 토스트
- 같은 버튼 다시 탭 → 취소

## CourseReview

- 추천/비추 큰 버튼 88×88 → 선택 시 navy 채움 + 등록 버튼 활성화
- 한줄평 글자수 카운터 (50/150)

## Notifications

- 행 탭 → 즉시 read 처리 + 점 사라짐 + 폰트 굵기 medium → regular
- 모두 읽음 → 0.3s 페이드 후 unread 카운트 0
- 빈 상태(읽지않음 0) → 일러스트 X, 텍스트만

## Block 해제 (중요)

```
[해제] (#B73E37 빨강) → 1차 탭
   ↓ "정말 해제?" 0.2s 후
[정말 해제?] → 2차 탭
   ↓ 햅틱 + "✓ 해제됨" (#1F7A5C 초록)
0.7s 대기 → 행 페이드아웃 0.3s
2.2s 안에 2차 탭 안 누르면 → 자동 원복
```

useEffect + setTimeout 조합. cleanup 필수.

## Search

- 최근/인기 검색어 탭 → setQ 호출 → 자동 결과 fetch
- 인기 검색어 ▲▼ 색: 상승 mint, 하락 coral
- TOP 3는 navy 숫자, 4–10은 hint
- 검색 결과 키워드 하이라이트 (`fontWeight: '600'`, navy)

## ChatRoom

- 입장 시 마지막 메시지로 자동 스크롤
- mock 소켓: 5초 후 상대 typing indicator (3개 점 애니메이션) → 2초 후 메시지 도착
- 메시지 추가 시 부드러운 슬라이드업 (Reanimated)
- 입력 시 키보드 올라오면 입력바도 함께 올라감 (KeyboardAvoidingView)

## Bus / Library

- 5초 폴링으로 시간 갱신
- 변동 시 숫자가 카운트업 애니메이션

## MannerGrade

- 진행바 채움: 페이지 로드 시 0 → 현재값 1.0s ease-out
- 점수 카운트업 0 → 82
- 등급 변동 시 햅틱 success

## FriendRequests

- 수락 → 행 슬라이드 아웃 + "친구가 됐어요" 토스트
- 거절 → 회색 페이드아웃

---

## 공통 토스트

`react-native-toast-message` 또는 자체. 위치 상단, 3초, 종류 4개:
- success (mint)
- error (coral)
- info (navy)
- warn (gold)
