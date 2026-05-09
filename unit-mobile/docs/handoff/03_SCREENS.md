# 03. 화면 사양 (36개)

각 화면 = 라우트 1개. `props`는 `@react-navigation/native-stack` 기준.

---

## ⓪ 인증 / 온보딩

### `Splash`
- props: `{}`
- 진입: cold start
- UI: UNIT 로고 64px, 서브카피 "내 학교 안의 진짜 이야기", 하단 진행 dot 3개
- 1.2s 후 자동 → SchoolSelect (신규) 또는 Feed (로그인 복원)
- API: `GET /v1/me`로 세션 유효성

### `SchoolSelect`
- props: `{}`
- UI: 검색 input (학교명/도메인) + 인기 학교 5개 (인하·아주·서울·고려·연세)
- 행 56px, LogoMark 36 + 학교명 SemiBold 15 + 도메인 12 meta + 위치 sub
- onSelect → AsyncStorage(`unit.school`) 저장 → Login

### `Login`
- props: `{}`
- UI: 학교 로고+이름 (변경 가능), 학교 이메일 input (밑줄 inline), 다음 버튼
- 검증: 도메인 매치 / 길이 / 형식
- onSubmit → POST `/v1/auth/email-otp` → EmailVerify

### `EmailVerify`
- props: `{ email }`
- UI: 6자리 OTP, 5분 타이머, 다시 받기, FAQ 5개 아코디언
- API: POST `/v1/auth/verify`
- 성공 → ProfileSetup 또는 Feed

### `ProfileSetup`
- props: `{}`
- UI: 닉네임, 학과 선택(시트), 학번, 약관 체크
- API: PUT `/v1/me/profile`
- → Feed

---

## ① 피드

### `Feed`
- props: `{}`
- UI: 학교명 + chevron(드롭X, 변경 라우트), 검색·알림 trailing / 게시판 탭(자유·질문·익명·정보) / 정렬 / 카드형 리스트
- 카드: border + shadow, 보드 Pill + 시간 + 제목 + 메타(추천/댓글/스크랩)
- Pull-to-refresh / 무한스크롤
- API: GET `/v1/posts?board=&cursor=`

### `PostDetail`
- props: `{ id: number }`
- UI: 본문 + 태그 / 액션 행(추천/댓글/스크랩/공유 — 모두 토글) / 댓글 섹션 / 스티키 입력
- 토글:
  - 추천 → 네이비 + 카운트 +1
  - 스크랩 → 골드 + 카운트 +1
  - 공유 → "복사됨" 1.2초
- API: GET `/v1/posts/:id`, POST `/v1/posts/:id/like|scrap`, POST `/v1/comments`

### `Write`
- props: `{ board?: string }`
- UI: 익명 토글 + 게시판 선택 + 제목 + 본문 + 사진 첨부(최대 5)
- KeyboardAvoidingView 필수
- API: POST `/v1/posts` (multipart)

---

## ② 캠퍼스 허브

### `CampusHub`
- props: `{}`
- UI: 인사말 + 6개 타일(시간표·식단·셔틀·열람실·교내연락처·강의평★) + 빠른 링크
- 학교 선택 UI 없음
- 각 타일 → 해당 라우트

### `Timetable`
- props: `{}`
- UI: 월~금 격자, 각진 블록(rounded 4), 친구 비교 토글 + 공유 시트
- 친구 시간표 겹쳐 보기: friendId 다중 선택
- API: GET `/v1/timetable`, GET `/v1/friends/timetable?ids=`

### `Meal`
- props: `{}`
- UI: Notion board view, 카드 3~4개(학생식당·교직원·기숙사·푸드코트)
- 각 카드: 오늘 메뉴 4~6줄 + 가격
- API: GET `/v1/meal?date=YYYY-MM-DD`

### `Bus`
- props: `{}`
- UI: 노선 선택 칩 + 다음 도착 카운트다운 (mm:ss) + 시간표 리스트
- mock 5초마다 업데이트
- API: GET `/v1/bus/routes`, GET `/v1/bus/eta?route=`

### `Library`
- props: `{}`
- UI: 열람실별 좌석 가용율 (큰 모노 숫자 + 진행바) + 5초 갱신
- API: GET `/v1/library/rooms`

### `Contacts`
- props: `{}`
- UI: 카테고리 섹션 + 행에 부서·번호·내선, 좌우 여백 확보(px-5)
- 탭 → 전화 dial intent
- API: GET `/v1/contacts`

---

## ③ 학생 생활

### `Contest` / `Jobs` / `Market` / `Friends`
- 각각 board view 또는 list
- Contest: D-day 색상 배지(Pill), 주최, 상금
- Jobs: 시급 + 거리 + 요일·시간 필터
- Market: 거래완료 필터, 동네별 그룹
- Friends: 학과·학번 필터, 친구추가 CTA
- API: GET `/v1/contest|jobs|market|users/find`

---

## ④ 채팅

### `ChatList`
- props: `{}`
- UI: 진행중/완료 탭, 행 = 아바타 + 마지막 메시지 + 시간 + 읽지않음
- API: GET `/v1/chats`

### `ChatRoom`
- props: `{ id: string }`
- UI: 메시지 리스트(꼬리표 말풍선) + 입력 영역 (pb-8)
- mock 소켓: 5초마다 상대 타이핑 → 메시지
- API: WS `/ws/chat/:id`

---

## ⑤ 강의평

