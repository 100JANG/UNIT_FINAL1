// courses.jsx — 강의 목록 / 상세 / 3초 리뷰

const COURSES = [
  { id: 1, name: '데이터분석개론', prof: '김지연', dept: '소프트웨어학과', credit: 3,
    rec: 78, n: 412, partic: 73, trust: true },
  { id: 2, name: '경영학원론', prof: '박상우', dept: '경영학과', credit: 3,
    rec: 64, n: 286, partic: 81, trust: true },
  { id: 3, name: '미시경제학', prof: '이태형', dept: '경제학과', credit: 3,
    rec: 41, n: 198, partic: 58, trust: false },
  { id: 4, name: '한국근현대사', prof: '정민서', dept: '사학과', credit: 2,
    rec: 89, n: 524, partic: 76, trust: true },
  { id: 5, name: '선형대수', prof: '윤재훈', dept: '수학과', credit: 3,
    rec: 52, n: 167, partic: 49, trust: false },
];

function CoursesPage() {
  const [voted, setVoted] = React.useState({});
  const vote = (id, v) => setVoted(prev => ({ ...prev, [id]: prev[id] === v ? null : v }));
  return (
    <Screen
      appBar={<AppBar title="강의평" trailing={<button className="p-2">{Ic.search(20)}</button>} divider={false}/>}
      bottomTab={<BottomTab active="book"/>}>
      {/* Search */}
      <div className="px-4 pt-1 pb-3 bg-white">
        <div className="flex items-center gap-2 h-10 px-3.5 rounded-lg bg-[#F3F4F6] text-[#9CA3AF]">
          {Ic.search(18)}
          <span className="text-[13.5px]">강의명, 교수명으로 검색</span>
        </div>
      </div>
      {/* Filters */}
      <div className="px-4 pb-2 flex items-center gap-1.5 overflow-x-auto">
        {['2025-1학기', '아주대학교', '전체 학과', '추천순'].map((f, i) => (
          <button key={f} className="shrink-0 h-7 px-2.5 rounded-full border border-[#E5E7EB] text-[12px] text-[#374151] flex items-center gap-1">
            {f}{Ic.chevDn(11)}
          </button>
        ))}
      </div>
      <Hairline/>

      <ul>
        {COURSES.map((c, i) => {
          const v = voted[c.id];
          return (
          <li key={c.id}>
            <div className="px-4 py-3.5 active:bg-[#F9FAFB]">
              <button className="w-full text-left">
                <div className="flex items-baseline gap-2 mb-1">
                  <h3 className="text-[15.5px] font-semibold text-[#111] tracking-[-0.3px]">{c.name}</h3>
                  <span className="text-[12.5px] text-[#6B7280]">{c.prof}</span>
                  {c.trust && <Pill tone="mint" className="ml-auto">신뢰</Pill>}
                </div>
                <div className="text-[12px] text-[#9CA3AF] mb-2.5">{c.dept} · {c.credit}학점</div>
                <div className="flex items-center gap-3 text-[12px] text-[#6B7280]">
                  <span><span className="text-[#000080] font-semibold">{c.rec}%</span> 추천</span>
                  <span className="text-[#E5E7EB]">·</span>
                  <span>응답 {c.n}</span>
                  <span className="text-[#E5E7EB]">·</span>
                  <span>참여율 {c.partic}%</span>
                </div>
                <div className="mt-2 h-[3px] rounded-full bg-[#F3F4F6] overflow-hidden">
                  <div className="h-full bg-[#000080]" style={{ width: `${c.rec}%` }}/>
                </div>
              </button>
              {/* Quick vote */}
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button onClick={() => vote(c.id, 'rec')}
                  className={`h-9 rounded-md text-[12.5px] font-medium flex items-center justify-center gap-1.5 transition border
                    ${v === 'rec' ? 'bg-[#000080] text-white border-[#000080]' : 'bg-white text-[#374151] border-[#E5E7EB] active:bg-[#F9FAFB]'}`}>
                  {Ic.thumb(14)} 추천
                </button>
                <button onClick={() => vote(c.id, 'no')}
                  className={`h-9 rounded-md text-[12.5px] font-medium flex items-center justify-center gap-1.5 transition border
                    ${v === 'no' ? 'bg-[#B73E37] text-white border-[#B73E37]' : 'bg-white text-[#374151] border-[#E5E7EB] active:bg-[#F9FAFB]'}`}>
                  <span style={{ transform: 'rotate(180deg)', display: 'inline-flex' }}>{Ic.thumb(14)}</span> 비추천
                </button>
              </div>
              {v && <div className="mt-2 text-[11.5px] text-[#1F7A5C] flex items-center gap-1">{Ic.check(13)} 의견을 등록했어요. 한줄평은 강의 상세에서 추가할 수 있어요.</div>}
            </div>
            {i < COURSES.length - 1 && <Hairline className="mx-4"/>}
          </li>
        )})}
      </ul>
    </Screen>
  );
}

