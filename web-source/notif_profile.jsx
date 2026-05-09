// notif_profile.jsx — 알림 + 프로필

const NOTIFS = [
  { kind: 'cmt',   read: false, ago: '방금', title: '내 글에 댓글이 달렸어요',
    body: '익명3 · 식단표 학사정보 사이트에 올라와 있어요…' },
  { kind: 'jury',  read: false, ago: '5분 전', title: '같은 학과 학생들의 판단을 기다리고 있어요',
    body: '신고된 글 1건 · 24시간 안에 한 표 부탁드려요' },
  { kind: 'rec',   read: false, ago: '32분 전', title: '내 댓글이 12명에게 추천받았어요',
    body: '"중도 4층 자리 거의 다 차 있고…"' },
  { kind: 'cmt',   read: true,  ago: '2시간 전', title: '내가 쓴 글에 새 댓글 4개',
    body: '자취방 계약할 때 조심할 점 공유합니다' },
  { kind: 'sys',   read: true,  ago: '어제',    title: '강의평 시즌이 열렸어요',
    body: '한 줄 평가 후 다른 강의평을 볼 수 있어요' },
  { kind: 'rec',   read: true,  ago: '2일 전',  title: '내 글이 인기 게시글로 올랐어요',
    body: '#수강신청 #학사' },
];

const KIND_LABEL = { cmt: '댓글', rec: '추천', jury: '배심원', sys: '시스템' };