### `Courses`
- props: `{}`
- UI: 검색 + 필터 칩 + 행: 강의명·교수·진행바 + **원탭 추천/비추 버튼 2개**
- 토글 시 색 채움(네이비/코랄)
- API: GET `/v1/courses?search=`, POST `/v1/courses/:id/vote`

### `CourseDetail`
- props: `{ id: number }`
- UI: 큰 추천% (64px mono) + 평가 분포 + 한줄평 탭(추천/비추/의견) + 평가하기 CTA
- 북마크 토글 (골드)
- API: GET `/v1/courses/:id`

### `CourseReview`
- props: `{ id }`
- UI: 추천/비추 큰 버튼(88×88) + 한줄평 input + 등록
- 모달/시트로 표시
- API: POST `/v1/courses/:id/review`

---

## ⑥ 자치 / 알림 / 나

### `Jury`
- props: `{}`
- UI: 케이스 카드(원본 글 + 신고 사유) + 투표 버튼 + 익명 다른 학생 9명 진행 표시
- 24시간 카운트다운
- API: GET `/v1/jury`, POST `/v1/jury/:id/vote`

### `Notifications`
- props: `{}`
- UI: 전체/읽지않음 탭 + 카운트, 모두 읽음 버튼(unread > 0일 때만 활성)
- 행 탭 → 개별 읽음 처리, 점·볼드 사라짐
- 빈 상태 메시지
- API: GET `/v1/notifications`, PATCH `/v1/notifications/read-all`

### `Profile`
- props: `{}`
- UI: 아바타+학교+학과 / **MannerBadge(B0)** / 친구 검색 허용 토글 → 펼치면 라디오 3개(같은학과/친구의친구/전체) / 메뉴: 매너 학점·내가 쓴 글·내가 쓴 댓글·스크랩·배심원 기록 / 설정·로그아웃
- API: GET `/v1/me`

---

## ⑦ 검색 / 내 활동

### `Search`
- props: `{}`
- UI: 검색바 + 최근 검색어(칩, 클릭 시 검색) + 인기 검색어 10개(48px 행, 19px 모노 숫자, ▲▼ 등락, chevron, **클릭 시 검색**)
- 검색 입력 시: 필터 칩(전체·게시글·강의·장터·사용자) + 그룹별 결과 + 키워드 강조
- API: GET `/v1/search?q=&type=`

### `MyPosts` / `MyComments` / `Scraps`
- 카드형 리스트, 좌측 정보층 + 하단 그레이 메타 푸터(mono 숫자)
- MyComments: 에디토리얼 인용문 패턴 (큰 따옴표 + ↳ 출처)
- Scraps: 4탭 (게시글·강의·공모전·알바)
- API: GET `/v1/me/posts|comments|scraps`

---

## ⑧ 소셜 / 모더레이션

### `OtherProfile`
- props: `{ userId }`
- UI: 아바타 + 닉네임 + 매너배지 + 학교/학과 + 활동 통계 + 친구추가/메시지 + 신고/차단
- API: GET `/v1/users/:id`

### `FriendRequests`
- props: `{}`
- UI: 받은/보낸 탭 + 행: 아바타 + 닉네임 + 수락/거절
- API: GET `/v1/friends/requests`, POST `.../accept|reject`

### `Report`
- props: `{ targetType, targetId }`
- UI: 사유 라디오 6개 + 추가 설명 textarea + 제출
- API: POST `/v1/reports`

### `BlockList`
- props: `{}`
- UI: 차단 목록 + **2단계 해제** (1차 빨강 "정말 해제?" → 2차 초록 "✓ 해제됨" → 페이드아웃)
- 2.2s 안에 안 누르면 자동 취소
- API: GET `/v1/me/blocks`, DELETE `/v1/me/blocks/:id`

### `CommentThread`
- props: `{ commentId }`
- UI: 원댓글 + 답글들 (카드형, 시인성 강화) + 하단 입력(pb-6)
- API: GET `/v1/comments/:id/thread`

---

## ⑨ 설정

### `Settings`
- 그룹: 알림, 개인정보, 화면, 도움말, 정보
- ListRow 사용

### `NotificationSettings`
- 채널별 스위치 8개

### `AccountSettings`
- 이메일·비밀번호·로그아웃·**탈퇴**(2단계 확인 + textarea + 빨강 CTA)
- API: DELETE `/v1/me`

---

## ⑩ 캠퍼스 심화

### `MarketWrite`
- 사진 첨부, 제목, 가격, 카테고리, 설명, 위치
- API: POST `/v1/market`

### `MarketDetail` / `JobDetail` / `ContestDetail`
- 큰 이미지 + 메타 + 본문 + 하단 sticky CTA(채팅하기/지원하기/모집)
- API: GET `/v1/market|jobs|contest/:id`

---

## ⑪ 매너 학점

### `MannerGrade`
- props: `{}`
- UI: 큰 학점 글자 (B0, 96px, MannerBadge 색) + 점수 (82/100, mono) + 다음 등급까지 진행바 / 4축 평가(친절·진실·활동·신고이력) / 최근 변동 타임라인 / 점수 산정 근거 카드
- API: GET `/v1/me/manner`

### `MannerLadder`
- 9등급 사다리 (A+ → F)
- **상단**: +/− 점수 기준 + 운영 원칙 안내 카드 (반드시 있어야 함)
- 등급별 혜택 (현실적인 것: 글 작성, 신고 가중치, 채팅 입장 제한 등)
- 9단계 색은 토큰 그대로