// ─── Course detail ────────────────────────────────────────
const REVIEWS = [
  { vote: 'rec', body: '실무 위주 과제가 많아서 처음엔 부담이지만, 끝나고 나면 포트폴리오에 그대로 넣을 수 있어요. 시험은 오픈북.', nick: '카페인러버', sem: '24-2', up: 23 },
  { vote: 'rec', body: '교수님이 질문에 진지하게 답해주시는 게 좋았어요. 다만 팀플 비중이 50%라 멤버 운이 학점 좌우합니다.', nick: '데이터덕후', sem: '24-1', up: 18 },
  { vote: 'no',  body: '과제량이 진짜 많습니다. 다른 전공 듣는 학기에 같이 들으면 후회해요.', nick: '졸린토끼', sem: '23-2', up: 12 },
  { vote: 'rec', body: '발표 두 번이 좀 부담이지만 그만큼 얻어가는 거 많음.', nick: '바닐라라떼', sem: '23-2', up: 7 },
];

function CourseDetailPage({ onBack, onWriteReview }) {
  const [tab, setTab] = React.useState('rec');
  const c = COURSES[0];
  const filtered = REVIEWS.filter(r => tab === 'rec' ? r.vote === 'rec' : tab === 'no' ? r.vote === 'no' : true);

  return (
    <div className="h-full flex flex-col bg-white">
      <AppBar
        leading={<>
          <button className="p-1 -ml-1" onClick={onBack}>{Ic.back(22)}</button>
          <span className="text-[15px] font-medium text-[#111] ml-1 truncate">{c.name}</span>
        </>}
        trailing={<button className="p-2">{Ic.bookmark(20)}</button>}
      />
      <div className="flex-1 min-h-0 overflow-y-auto scroll">
        {/* Header */}
        <div className="px-4 pt-4 pb-3">
          <h1 className="text-[20px] font-semibold tracking-[-0.4px] text-[#111] leading-tight">{c.name}</h1>
          <div className="text-[13px] text-[#6B7280] mt-1">{c.prof} · {c.dept} · {c.credit}학점</div>
        </div>

        {/* Stats */}
        <div className="mx-4 mb-2 px-4 py-4 border border-[#F0F0F0] rounded-xl">
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-[28px] font-bold text-[#000080] tracking-[-0.5px]">{c.rec}%</span>
            <span className="text-[13px] text-[#6B7280]">추천</span>
            <span className="ml-auto text-[12px] text-[#9CA3AF]">응답 {c.n}명</span>
          </div>
          <div className="h-[6px] rounded-full bg-[#F3F4F6] overflow-hidden flex">
            <div className="h-full bg-[#000080]" style={{ width: `${c.rec}%` }}/>
            <div className="h-full bg-[#E5E7EB]" style={{ width: `${100 - c.rec}%` }}/>
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#F0F0F0]">
            <div className="flex items-center gap-1.5">
              {Ic.shield(15)}
              <span className="text-[12.5px] text-[#374151]">참여율 <b className="font-semibold text-[#000080]">{c.partic}%</b></span>
            </div>
            <Pill tone="cobalt">70% 이상이라 신뢰할 수 있어요</Pill>
          </div>
        </div>

        {/* Review tabs */}
        <div className="flex items-center gap-1 px-4 pt-3 pb-2 sticky top-0 bg-white z-10 border-b border-[#F0F0F0]">
          {[{id:'rec',l:`추천 ${REVIEWS.filter(r=>r.vote==='rec').length}`},{id:'no',l:`비추천 ${REVIEWS.filter(r=>r.vote==='no').length}`},{id:'all',l:'의견'}].map(t => (

            <button key={t.id} onClick={() => setTab(t.id)}
              className={`h-8 px-3 rounded-full text-[12.5px] ${tab === t.id ? 'bg-[#000080] text-white font-semibold' : 'bg-[#F3F4F6] text-[#6B7280]'}`}>
              {t.l}
            </button>
          ))}
        </div>

        <ul className="pb-3">
          {filtered.map((r, i) => (
            <li key={i} className="px-4 py-3.5 border-b border-[#F0F0F0]">
              <div className="flex items-center gap-2 mb-1.5">
                <Pill tone={r.vote === 'rec' ? 'navy' : 'warn'}>{r.vote === 'rec' ? '추천' : '비추천'}</Pill>
                <span className="text-[11.5px] text-[#9CA3AF]">{r.sem}학기 · {r.nick}</span>
                <span className="ml-auto text-[11.5px] text-[#9CA3AF] flex items-center gap-1">{Ic.thumb(11)}{r.up}</span>
              </div>
              <p className="text-[13.5px] leading-[1.6] text-[#374151] tracking-[-0.2px]">{r.body}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* Write review CTA */}
      <div className="px-4 pt-3 pb-6 border-t border-[#F0F0F0]">
        <button onClick={onWriteReview}
          className="w-full h-12 rounded-lg bg-[#000080] text-white text-[14.5px] font-semibold">
          평가하기
        </button>
      </div>
    </div>
  );
}

// ─── 3초 강의평 작성 ───────────────────────────────────────
function CourseReviewPage({ onClose }) {
  const [vote, setVote] = React.useState(null);
  const [body, setBody] = React.useState('');
  const c = COURSES[0];

  return (
    <div className="h-full flex flex-col bg-white">
      <AppBar
        leading={<button className="p-1 -ml-1" onClick={onClose}>{Ic.x(22)}</button>}
        trailing={<button className="px-3 py-1.5 text-[13px] text-[#9CA3AF]">건너뛰기</button>}
      />
      <div className="flex-1 px-5 pt-4 flex flex-col">
        <h1 className="text-[20px] font-semibold tracking-[-0.4px] text-[#111] leading-tight">{c.name}</h1>
        <div className="text-[13px] text-[#6B7280] mt-1">{c.prof} · {c.dept}</div>
        <p className="text-[12.5px] text-[#9CA3AF] mt-3">한 줄 평가 후 다른 강의평을 볼 수 있어요</p>

        {/* Vote big buttons */}
        <div className="grid grid-cols-2 gap-2.5 mt-5">
          <button onClick={() => setVote('rec')}
            className={`h-[88px] rounded-xl flex flex-col items-center justify-center gap-1.5 transition
              ${vote === 'rec' ? 'bg-[#000080] text-white' : 'bg-[#F3F4F6] text-[#6B7280]'}`}>
            {Ic.thumb(22)}
            <span className="text-[14px] font-semibold">추천</span>
          </button>
          <button onClick={() => setVote('no')}
            className={`h-[88px] rounded-xl flex flex-col items-center justify-center gap-1.5 transition
              ${vote === 'no' ? 'bg-[#000080] text-white' : 'bg-[#F3F4F6] text-[#6B7280]'}`}>
            <div style={{ transform: 'rotate(180deg)' }}>{Ic.thumb(22)}</div>
            <span className="text-[14px] font-semibold">비추천</span>
          </button>
        </div>

        {/* Optional text */}
        <div className="mt-5">
          <div className="text-[12.5px] text-[#9CA3AF] mb-2">한 줄로 남기고 싶은 말 (선택)</div>
          <textarea
            rows={5} value={body} onChange={e => setBody(e.target.value)}
            placeholder="다음 학기에 들을 학생에게 도움이 되는 한마디"
            className="w-full p-3.5 rounded-lg bg-[#F8F9FA] text-[13.5px] leading-[1.55] outline-none resize-none placeholder:text-[#C9CDD3]"/>
        </div>
      </div>
      <div className="px-5 pb-5">
        <button disabled={!vote}
          className={`w-full h-12 rounded-lg text-[15px] font-semibold ${vote ? 'bg-[#000080] text-white' : 'bg-[#F3F4F6] text-[#9CA3AF]'}`}>
          등록
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { CoursesPage, CourseDetailPage, CourseReviewPage });
