// campus.jsx — Campus hub + service pages

function CampusHub({ onOpen }) {
  const services = [
    { id: 'timetable', l: '시간표', icon: Ic.cal },
    { id: 'course',    l: '강의평', icon: (s = 22) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="m12 3 2.7 5.5 6 .9-4.4 4.3 1 6.1L12 17l-5.4 2.8 1-6.1L3.3 9.4l6-.9L12 3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg> },
    { id: 'meal',      l: '식단표', icon: Ic.fork },
    { id: 'bus',       l: '셔틀버스', icon: Ic.bus },
    { id: 'library',   l: '열람실', icon: Ic.chair },
    { id: 'contacts',  l: '교내 연락처', icon: Ic.phone },
    { id: 'contest',   l: '공모전', icon: Ic.trophy },
    { id: 'jobs',      l: '알바',   icon: Ic.briefcase },
    { id: 'market',    l: '중고장터', icon: Ic.tag },
    { id: 'friends',   l: '친구찾기', icon: Ic.friend },
  ];
  return (
    <Screen
      appBar={<AppBar title="캠퍼스" trailing={<button className="p-2">{Ic.search(20)}</button>} divider={false}/>}
      bottomTab={<BottomTab active="campus" onTap={onOpen}/>}
      scrollClass="bg-[#FAF8F4]">

      <div className="mx-4 mt-2 mb-3 p-4 rounded-xl bg-white border border-[#F0F0F0]">
        <div className="text-[11.5px] text-[#9CA3AF] mb-1">오늘 · 5월 12일 화요일</div>
        <div className="text-[15px] font-semibold text-[#111] tracking-[-0.3px]">다음 수업까지 1시간 · 데이터분석개론</div>
        <div className="text-[12px] text-[#6B7280] mt-0.5">하이테크관 502호 · 13:00</div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="px-2.5 py-2 rounded-md bg-[#FAF8F4] text-center">
            <div className="text-[10.5px] text-[#9CA3AF]">중도 4층</div>
            <div className="text-[14px] font-semibold text-[#1F7A5C] mt-0.5">잔여 38석</div>
          </div>
          <div className="px-2.5 py-2 rounded-md bg-[#FAF8F4] text-center">
            <div className="text-[10.5px] text-[#9CA3AF]">셔틀</div>
            <div className="text-[14px] font-semibold text-[#000080] mt-0.5">3분 후</div>
          </div>
          <div className="px-2.5 py-2 rounded-md bg-[#FAF8F4] text-center">
            <div className="text-[10.5px] text-[#9CA3AF]">학식 점심</div>
            <div className="text-[14px] font-semibold text-[#6B4F2E] mt-0.5">제육덮밥</div>
          </div>
        </div>
      </div>

      <div className="bg-white mx-4 rounded-xl border border-[#F0F0F0] p-2 grid grid-cols-4 mb-5">
        {services.map(s => (
          <button key={s.id} onClick={() => onOpen?.(s.id)}
            className="flex flex-col items-center gap-1.5 py-3 px-1 active:bg-[#F9FAFB] rounded-lg">
            <div className="w-10 h-10 rounded-full bg-[#F3F4F6] flex items-center justify-center text-[#000080]">
              {s.icon(20)}
            </div>
            <span className="text-[11.5px] text-[#111] tracking-[-0.2px]">{s.l}</span>
          </button>
        ))}
      </div>
    </Screen>
  );
}

// ─── 시간표 (각진 블럭) ─────────────────────────────────
function TimetablePage({ onBack }) {
  const days = ['월','화','수','목','금'];
  const times = ['9','10','11','12','13','14','15','16','17'];
  const blocks = [
    { d: 0, s: 9,  e: 11, name: '데이터분석개론', room: '하이텍 502', color: '#000080' },
    { d: 1, s: 13, e: 15, name: '데이터분석개론', room: '하이텍 502', color: '#000080' },
    { d: 1, s: 10, e: 12, name: '경영학원론',     room: '인경 305',   color: '#6B4F2E' },
    { d: 2, s: 14, e: 16, name: '한국근현대사',   room: '문과대 401', color: '#1F7A5C' },
    { d: 3, s: 9,  e: 11, name: '데이터분석개론', room: '하이텍 502', color: '#000080' },
    { d: 3, s: 13, e: 14, name: '체육 (배드민턴)',room: '체육관',     color: '#B73E37' },
    { d: 4, s: 10, e: 12, name: '선형대수',      room: '자연대 207', color: '#B5882B' },
  ];
  const ROW = 50;
  return (
    <div className="h-full flex flex-col bg-white">
      <AppBar leading={<>
        <button className="p-1 -ml-1" onClick={onBack}>{Ic.back(22)}</button>
        <span className="text-[15px] font-semibold text-[#111] ml-1">시간표</span>
      </>} trailing={<>
        <button className="text-[12.5px] text-[#6B7280] px-2">2025-1</button>
        <button className="p-2">{Ic.more(20)}</button>
      </>}/>
      <div className="flex-1 min-h-0 overflow-y-auto scroll">
        <div className="flex border-b border-[#E5E7EB] bg-white sticky top-0 z-10">
          <div className="w-9 shrink-0"/>
          {days.map(d => (
            <div key={d} className="flex-1 py-2 text-center text-[12px] font-medium text-[#6B7280]">{d}</div>
          ))}
        </div>
        <div className="relative">
          {times.map((t) => (
            <div key={t} className="flex" style={{ height: ROW }}>
              <div className="w-9 shrink-0 text-[10.5px] text-[#9CA3AF] pt-1 text-right pr-1.5">{t}</div>
              {days.map((d, di) => (
                <div key={di} className="flex-1 border-l border-t border-[#F0F0F0]"/>
              ))}
            </div>
          ))}
          {blocks.map((b, idx) => {
            const dayCols = 5;
            const left = `calc(36px + ((100% - 36px) / ${dayCols}) * ${b.d})`;
            const width = `calc((100% - 36px) / ${dayCols})`;
            const top = (b.s - 9) * ROW;
            const height = (b.e - b.s) * ROW;
            return (
              <div key={idx} className="absolute p-2 text-white text-[11px] leading-tight"
                style={{ left, width, top, height, background: b.color, borderTop: '1px solid rgba(255,255,255,0.15)', borderLeft: '1px solid rgba(255,255,255,0.15)' }}>
                <div className="font-semibold">{b.name}</div>
                <div className="opacity-80 text-[10.5px] mt-0.5">{b.room}</div>
              </div>
            );
          })}
        </div>
        <div className="px-4 py-4 text-[12px] text-[#9CA3AF]">공강: 월 13~17 · 수 9~14 · 금 13~17</div>
      </div>
    </div>
  );
}

// ─── 식단표 (Notion board view) ───────────────────────────
function MealPage({ onBack }) {
  const cards = [
    { time: '조식', range: '7:30~9:00', cafe: '학생회관', items: ['토스트 세트', '계란프라이', '시리얼', '우유'], price: 3000, accent: '#B5882B' },
    { time: '중식', range: '11:30~14:00', cafe: '학생회관', items: ['제육덮밥', '미소된장국', '단무지', '깍두기'], price: 5500, accent: '#B73E37', hot: true },
    { time: '중식', range: '11:30~14:00', cafe: '교직원식당', items: ['치킨까스 정식', '카레라이스', '치킨샐러드'], price: 6500, accent: '#000080' },
    { time: '석식', range: '17:00~19:00', cafe: '학생회관', items: ['김치찌개', '감자조림', '계란말이', '김'], price: 5500, accent: '#1F7A5C' },
  ];
  return (
    <div className="h-full flex flex-col bg-white">
      <AppBar leading={<>
        <button className="p-1 -ml-1" onClick={onBack}>{Ic.back(22)}</button>
        <span className="text-[15px] font-semibold text-[#111] ml-1">식단표</span>
      </>} trailing={<button className="text-[12.5px] text-[#000080] px-2 font-medium">5/12 (화)</button>}/>
      <div className="flex-1 min-h-0 overflow-y-auto scroll bg-[#FAF8F4]">
        <div className="flex items-center gap-1.5 px-4 py-3 overflow-x-auto bg-white border-b border-[#F0F0F0]">
          {['전체','학생회관','교직원식당','기숙사'].map((c,i)=>(
            <button key={c} className={`shrink-0 h-8 px-3 rounded-full text-[12.5px] ${i===0?'bg-[#000080] text-white font-semibold':'bg-[#F3F4F6] text-[#6B7280]'}`}>{c}</button>
          ))}
        </div>
        <div className="p-3 grid grid-cols-2 gap-3">
          {cards.map((m, i) => (
            <div key={i} className="bg-white rounded-xl border border-[#F0F0F0] overflow-hidden flex flex-col">
              <div style={{ background: m.accent }} className="h-[3px]"/>
              <div className="p-3 flex flex-col gap-1.5 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-semibold text-[#111]">{m.time}</span>
                  {m.hot && <Pill tone="warn">인기</Pill>}
                </div>
                <div className="text-[10.5px] text-[#9CA3AF]">{m.range}</div>
                <div className="text-[11.5px] text-[#374151]">{m.cafe}</div>
                <ul className="mt-1 space-y-0.5">
                  {m.items.map(it => (
                    <li key={it} className="text-[12.5px] text-[#374151] leading-snug">· {it}</li>
                  ))}
                </ul>
                <div className="mt-auto pt-2 text-[12.5px] font-semibold text-[#111] border-t border-[#F0F0F0]">{m.price.toLocaleString()}원</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── 셔틀버스 ─────────────────────────────────────────────
function BusPage({ onBack }) {
  const routes = [
    { name: '캠퍼스 ↔ 인천역', next: '3분', after: '23분', live: 'ETA 09:48', n: '101' },
    { name: '캠퍼스 ↔ 송도', next: '12분', after: '32분', live: 'ETA 09:57', n: '202' },
    { name: '캠퍼스 ↔ 부평역', next: '운행종료', after: '내일 07:30', live: '운행 종료', n: '303' },
    { name: '교내 순환', next: '5분', after: '15분', live: 'ETA 09:50', n: '순환' },
  ];
  return (
    <div className="h-full flex flex-col bg-white">
      <AppBar leading={<>
        <button className="p-1 -ml-1" onClick={onBack}>{Ic.back(22)}</button>
        <span className="text-[15px] font-semibold text-[#111] ml-1">셔틀버스</span>
      </>} trailing={<button className="p-2">{Ic.bell(20)}</button>}/>
      <div className="flex-1 min-h-0 overflow-y-auto scroll">
        <div className="px-4 pt-3 pb-2">
          <div className="text-[11.5px] text-[#9CA3AF]">현재 위치</div>
          <div className="text-[14px] font-medium text-[#111]">인하대학교 정문 · 09:45</div>
        </div>
        <ul className="divide-y divide-[#F0F0F0]">
          {routes.map((r, i) => (
            <li key={i} className="px-4 py-4">
              <div className="flex items-center gap-2 mb-1.5">
                <Pill tone="navySolid">{r.n}</Pill>
                <span className="text-[14.5px] font-semibold text-[#111] tracking-[-0.2px]">{r.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="text-[11.5px] text-[#9CA3AF]">다음 도착</div>
                  <div className="text-[20px] font-semibold text-[#000080] tracking-[-0.5px] mt-0.5">{r.next}</div>
                </div>
                <div className="flex-1">
                  <div className="text-[11.5px] text-[#9CA3AF]">그 다음</div>
                  <div className="text-[14px] text-[#374151] mt-1">{r.after}</div>
                </div>
                <div className="flex-1 text-right">
                  <div className="text-[11.5px] text-[#9CA3AF]">실시간</div>
                  <div className="text-[12px] text-[#1F7A5C] mt-1 flex items-center justify-end gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1F7A5C] animate-pulse"/>{r.live}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ─── 열람실 ───────────────────────────────────────────────
function LibraryPage({ onBack }) {
  const halls = [
    { name: '중앙도서관 4층 제1열람실', total: 280, used: 242, st: 'busy' },
    { name: '중앙도서관 4층 제2열람실', total: 180, used: 142, st: 'busy' },
    { name: '중앙도서관 5층 제3열람실', total: 200, used: 88,  st: 'ok' },
    { name: '공대 별관 열람실',         total: 120, used: 31,  st: 'free' },
    { name: '경영대 열람실',            total: 80,  used: 64,  st: 'busy' },
    { name: '기숙사 학습실 A',          total: 60,  used: 18,  st: 'free' },
  ];
  const lit = { busy: '#B73E37', ok: '#B5882B', free: '#1F7A5C' };
  return (
    <div className="h-full flex flex-col bg-white">
      <AppBar leading={<>
        <button className="p-1 -ml-1" onClick={onBack}>{Ic.back(22)}</button>
        <span className="text-[15px] font-semibold text-[#111] ml-1">열람실</span>
      </>} trailing={<button className="p-2 text-[#6B7280] text-[12.5px]">2분 전 갱신</button>}/>
      <div className="flex-1 min-h-0 overflow-y-auto scroll">
        {halls.map((h, i) => {
          const remain = h.total - h.used;
          const pct = (h.used / h.total) * 100;
          return (
            <div key={i} className="px-4 py-3.5 border-b border-[#F0F0F0]">
              <div className="flex items-baseline gap-2 mb-1.5">
                <span className="text-[14.5px] font-semibold text-[#111] tracking-[-0.2px]">{h.name}</span>
                <span className="ml-auto text-[20px] font-semibold tracking-[-0.5px]" style={{ color: lit[h.st] }}>{remain}</span>
                <span className="text-[12px] text-[#9CA3AF]">/ {h.total}석</span>
              </div>
              <div className="h-[6px] rounded-full bg-[#F3F4F6] overflow-hidden">
                <div className="h-full" style={{ width: `${pct}%`, background: lit[h.st] }}/>
              </div>
              <div className="mt-1.5 text-[11.5px] text-[#9CA3AF]">
                {h.st === 'busy' ? '혼잡' : h.st === 'ok' ? '보통' : '여유'} · 잔여 {remain}석
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── 교내 연락처 (좌우 여백 추가) ─────────────────────────
function ContactsPage({ onBack }) {
  const groups = [
    { name: '학사 · 행정', items: [
      { l: '교무처', tel: '032-860-7000' },
      { l: '학생지원처', tel: '032-860-7100' },
      { l: '국제처', tel: '032-860-7250' },
    ]},
    { name: '학과 사무실', items: [
      { l: '소프트웨어학과', tel: '032-860-7390' },
      { l: '경영학과', tel: '032-860-7710' },
      { l: '사학과', tel: '032-860-8030' },
    ]},
    { name: '시설 · 안전', items: [
      { l: '도서관 안내', tel: '032-860-7610' },
      { l: '캠퍼스 보안', tel: '032-860-9112' },
      { l: '보건진료소', tel: '032-860-7800' },
    ]},
  ];
  return (
    <div className="h-full flex flex-col bg-white">
      <AppBar leading={<>
        <button className="p-1 -ml-1" onClick={onBack}>{Ic.back(22)}</button>
        <span className="text-[15px] font-semibold text-[#111] ml-1">교내 연락처</span>
      </>} trailing={<button className="p-2">{Ic.search(20)}</button>}/>
      <div className="flex-1 min-h-0 overflow-y-auto scroll bg-[#FAF8F4]">
        {groups.map((g, i) => (
          <div key={i} className="px-6 pt-5">
            <div className="text-[11.5px] text-[#9CA3AF] uppercase tracking-wide mb-2">{g.name}</div>
            <ul className="bg-white rounded-xl border border-[#F0F0F0] divide-y divide-[#F0F0F0] overflow-hidden">
              {g.items.map((it, j) => (
                <li key={j} className="px-5 py-3.5 flex items-center justify-between">
                  <div>
                    <div className="text-[14px] text-[#111]">{it.l}</div>
                    <div className="text-[12px] text-[#6B7280] mt-0.5">{it.tel}</div>
                  </div>
                  <button className="w-9 h-9 rounded-full bg-[#E2F1EA] text-[#1F7A5C] flex items-center justify-center">
                    {Ic.phone(16)}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div className="h-6"/>
      </div>
    </div>
  );
}

// ─── 공모전 (Notion board view + 추천 탭) ────────────────
function ContestPage({ onBack }) {
  const [tab, setTab] = React.useState('rec');
  const all = [
    { tag: '디자인', host: '한국디자인진흥원', title: '청년 UX 디자인 공모전', deadline: 'D-12', prize: '대상 500만원', n: 1240, fit: 92 },
    { tag: '개발',   host: '삼성SDS',         title: '대학생 SW 알고리즘 챌린지',  deadline: 'D-5',  prize: '대상 300만원', n: 892, fit: 88 },
    { tag: '창업',   host: '인천창조경제센터', title: '인천 대학생 창업 아이디어',  deadline: 'D-21', prize: '시상금 200만원', n: 634, fit: 71 },
    { tag: '학술',   host: '한국정보과학회',   title: '학부 논문 경진대회',        deadline: 'D-32', prize: '학회지 게재', n: 312, fit: 58 },
  ];
  const list = tab === 'rec' ? [...all].sort((a,b)=>b.fit-a.fit) : all;
  const accent = { '디자인': '#000080', '개발': '#1F7A5C', '창업': '#B5882B', '학술': '#6B4F2E' };
  return (
    <div className="h-full flex flex-col bg-white">
      <AppBar leading={<>
        <button className="p-1 -ml-1" onClick={onBack}>{Ic.back(22)}</button>
        <span className="text-[15px] font-semibold text-[#111] ml-1">공모전</span>
      </>} trailing={<button className="p-2">{Ic.search(20)}</button>}/>
      <div className="flex items-center px-4 border-b border-[#F0F0F0]">
        {[{id:'rec',l:'추천'},{id:'all',l:'전체'},{id:'soon',l:'마감임박'}].map(t => (
          <button key={t.id} onClick={()=>setTab(t.id)}
            className={`relative h-11 px-3.5 text-[13.5px] ${tab===t.id ? 'text-[#111] font-semibold' : 'text-[#9CA3AF]'}`}>
            {t.l}
            {tab===t.id && <span className="absolute left-3 right-3 bottom-0 h-[2px] bg-[#111]"/>}
          </button>
        ))}
      </div>
      {tab === 'rec' && (
        <div className="px-4 py-2.5 bg-[#FAF8F4] border-b border-[#F0F0F0] text-[11.5px] text-[#6B7280]">
          내 학과·관심사 기준으로 정렬해드렸어요
        </div>
      )}
      <div className="flex-1 min-h-0 overflow-y-auto scroll bg-[#FAF8F4] p-3">
        <div className="grid grid-cols-2 gap-3">
          {list.map((it, i) => (
            <div key={i} className="bg-white rounded-xl border border-[#F0F0F0] p-3 flex flex-col gap-1.5 active:bg-[#F9FAFB]">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold" style={{ color: accent[it.tag] }}>{it.tag}</span>
                <span className="ml-auto text-[11px] font-semibold text-[#B73E37]">{it.deadline}</span>
              </div>
              <h3 className="text-[13.5px] font-semibold text-[#111] tracking-[-0.2px] leading-snug line-clamp-2 min-h-[36px]">{it.title}</h3>
              <div className="text-[11px] text-[#9CA3AF] line-clamp-1">{it.host}</div>
              <div className="text-[11.5px] text-[#374151] line-clamp-1">{it.prize}</div>
              <div className="mt-1 pt-2 border-t border-[#F0F0F0] flex items-center justify-between">
                <span className="text-[10.5px] text-[#9CA3AF]">스크랩 {it.n}</span>
                {tab==='rec' && (
                  <span className="text-[10.5px] font-mono text-[#1F7A5C]">적합 {it.fit}%</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── 알바 (거리 + 요일/시간) ──────────────────────────────
function JobsPage({ onBack }) {
  const items = [
    { tag: '캠퍼스내', title: '주말 바리스타', wage: '시급 12,000원', dist: '0.2km', days: '토일', hours: '09:00~18:00', hot: true },
    { tag: '과외',     title: '중3 영어',     wage: '회당 60,000원', dist: '3.4km', days: '월수', hours: '19:00~21:00', hot: false },
    { tag: '단기',     title: '컨퍼런스 운영 보조', wage: '일급 110,000원', dist: '8.7km', days: '5/24~5/26', hours: '08:30~18:00', hot: true },
    { tag: '재택',     title: '대학생 설문조사 검토', wage: '건당 8,000원', dist: '재택', days: '자유', hours: '자유', hot: false },
    { tag: '캠퍼스내', title: '학생회관 카페 평일', wage: '시급 11,500원', dist: '0.3km', days: '월~금', hours: '12:00~17:00', hot: false },
  ];
  return (
    <div className="h-full flex flex-col bg-white">
      <AppBar leading={<>
        <button className="p-1 -ml-1" onClick={onBack}>{Ic.back(22)}</button>
        <span className="text-[15px] font-semibold text-[#111] ml-1">알바</span>
      </>} trailing={<button className="p-2">{Ic.search(20)}</button>}/>
      <div className="flex-1 min-h-0 overflow-y-auto scroll">
        <ul className="divide-y divide-[#F0F0F0]">
          {items.map((it, i) => (
            <li key={i} className="px-4 py-4 active:bg-[#F9FAFB]">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Pill tone="navy">{it.tag}</Pill>
                <span className="text-[11.5px] text-[#9CA3AF]">{it.dist}</span>
                {it.hot && <Pill tone="warn" className="ml-auto">급구</Pill>}
              </div>
              <h3 className="text-[15px] font-semibold text-[#111] tracking-[-0.3px] leading-snug mb-1.5">{it.title}</h3>
              <div className="text-[13px] font-semibold text-[#000080] mb-1.5">{it.wage}</div>
              <div className="flex items-center gap-2 text-[12px] text-[#6B7280]">
                <span className="inline-flex items-center gap-1">{Ic.cal(13)}{it.days}</span>
                <span className="text-[#E5E7EB]">·</span>
                <span>{it.hours}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ─── 중고장터 (필터 + 동네) ───────────────────────────────
function MarketPage({ onBack }) {
  const [hideDone, setHideDone] = React.useState(true);
  const all = [
    { title: '맥북 에어 M2 13인치 (스페이스그레이)', price: 1180000, time: '15분 전', loc: '용현동', tag: '거래중', img: 'linear-gradient(135deg,#E5E7EB,#F5F5F7)' },
    { title: '경영학원론 박상우 교재', price: 12000, time: '1시간 전', loc: '주안동', tag: '거래중', img: 'linear-gradient(135deg,#FAF8F4,#EFE3CB)' },
    { title: '아이패드 미니 6세대 (퍼플)', price: 580000, time: '3시간 전', loc: '학익동', tag: '예약중', img: 'linear-gradient(135deg,#E8E8F2,#D9D9EB)' },
    { title: '자전거 (출퇴근용)', price: 95000, time: '어제', loc: '용현동', tag: '거래중', img: 'linear-gradient(135deg,#E2F1EA,#C9E5D6)' },
    { title: '데이터분석개론 솔루션', price: 8000, time: '2일 전', loc: '도화동', tag: '거래완료', img: 'linear-gradient(135deg,#FBE9E6,#F1D2CC)' },
  ];
  const items = hideDone ? all.filter(i => i.tag !== '거래완료') : all;
  return (
    <div className="h-full flex flex-col bg-white">
      <AppBar leading={<>
        <button className="p-1 -ml-1" onClick={onBack}>{Ic.back(22)}</button>
        <span className="text-[15px] font-semibold text-[#111] ml-1">중고장터</span>
      </>} trailing={<>
        <button className="p-2">{Ic.search(20)}</button>
        <button className="p-2 text-[#000080]">{Ic.plus(20)}</button>
      </>}/>
      <div className="px-4 py-2.5 border-b border-[#F0F0F0] flex items-center gap-2">
        <button onClick={() => setHideDone(v => !v)}
          className={`h-7 px-3 rounded-full border text-[12px] flex items-center gap-1 ${hideDone ? 'bg-[#000080] border-[#000080] text-white' : 'border-[#E5E7EB] text-[#374151]'}`}>
          {hideDone && Ic.check(12)} 거래완료 제외
        </button>
        <button className="h-7 px-3 rounded-full border border-[#E5E7EB] text-[12px] text-[#374151] flex items-center gap-1">
          전체 동네 {Ic.chevDn(11)}
        </button>
        <span className="ml-auto text-[11.5px] text-[#9CA3AF]">{items.length}건</span>
      </div>
      <ul className="flex-1 min-h-0 overflow-y-auto scroll">
        {items.map((it, i) => (
          <li key={i} className="px-4 py-3 flex gap-3 border-b border-[#F0F0F0] active:bg-[#F9FAFB]">
            <div className="w-[78px] h-[78px] rounded-lg shrink-0" style={{ background: it.img }}/>
            <div className="flex-1 min-w-0">
              <h3 className="text-[14px] text-[#111] tracking-[-0.2px] leading-snug">{it.title}</h3>
              <div className="text-[11.5px] text-[#9CA3AF] mt-0.5">{it.loc} · {it.time}</div>
              <div className="mt-1.5 flex items-center gap-2">
                <span className="text-[15px] font-semibold text-[#111] tracking-[-0.3px]">{it.price.toLocaleString()}원</span>
                <Pill tone={it.tag === '거래완료' ? 'plain' : it.tag === '예약중' ? 'cream' : 'mint'}>{it.tag}</Pill>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── 친구찾기 ─────────────────────────────────────────────
function FriendsPage({ onBack }) {
  const list = [
    { name: '김민수', dept: '소프트웨어학과 22', mut: 4, st: 'add' },
    { name: '이서윤', dept: '경영학과 23',     mut: 2, st: 'add' },
    { name: '박지호', dept: '소프트웨어학과 22', mut: 7, st: 'sent' },
    { name: '정유진', dept: '디자인학과 24',   mut: 1, st: 'add' },
    { name: '최도윤', dept: '전자공학과 21',   mut: 3, st: 'friend' },
  ];
  return (
    <div className="h-full flex flex-col bg-white">
      <AppBar leading={<>
        <button className="p-1 -ml-1" onClick={onBack}>{Ic.back(22)}</button>
        <span className="text-[15px] font-semibold text-[#111] ml-1">친구찾기</span>
      </>} trailing={<button className="p-2">{Ic.search(20)}</button>}/>
      <div className="flex-1 min-h-0 overflow-y-auto scroll">
        <div className="px-4 pt-3 pb-2">
          <div className="flex items-center gap-2 h-10 px-3.5 rounded-lg bg-[#F3F4F6] text-[#9CA3AF]">
            {Ic.search(18)}<span className="text-[13.5px]">학번, 이름, 학과로 검색</span>
          </div>
        </div>
        <div className="px-4 pt-2 pb-2 text-[12px] text-[#9CA3AF]">같은 학과 · 알 수도 있는 친구</div>
        <ul>
          {list.map((p, i) => (
            <li key={i} className="px-4 py-3 flex items-center gap-3 border-b border-[#F0F0F0]">
              <Avatar name={p.name} size={42}/>
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-semibold text-[#111]">{p.name}</div>
                <div className="text-[12px] text-[#6B7280] mt-0.5">{p.dept} · 함께 아는 친구 {p.mut}</div>
              </div>
              {p.st === 'add' && <button className="h-8 px-3 rounded-md bg-[#000080] text-white text-[12.5px] font-semibold">친구추가</button>}
              {p.st === 'sent' && <button className="h-8 px-3 rounded-md bg-[#F3F4F6] text-[#6B7280] text-[12.5px]">신청 중</button>}
              {p.st === 'friend' && <button className="h-8 px-3 rounded-md border border-[#E5E7EB] text-[#374151] text-[12.5px] flex items-center gap-1">{Ic.check(13)}친구</button>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

Object.assign(window, {
  CampusHub, TimetablePage, MealPage, BusPage, LibraryPage,
  ContactsPage, ContestPage, JobsPage, MarketPage, FriendsPage,
});
