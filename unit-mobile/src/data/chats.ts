export type Chat = {
  id: number;
  name: string;
  sub: string;
  time: string;
  unread: number;
  group?: boolean;
  members?: number;
  done?: boolean;
};

export const CHATS: Chat[] = [
  { id: 1, name: '소프트웨어학과 22 단톡', sub: '민수: 내일 발표 자료 공유함', time: '오후 9:42', unread: 4, group: true, members: 38 },
  { id: 2, name: '김민수',               sub: '나도 그 강의 들었어ㅋㅋ',     time: '오후 7:18', unread: 1 },
  { id: 3, name: '데이터분석개론 팀플',   sub: '서윤: 자료 정리 다 됐어요',   time: '오후 4:02', unread: 0, group: true, members: 4 },
  { id: 4, name: '이서윤',               sub: '내일 열람실 같이 갈래요?',    time: '어제',     unread: 0 },
  { id: 5, name: '중고장터 · 박지호',     sub: '맥북 직거래 가능하신가요?',   time: '어제',     unread: 2 },
  { id: 6, name: '경영학원론 스터디',     sub: '자료 업로드했습니다',        time: '5/10',     unread: 0, group: true, members: 6, done: true },
  { id: 7, name: '중고장터 · 이하랜',     sub: '매너 칭찬 고마워요!',        time: '5/8',      unread: 0, done: true },
  { id: 8, name: '자료구조론 팀플',       sub: '수고하셨습니다',             time: '5/2',      unread: 0, group: true, members: 5, done: true },
];

export type ChatMsg =
  | { from: 'me';   body: string; t: string; name?: undefined }
  | { from: 'them'; body: string; t: string; name: string }
  | { from: 'sys';  body: string; t: string; name?: undefined };

export const INITIAL_MSGS: ChatMsg[] = [
  { from: 'them', name: '서윤', body: '발표 자료 정리 다 됐어요!',                          t: '오후 4:01' },
  { from: 'them', name: '서윤', body: '근데 결론 부분에 그래프 하나 더 들어가야 할 것 같아', t: '오후 4:01' },
  { from: 'me',                  body: '오 좋아요. 어떤 그래프?',                            t: '오후 4:03' },
  { from: 'them', name: '민수', body: '참여율 70% 이상 강의 vs 미만 강의 비교',              t: '오후 4:04' },
  { from: 'me',                  body: '그럼 제가 데이터 뽑아서 차트 만들게요. 30분 정도 걸릴 듯', t: '오후 4:05' },
  { from: 'sys',                 body: '지호님이 들어왔어요',                                t: '오후 4:06' },
];
