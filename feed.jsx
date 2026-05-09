// feed.jsx — Feed list + Post detail
// Korean campus community style: list rows, thin dividers, no big cards.

const POSTS = [
  { id: 1, board: '자유', title: '기숙사 식단 이번 학기부터 바뀐 거 어때요?',
    body: '아침에 시리얼 코너 사라지고 토스트 추가됐는데, 점심은 그대로인 것 같음. 다른 분들은 어떻게 보세요?',
    nick: '익명', time: '12분 전', up: 24, cmt: 18, scrap: 4 },
  { id: 2, board: '학사', title: '수강신청 서버 또 터질까요',
    body: '오늘 밤 12시 1차 수강신청인데 작년 기억이 떠올라서 미리 글 남깁니다…', 
    nick: '익명', time: '32분 전', up: 56, cmt: 41, scrap: 12 },
  { id: 3, board: '시험', title: '중간고사 기간 도서관 자리 어디가 제일 낫나요',
    body: '중도 4층 자리 거의 다 차 있고, 공대 별관은 의외로 한산하더라고요. 추천 부탁드립니다.',
    nick: '익명', time: '1시간 전', up: 12, cmt: 9, scrap: 2 },
  { id: 4, board: '자취', title: '자취방 계약할 때 조심할 점 공유합니다',
    body: '관리비 항목, 옵션 가구 상태, 누수 흔적, 결로 자국 — 이 네 가지는 꼭 확인하세요. 저는 두 번째 계약 만에 알았습니다.',
    nick: '익명', time: '2시간 전', up: 89, cmt: 23, scrap: 47 },
  { id: 5, board: '학과', title: '데이터분석개론 팀플 멤버 구합니다',
    body: '수금 강의 듣는 분 중에 마지막 발표 같이 하실 분 한 분만 더 구해요.',
    nick: '익명', time: '3시간 전', up: 5, cmt: 7, scrap: 0 },
  { id: 6, board: '학사', title: '계절학기 신청 일정 정리',
    body: '여름 계절학기 5/12~5/16 신청, 6/24 개강. 학사일정에 자세히 나와있어요.',
    nick: '익명', time: '5시간 전', up: 31, cmt: 4, scrap: 22 },
];

