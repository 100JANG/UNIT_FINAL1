// chat.jsx — 채팅 리스트 + 대화방 (mock websocket)

const CHATS = [
  { id: 1, name: '소프트웨어학과 22 단톡', sub: '민수: 내일 발표 자료 공유함', time: '오후 9:42', unread: 4, group: true, members: 38 },
  { id: 2, name: '김민수', sub: '나도 그 강의 들었어ㅋㅋ', time: '오후 7:18', unread: 1 },
  { id: 3, name: '데이터분석개론 팀플', sub: '서윤: 자료 정리 다 됐어요', time: '오후 4:02', unread: 0, group: true, members: 4 },
  { id: 4, name: '이서윤', sub: '내일 열람실 같이 갈래요?', time: '어제', unread: 0 },
  { id: 5, name: '중고장터 · 박지호', sub: '맥북 직거래 가능하신가요?', time: '어제', unread: 2 },
  { id: 6, name: '경영학원론 스터디', sub: '자료 업로드했습니다', time: '5/10', unread: 0, group: true, members: 6, done: true },
  { id: 7, name: '중고장터 · 이하랜', sub: '매너 칭찬 고마워요!', time: '5/8', unread: 0, done: true },
  { id: 8, name: '자료구조론 팀플', sub: '수고하셨습니다', time: '5/2', unread: 0, group: true, members: 5, done: true },
];

