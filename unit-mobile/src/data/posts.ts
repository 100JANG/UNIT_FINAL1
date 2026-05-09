export type Post = {
  id: number;
  board: string;
  title: string;
  body: string;
  nick: string;
  time: string;
  up: number;
  cmt: number;
  scrap: number;
};

export const POSTS: Post[] = [
  {
    id: 1, board: '자유',
    title: '기숙사 식단 이번 학기부터 바뀐 거 어때요?',
    body: '아침에 시리얼 코너 사라지고 토스트 추가됐는데, 점심은 그대로인 것 같음. 다른 분들은 어떻게 보세요?',
    nick: '익명', time: '12분 전', up: 24, cmt: 18, scrap: 4,
  },
  {
    id: 2, board: '학사',
    title: '수강신청 서버 또 터질까요',
    body: '오늘 밤 12시 1차 수강신청인데 작년 기억이 떠올라서 미리 글 남깁니다…',
    nick: '익명', time: '32분 전', up: 56, cmt: 41, scrap: 12,
  },
  {
    id: 3, board: '시험',
    title: '중간고사 기간 도서관 자리 어디가 제일 낫나요',
    body: '중도 4층 자리 거의 다 차 있고, 공대 별관은 의외로 한산하더라고요. 추천 부탁드립니다.',
    nick: '익명', time: '1시간 전', up: 12, cmt: 9, scrap: 2,
  },
  {
    id: 4, board: '자취',
    title: '자취방 계약할 때 조심할 점 공유합니다',
    body: '관리비 항목, 옵션 가구 상태, 누수 흔적, 결로 자국 — 이 네 가지는 꼭 확인하세요. 저는 두 번째 계약 만에 알았습니다.',
    nick: '익명', time: '2시간 전', up: 89, cmt: 23, scrap: 47,
  },
  {
    id: 5, board: '학과',
    title: '데이터분석개론 팀플 멤버 구합니다',
    body: '수금 강의 듣는 분 중에 마지막 발표 같이 하실 분 한 분만 더 구해요.',
    nick: '익명', time: '3시간 전', up: 5, cmt: 7, scrap: 0,
  },
  {
    id: 6, board: '학사',
    title: '계절학기 신청 일정 정리',
    body: '여름 계절학기 5/12~5/16 신청, 6/24 개강. 학사일정에 자세히 나와있어요.',
    nick: '익명', time: '5시간 전', up: 31, cmt: 4, scrap: 22,
  },
];

export type Comment = {
  nick: string;
  time: string;
  body: string;
  up: number;
};

export const COMMENTS: Comment[] = [
  { nick: '익명1', time: '8분 전', body: '저는 토스트 코너 좋더라고요. 잼 종류 늘려주면 좋겠음.', up: 4 },
  { nick: '익명2', time: '6분 전', body: '근데 사이드 두 가지 늘었다는 거 사실인가요? 오늘 점심엔 그대로던데', up: 1 },
  { nick: '익명3', time: '3분 전', body: '식단표 학사정보 사이트에 올라와 있어요. 4월 4주차부터 적용이라고 합니다.', up: 8 },
  { nick: '익명4', time: '1분 전', body: '시리얼 사라진게 제일 아쉬움…', up: 2 },
];
