export type NotifKind = 'cmt' | 'rec' | 'jury' | 'sys';

export type Notif = {
  kind: NotifKind;
  read: boolean;
  ago: string;
  title: string;
  body: string;
};

export const NOTIFS: Notif[] = [
  { kind: 'cmt',  read: false, ago: '방금',     title: '내 글에 댓글이 달렸어요',                    body: '익명3 · 식단표 학사정보 사이트에 올라와 있어요…' },
  { kind: 'jury', read: false, ago: '5분 전',  title: '같은 학과 학생들의 판단을 기다리고 있어요',  body: '신고된 글 1건 · 24시간 안에 한 표 부탁드려요' },
  { kind: 'rec',  read: false, ago: '32분 전', title: '내 댓글이 12명에게 추천받았어요',            body: '"중도 4층 자리 거의 다 차 있고…"' },
  { kind: 'cmt',  read: true,  ago: '2시간 전', title: '내가 쓴 글에 새 댓글 4개',                  body: '자취방 계약할 때 조심할 점 공유합니다' },
  { kind: 'sys',  read: true,  ago: '어제',     title: '강의평 시즌이 열렸어요',                    body: '한 줄 평가 후 다른 강의평을 볼 수 있어요' },
  { kind: 'rec',  read: true,  ago: '2일 전',   title: '내 글이 인기 게시글로 올랐어요',            body: '#수강신청 #학사' },
];

export const KIND_LABEL: Record<NotifKind, string> = {
  cmt: '댓글',
  rec: '추천',
  jury: '배심원',
  sys: '시스템',
};