function ChatListPage() {
  const [tab, setTab] = React.useState('on');
  const tabs = [
    { id: 'on',   l: '진행중', list: CHATS.filter(c => !c.done) },
    { id: 'done', l: '대화 완료', list: CHATS.filter(c => c.done) },
  ];
  const cur = tabs.find(t => t.id === tab);
  return (
    <Screen
      appBar={<AppBar title="채팅" trailing={<>
        <button className="p-2">{Ic.search(20)}</button>
        <button className="p-2 text-[#000080]">{Ic.plus(20)}</button>
      </>} divider={false}/>}
      bottomTab={<BottomTab active="chat"/>}>
      <div className="flex items-center px-4 border-b border-[#F0F0F0]">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`relative h-11 px-3.5 text-[14px] flex items-center gap-1.5 ${tab===t.id ? 'text-[#111] font-semibold' : 'text-[#9CA3AF]'}`}>
            {t.l}<span className="text-[12px] text-[#9CA3AF]">{t.list.length}</span>
            {tab===t.id && <span className="absolute left-3 right-3 bottom-0 h-[2px] bg-[#111]"/>}
          </button>
        ))}
      </div>
      <ul>
        {cur.list.map((c) => (
          <li key={c.id} className={`px-4 py-3 flex items-center gap-3 border-b border-[#F0F0F0] active:bg-[#F9FAFB] ${c.done ? 'opacity-70' : ''}`}>
            <div className="relative">
              <Avatar name={c.name} size={46} hue={c.group ? '#E8E8F2' : '#FAF8F4'}/>
              {c.group && (
                <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-[#000080] text-white text-[9px] font-semibold flex items-center justify-center border-2 border-white">
                  {c.members}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[14.5px] font-semibold text-[#111] tracking-[-0.2px] truncate">{c.name}</span>
                <span className="ml-auto text-[11px] text-[#9CA3AF] shrink-0">{c.time}</span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[12.5px] text-[#6B7280] truncate">{c.sub}</span>
                {c.unread > 0 && (
                  <span className="ml-auto shrink-0 h-[18px] min-w-[18px] px-1.5 rounded-full bg-[#B73E37] text-white text-[10.5px] font-semibold flex items-center justify-center">
                    {c.unread}
                  </span>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </Screen>
  );
}

// ─── Chat room (mock websocket) ───────────────────────────
function ChatRoomPage({ onBack }) {
  const [msgs, setMsgs] = React.useState([
    { from: 'them', name: '서윤', body: '발표 자료 정리 다 됐어요!', t: '오후 4:01' },
    { from: 'them', name: '서윤', body: '근데 결론 부분에 그래프 하나 더 들어가야 할 것 같아', t: '오후 4:01' },
    { from: 'me',   body: '오 좋아요. 어떤 그래프?', t: '오후 4:03' },
    { from: 'them', name: '민수', body: '참여율 70% 이상 강의 vs 미만 강의 비교', t: '오후 4:04' },
    { from: 'me',   body: '그럼 제가 데이터 뽑아서 차트 만들게요. 30분 정도 걸릴 듯', t: '오후 4:05' },
    { from: 'sys',  body: '지호님이 들어왔어요', t: '오후 4:06' },
  ]);
  const [draft, setDraft] = React.useState('');
  const [typing, setTyping] = React.useState(false);
  const scrollRef = React.useRef(null);

  // mock socket: incoming after a delay
  React.useEffect(() => {
    const id1 = setTimeout(() => {
      setTyping(true);
      const id2 = setTimeout(() => {
        setTyping(false);
        setMsgs(m => [...m, { from: 'them', name: '지호', body: '저도 그래프 만드는 거 도와드릴게요', t: '오후 4:07' }]);
      }, 1800);
      return () => clearTimeout(id2);
    }, 2400);
    return () => clearTimeout(id1);
  }, []);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: 99999, behavior: 'smooth' });
  }, [msgs, typing]);

  const send = () => {
    if (!draft.trim()) return;
    setMsgs(m => [...m, { from: 'me', body: draft, t: '오후 4:08' }]);
    setDraft('');
  };

  return (
    <div className="h-full flex flex-col bg-[#FAF8F4]">
      <div className="bg-white">
        <AppBar
          leading={<>
            <button className="p-1 -ml-1" onClick={onBack}>{Ic.back(22)}</button>
            <div className="ml-2 flex flex-col items-start leading-tight">
              <span className="text-[14.5px] font-semibold text-[#111]">데이터분석개론 팀플</span>
              <span className="text-[11px] text-[#9CA3AF]">참여 4명 · 활성</span>
            </div>
          </>}
          trailing={<>
            <button className="p-2">{Ic.bell(20)}</button>
            <button className="p-2">{Ic.more(20)}</button>
          </>}
        />
      </div>

      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto scroll px-3 py-3 space-y-2">
        <div className="text-center text-[10.5px] text-[#9CA3AF] py-1">2025년 5월 12일 화요일</div>
        {msgs.map((m, i) => {
          if (m.from === 'sys') {
            return <div key={i} className="text-center text-[11px] text-[#9CA3AF] py-1">{m.body}</div>;
          }
          if (m.from === 'me') {
            return (
              <div key={i} className="flex items-end justify-end gap-1.5">
                <span className="text-[10px] text-[#9CA3AF] mb-0.5">{m.t}</span>
                <div className="max-w-[78%] bg-[#000080] text-white rounded-2xl rounded-br-sm px-3 py-2 text-[13.5px] leading-snug">
                  {m.body}
                </div>
              </div>
            );
          }
          const showName = i === 0 || msgs[i-1].from !== 'them' || msgs[i-1].name !== m.name;
          return (
            <div key={i} className="flex items-end gap-1.5">
              <div className="w-7 shrink-0">
                {showName && <Avatar name={m.name} size={28}/>}
              </div>
              <div className="max-w-[78%]">
                {showName && <div className="text-[11px] text-[#6B7280] mb-0.5 ml-1">{m.name}</div>}
                <div className="flex items-end gap-1.5">
                  <div className="bg-white border border-[#F0F0F0] rounded-2xl rounded-bl-sm px-3 py-2 text-[13.5px] leading-snug text-[#111]">
                    {m.body}
                  </div>
                  <span className="text-[10px] text-[#9CA3AF] mb-0.5">{m.t}</span>
                </div>
              </div>
            </div>
          );
        })}
        {typing && (
          <div className="flex items-end gap-1.5">
            <div className="w-7"/>
            <div className="bg-white border border-[#F0F0F0] rounded-2xl px-3 py-2.5 flex gap-1">
              {[0,1,2].map(i => (
                <span key={i} className="w-1.5 h-1.5 rounded-full bg-[#9CA3AF]" style={{ animation: `count-bounce 800ms ${i*150}ms infinite alternate` }}/>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="px-2 pt-2.5 pb-8 border-t border-[#F0F0F0] bg-white flex items-end gap-2">
        <button className="w-9 h-9 shrink-0 rounded-full bg-[#F3F4F6] text-[#6B7280] flex items-center justify-center">{Ic.plus(18)}</button>
        <input value={draft} onChange={e => setDraft(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="메시지 입력"
          className="flex-1 h-9 px-3 rounded-full bg-[#F3F4F6] text-[13.5px] outline-none placeholder:text-[#9CA3AF]"/>
        <button onClick={send} className="w-9 h-9 shrink-0 rounded-full bg-[#000080] text-white flex items-center justify-center disabled:opacity-40" disabled={!draft.trim()}>
          {Ic.send(16)}
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { ChatListPage, ChatRoomPage });