function FeedPage({ onOpen }) {
  const [scope, setScope] = React.useState(0);
  const [sort, setSort] = React.useState(0);
  const scopes = ['통합', '내학교', '내학과'];
  const sorts = ['최신순', '인기순', '댓글순'];

  return (
    <Screen
      appBar={<AppBar
        leading={
          <span className="text-[17px] font-semibold tracking-[-0.3px] text-[#111] px-1 -ml-1">아주대학교</span>
        }
        trailing={<>
          <button className="p-2">{Ic.search(20)}</button>
          <button className="p-2">{Ic.bell(20)}</button>
        </>}
        divider={false}
      />}
      bottomTab={<BottomTab active="home"/>}
      scrollClass="bg-[#F4F5F7]">

      {/* Scope tabs */}
      <div className="flex items-center px-4 border-b border-[#E5E7EB] bg-white sticky top-0 z-10">
        {scopes.map((s, i) => (
          <button key={s} onClick={() => setScope(i)}
            className={`relative h-12 px-4 text-[14.5px] tracking-[-0.2px] ${scope === i ? 'text-[#111] font-semibold' : 'text-[#9CA3AF]'}`}>
            {s}
            {scope === i && <span className="absolute left-3 right-3 bottom-0 h-[2.5px] bg-[#111]"/>}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-1 text-[#6B7280]">
          <button className="text-[12.5px] flex items-center gap-0.5 px-2 py-1">
            {sorts[sort]}{Ic.chevDn(12)}
          </button>
        </div>
      </div>

      {/* Post cards */}
      <ul className="px-3 pt-3 pb-4 space-y-2.5">
        {POSTS.map((p) => (
          <li key={p.id}>
            <button onClick={() => onOpen?.(p.id)}
              className="w-full text-left bg-white rounded-xl border border-[#E5E7EB] px-4 py-3.5 active:bg-[#F9FAFB] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              <div className="flex items-center gap-1.5 mb-2">
                <Pill tone="plain">{p.board}</Pill>
                <span className="text-[12px] text-[#9CA3AF]">{p.nick} · {p.time}</span>
              </div>
              <h3 className="text-[16px] font-semibold leading-[1.35] text-[#111] tracking-[-0.3px] mb-1.5">
                {p.title}
              </h3>
              <p className="text-[13.5px] leading-[1.55] text-[#4B5563] tracking-[-0.2px] line-clamp-2 mb-3">
                {p.body}
              </p>
              <div className="flex items-center gap-4 text-[12.5px] text-[#6B7280]">
                <span className="flex items-center gap-1 text-[#000080] font-semibold">
                  {Ic.thumb(13)}{p.up}
                </span>
                <span className="flex items-center gap-1">{Ic.msg(13)}{p.cmt}</span>
                <span className="flex items-center gap-1">{Ic.bookmark(13)}{p.scrap}</span>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </Screen>
  );
}

// ─── Post detail ─────────────────────────────────────────
const COMMENTS = [
  { nick: '익명1', time: '8분 전', body: '저는 토스트 코너 좋더라고요. 잼 종류 늘려주면 좋겠음.', up: 4 },
  { nick: '익명2', time: '6분 전', body: '근데 사이드 두 가지 늘었다는 거 사실인가요? 오늘 점심엔 그대로던데', up: 1 },
  { nick: '익명3', time: '3분 전', body: '식단표 학사정보 사이트에 올라와 있어요. 4월 4주차부터 적용이라고 합니다.', up: 8 },
  { nick: '익명4', time: '1분 전', body: '시리얼 사라진게 제일 아쉬움…', up: 2 },
];

function PostDetailPage({ onBack }) {
  const p = POSTS[0];
  return (
    <div className="h-full flex flex-col bg-white">
      <AppBar
        leading={<>
          <button className="p-1 -ml-1" onClick={onBack}>{Ic.back(22)}</button>
          <span className="text-[15px] font-medium text-[#111] ml-1">자유게시판</span>
        </>}
        trailing={<button className="p-2">{Ic.more(20)}</button>}
      />
      <div className="flex-1 min-h-0 overflow-y-auto scroll">
        {/* Body */}
        <article className="px-4 pt-4 pb-3">
          <div className="flex items-center gap-2 mb-2">
            <Avatar name="익" size={28}/>
            <div className="min-w-0">
              <div className="text-[13px] text-[#111] font-medium leading-tight">{p.nick}</div>
              <div className="text-[11.5px] text-[#9CA3AF]">{p.time}</div>
            </div>
            <Pill tone="plain" className="ml-auto">{p.board}</Pill>
          </div>
          <h1 className="text-[18px] font-semibold tracking-[-0.4px] leading-[1.35] text-[#111] mb-2">{p.title}</h1>
          <p className="text-[14.5px] leading-[1.7] text-[#374151] tracking-[-0.2px] whitespace-pre-line">
            {p.body}{"\n\n"}오늘 점심 직접 가서 봤는데 메인은 진짜 그대로였어요.
            사이드만 두 가지 늘었고, 음료대는 그대로. 업체 바뀐 줄 알았는데 그건 아닌 듯.{"\n\n"}
            바뀐 거 직접 보신 분 후기 있으면 같이 공유해 주세요.
          </p>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {['기숙사','식단','학교생활'].map(t => (
              <span key={t} className="text-[12px] text-[#000080]">#{t}</span>
            ))}
          </div>
        </article>
        <Hairline className="mx-4 mt-1"/>

        {/* Action row */}
        <div className="flex items-center justify-around py-2 text-[#6B7280]">
          {[
            { i: Ic.thumb, l: '추천 24', accent: true },
            { i: Ic.msg, l: '댓글 18' },
            { i: Ic.bookmark, l: '스크랩 4' },
            { i: Ic.share, l: '공유' },
          ].map((a, idx) => (
            <button key={idx} className={`flex items-center gap-1.5 px-3 py-1.5 text-[12.5px] ${a.accent ? 'text-[#000080] font-medium' : ''}`}>
              {a.i(16)}{a.l}
            </button>
          ))}
        </div>
        <div className="h-[6px] bg-[#F8F9FA]"/>

        {/* Comments */}
        <div className="px-4 pt-3 pb-2 flex items-center justify-between">
          <span className="text-[13.5px] font-semibold text-[#111]">댓글 18</span>
          <button className="text-[12px] text-[#9CA3AF]">최신순{Ic.chevDn(12)}</button>
        </div>
        <ul>
          {COMMENTS.map((c, i) => (
            <li key={i} className="px-4 py-3">
              <div className="flex items-center gap-2 mb-1">
                <Avatar name={c.nick.slice(2)} size={24}/>
                <span className="text-[12.5px] font-medium text-[#111]">{c.nick}</span>
                <span className="text-[11px] text-[#9CA3AF]">{c.time}</span>
              </div>
              <p className="text-[13.5px] leading-[1.55] text-[#374151] pl-[32px]">{c.body}</p>
              <div className="pl-[32px] mt-1.5 flex items-center gap-3 text-[11.5px] text-[#9CA3AF]">
                <button className="flex items-center gap-1">{Ic.thumb(12)}{c.up}</button>
                <button>답글</button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Sticky comment input */}
      <div className="border-t border-[#F0F0F0] px-3 py-2 flex items-center gap-2 bg-white">
        <input placeholder="댓글을 남겨보세요"
          className="flex-1 h-10 px-3.5 rounded-full bg-[#F3F4F6] text-[13.5px] outline-none placeholder:text-[#9CA3AF]"/>
        <button className="text-[13px] font-semibold text-[#000080] px-2">등록</button>
      </div>
    </div>
  );
}

Object.assign(window, { FeedPage, PostDetailPage, POSTS });