function NotificationsPage() {
  const [tab, setTab] = React.useState(0);
  const list = tab === 0 ? NOTIFS : NOTIFS.filter(n => !n.read);
  return (
    <Screen
      appBar={<AppBar title="알림" trailing={<button className="text-[12.5px] text-[#9CA3AF] px-2 py-1.5">모두 읽음</button>} divider={false}/>}
      bottomTab={<BottomTab active="bell"/>}>
      <div className="flex items-center px-4 border-b border-[#F0F0F0]">
        {[{l:'전체', c: NOTIFS.length}, {l:'읽지 않음', c: NOTIFS.filter(n=>!n.read).length}].map((t, i) => (
          <button key={i} onClick={() => setTab(i)}
            className={`relative h-11 px-3.5 text-[14px] flex items-center gap-1.5 ${tab === i ? 'text-[#111] font-semibold' : 'text-[#9CA3AF]'}`}>
            {t.l}<span className="text-[12px] text-[#9CA3AF]">{t.c}</span>
            {tab === i && <span className="absolute left-3 right-3 bottom-0 h-[2px] bg-[#111]"/>}
          </button>
        ))}
      </div>
      <ul>
        {list.map((n, i) => (
          <li key={i} className={`relative px-4 py-3.5 border-b border-[#F0F0F0] flex gap-3 ${n.read ? '' : 'bg-[#F9FAFB]'}`}>
            <div className="shrink-0 mt-1 w-1.5 h-1.5 rounded-full" style={{ background: n.read ? 'transparent' : '#000080' }}/>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[11px] text-[#9CA3AF]">{KIND_LABEL[n.kind]}</span>
                <span className="text-[11px] text-[#9CA3AF]">·</span>
                <span className="text-[11px] text-[#9CA3AF]">{n.ago}</span>
              </div>
              <div className="text-[14px] text-[#111] tracking-[-0.2px] leading-tight">{n.title}</div>
              <div className="text-[12.5px] text-[#6B7280] mt-1 leading-snug truncate">{n.body}</div>
            </div>
          </li>
        ))}
      </ul>
    </Screen>
  );
}

// ─── Profile (개선판) ─────────────────────────────────────
function ProfilePage() {
  const [findable, setFindable] = React.useState(true);
  const [scope, setScope] = React.useState('dept');
  return (
    <Screen
      appBar={<AppBar title="나" trailing={<button className="p-2">{Ic.more(20)}</button>} divider={false}/>}
      bottomTab={<BottomTab active="me"/>}
      scrollClass="bg-[#FAF8F4]">

      {/* Hero */}
      <div className="bg-white px-5 pt-4 pb-5 border-b border-[#F0F0F0]">
        <div className="flex items-center gap-3.5">
          <Avatar name="민" size={56}/>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[17px] font-semibold text-[#111] tracking-[-0.3px]">민서연</span>
              <span className="inline-flex items-center justify-center w-[22px] h-[22px] rounded border border-[#3461C7] text-[#3461C7] text-[10px] font-bold">A0</span>
            </div>
            <div className="text-[12.5px] text-[#6B7280] mt-0.5">아주대학교 · 소프트웨어학과 · 22학번</div>
          </div>
          <button className="text-[12.5px] text-[#000080] px-2 py-1.5">편집</button>
        </div>

        {/* Activity stats */}
        <div className="grid grid-cols-3 mt-5 pt-4 border-t border-[#F0F0F0]">
          {[{n: 18, l: '작성'}, {n: 124, l: '댓글'}, {n: 326, l: '받은 추천'}].map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-[20px] font-semibold text-[#111] tracking-[-0.3px] font-mono">{s.n}</div>
              <div className="text-[11.5px] text-[#9CA3AF] mt-0.5">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Manner card */}
      <div className="mt-3 mx-4 p-4 bg-white rounded-xl border border-[#F0F0F0]">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11.5px] text-[#9CA3AF]">매너 학점</span>
          <span className="text-[11.5px] text-[#9CA3AF]">82 / 100</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-[28px] font-bold tracking-[-0.6px] font-mono text-[#3461C7]">A0</span>
          <span className="text-[12.5px] text-[#374151]">우수 · 다음 등급 +13점</span>
        </div>
        <div className="mt-2 h-[6px] rounded-full bg-[#F3F4F6] overflow-hidden">
          <div className="h-full bg-[#3461C7]" style={{ width: '68%' }}/>
        </div>
      </div>

      {/* Privacy toggle */}
      <div className="mt-3 mx-4 bg-white rounded-xl border border-[#E5E7EB] divide-y divide-[#E5E7EB]">
        <div className="px-4 py-3.5">
          <div className="flex items-center justify-between mb-1">
            <div className="text-[14px] text-[#111] font-medium">친구 검색 허용</div>
            <button onClick={() => setFindable(v => !v)}
              className={`shrink-0 w-[44px] h-[26px] rounded-full relative transition ${findable ? 'bg-[#000080]' : 'bg-[#D1D5DB]'}`}>
              <span className={`absolute top-[3px] w-[20px] h-[20px] rounded-full bg-white shadow transition ${findable ? 'left-[21px]' : 'left-[3px]'}`}/>
            </button>
          </div>
          <div className="text-[11.5px] text-[#6B7280]">학번·이름으로 다른 학생이 나를 찾을 수 있어요</div>
          {findable && (
            <div className="mt-3 pt-3 border-t border-[#F0F0F0] space-y-2">
              <div className="text-[11.5px] text-[#9CA3AF] mb-1">공개 범위</div>
              {[
                { id: 'dept',    l: '같은 학과만',    sub: '소프트웨어학과 22 학생에게만 노출' },
                { id: 'friends', l: '친구의 친구만',  sub: '내 친구와 1촌인 학생까지 노출' },
                { id: 'all',     l: '전체 공개',     sub: '같은 학교의 모든 학생에게 노출' },
              ].map(o => {
                const on = scope === o.id;
                return (
                  <button key={o.id} onClick={() => setScope(o.id)}
                    className={`w-full flex items-start gap-2.5 p-2.5 rounded-lg border text-left transition ${on ? 'border-[#000080] bg-[#F4F4FB]' : 'border-[#E5E7EB] bg-white'}`}>
                    <span className={`mt-0.5 w-4 h-4 rounded-full border-[2px] shrink-0 flex items-center justify-center ${on ? 'border-[#000080]' : 'border-[#C9CDD3]'}`}>
                      {on && <span className="w-1.5 h-1.5 rounded-full bg-[#000080]"/>}
                    </span>
                    <div className="min-w-0">
                      <div className="text-[13.5px] text-[#111] font-medium">{o.l}</div>
                      <div className="text-[11.5px] text-[#6B7280] mt-0.5">{o.sub}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <div className="px-4 py-3.5 flex items-center justify-between">
          <div className="text-[14px] text-[#111]">알림 수신</div>
          <span className="text-[12.5px] text-[#6B7280]">전체</span>
        </div>
      </div>

      {/* Menu sections */}
      <div className="mt-3 mx-4 bg-white rounded-xl border border-[#F0F0F0] divide-y divide-[#F0F0F0]">
        {[
          { l: '내 활동', sub: '내가 쓴 글, 댓글' },
          { l: '스크랩', sub: '47개' },
          { l: '내가 쓴 강의평', sub: '6개' },
          { l: '배심원 기록', sub: '참여 9건' },
        ].map((m, i) => (
          <button key={i} className="w-full px-4 py-3.5 flex items-center justify-between active:bg-[#F9FAFB]">
            <div className="text-left">
              <div className="text-[14px] text-[#111]">{m.l}</div>
              <div className="text-[11.5px] text-[#9CA3AF] mt-0.5">{m.sub}</div>
            </div>
            <span className="text-[#C9CDD3]">{Ic.chev(16)}</span>
          </button>
        ))}
      </div>

      <div className="mt-3 mx-4 bg-white rounded-xl border border-[#F0F0F0] divide-y divide-[#F0F0F0]">
        <button className="w-full px-4 py-3.5 flex items-center justify-between">
          <div className="text-[14px] text-[#111]">설정</div>
          <span className="text-[#C9CDD3]">{Ic.chev(16)}</span>
        </button>
        <button className="w-full px-4 py-3.5 flex items-center justify-between">
          <div className="text-[14px] text-[#9CA3AF]">로그아웃</div>
        </button>
      </div>

      <div className="px-4 py-6 text-[11px] text-[#C9CDD3] text-center">UNIT v0.4.2 · 2026</div>
    </Screen>
  );
}

Object.assign(window, { NotificationsPage, ProfilePage });
