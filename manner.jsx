// manner.jsx — 매너 학점 시스템 (9단계: A+, A0, B+, B0, C+, C0, D+, D0, F)
// 기본 B0 (점수 80), 영향 요인: 게시글/댓글 추천 · 신고 누적 · 거래 매너 · 강의평 신뢰도

// 색상은 A+(골드) → A0(에메랄드) → B+/B0(네이비/스카이) → C(앰버/오렌지) → D(레드) → F(딥레드)
// 위에서 아래로 갈수록 채도·온도가 명확히 떨어지도록 선택
const GRADES = [
  { id: 'A+', min: 95, label: '최우수', tone: '#D9DCEB', accent: '#000080', desc: '학내 매너 모범 · 상위 1%' },
  { id: 'A0', min: 90, label: '우수',   tone: '#E1E5F2', accent: '#3461C7', desc: '꾸준히 도움이 되는 활동' },
  { id: 'B+', min: 85, label: '양호',   tone: '#D6EADF', accent: '#1F7A5C', desc: '평균 이상의 매너' },
  { id: 'B0', min: 75, label: '기본',   tone: '#E2F1EA', accent: '#4F9E7E', desc: '신규 가입 기본 등급' },
  { id: 'C+', min: 65, label: '보통',   tone: '#FCF1D6', accent: '#B5882B', desc: '주의 한두 건 누적' },
  { id: 'C0', min: 55, label: '주의',   tone: '#FBE6CC', accent: '#D97706', desc: '신고가 누적되고 있어요' },
  { id: 'D+', min: 45, label: '경고',   tone: '#FBDDD2', accent: '#C84427', desc: '일부 기능 제한 임박' },
  { id: 'D0', min: 35, label: '제한',   tone: '#F7CEC9', accent: '#B73E37', desc: '댓글·채팅 제한' },
  { id: 'F',  min: 0,  label: '제재',   tone: '#EBC2C0', accent: '#7C1D1D', desc: '커뮤니티 활동 정지' },
];

const gradeFromScore = (score) => GRADES.find(g => score >= g.min) || GRADES[GRADES.length - 1];

// ─── 작은 인라인 배지 (피드 카드 / 댓글 옆) ───────────────
const MannerBadge = ({ grade = 'B0', size = 18 }) => {
  const g = GRADES.find(x => x.id === grade) || GRADES[3];
  return (
    <span style={{ width: size, height: size, fontSize: size * 0.55, color: g.accent, borderColor: g.accent }}
      className="inline-flex items-center justify-center font-bold rounded border tracking-tight bg-white">
      {grade.replace('0','').replace('+','+')}
    </span>
  );
};

// ─── Detail page ─────────────────────────────────────────
function MannerGradePage({ onBack, onLadder }) {
  const SCORE = 82;
  const g = gradeFromScore(SCORE);
  const next = GRADES[GRADES.findIndex(x => x.id === g.id) - 1] || g;
  const toNext = next.min - SCORE;

  const axes = [
    { l: '친절함',   v: 88, n: '댓글·채팅 추천 비율' },
    { l: '진실성',   v: 92, n: '강의평·후기 신뢰도' },
    { l: '활동성',   v: 74, n: '최근 30일 게시 활동' },
    { l: '신고이력', v: 76, n: '누적 신고 (적을수록 ↑)' },
  ];

  const recent = [
    { d: '오늘',      delta: +2, src: '강의평이 추천 12회 받음', tone: 'mint' },
    { d: '5/10',      delta: +1, src: '댓글이 추천 5회 받음', tone: 'mint' },
    { d: '5/8',       delta: -3, src: '댓글이 신고 2회 받음 (검토 후 차감)', tone: 'warn' },
    { d: '5/5',       delta: +1, src: '중고 거래 후기 "친절해요"', tone: 'mint' },
    { d: '5/2',       delta: +2, src: '게시글이 베스트 선정', tone: 'navy' },
    { d: '4/28',      delta: +1, src: '배심원 투표 5회 참여', tone: 'navy' },
  ];

  return (
    <div className="h-full flex flex-col bg-white">
      <AppBar leading={<>
        <button className="p-1 -ml-1" onClick={onBack}>{Ic.back(22)}</button>
        <span className="text-[15px] font-semibold text-[#111] ml-1">매너 학점</span>
      </>} trailing={<button className="p-2">{Ic.shield(20)}</button>} divider={false}/>

      <div className="flex-1 min-h-0 overflow-y-auto scroll">
        {/* HERO */}
        <div className="px-5 pt-3 pb-6 bg-[#FAF8F4] border-b border-[#F0F0F0]">
          <div className="text-[11.5px] text-[#9CA3AF] tracking-wide uppercase mb-1">My Grade</div>
          <div className="flex items-end gap-4">
            <div className="leading-none">
              <div style={{ color: g.accent }} className="text-[88px] font-bold tracking-[-3px] font-mono">
                {g.id}
              </div>
            </div>
            <div className="pb-2">
              <div className="text-[14px] font-semibold text-[#111]">{g.label}</div>
              <div className="text-[12px] text-[#6B7280] mt-0.5">{g.desc}</div>
            </div>
            <div className="ml-auto pb-2 text-right">
              <div className="text-[11px] text-[#9CA3AF]">SCORE</div>
              <div className="text-[28px] font-semibold tracking-[-0.6px] text-[#111] font-mono leading-none mt-1">
                {SCORE}<span className="text-[14px] text-[#9CA3AF]"> / 100</span>
              </div>
            </div>
          </div>

          {/* progress to next */}
          <div className="mt-5">
            <div className="flex items-baseline justify-between text-[11.5px] mb-1.5">
              <span className="text-[#6B7280]">다음 등급 <b className="text-[#111]">{next.id}</b>까지</span>
              <span className="text-[#111] font-mono"><b style={{ color: g.accent }}>+{toNext}</b>점</span>
            </div>
            <div className="h-[8px] rounded-full bg-white border border-[#E5E7EB] overflow-hidden">
              <div className="h-full" style={{ width: `${(SCORE - g.min) / (next.min - g.min) * 100}%`, background: g.accent }}/>
            </div>
          </div>
        </div>

        {/* 4 axis */}
        <div className="px-5 py-5 border-b border-[#F0F0F0]">
          <div className="flex items-baseline justify-between mb-3">
            <h3 className="text-[14px] font-semibold text-[#111] tracking-[-0.2px]">평가 항목</h3>
            <span className="text-[11.5px] text-[#9CA3AF]">최근 90일</span>
          </div>
          <ul className="space-y-3">
            {axes.map(a => (
              <li key={a.l}>
                <div className="flex items-baseline justify-between mb-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[13.5px] font-semibold text-[#111]">{a.l}</span>
                    <span className="text-[11px] text-[#9CA3AF]">{a.n}</span>
                  </div>
                  <span className="text-[13px] text-[#111] font-mono">{a.v}</span>
                </div>
                <div className="h-[6px] rounded-full bg-[#F3F4F6] overflow-hidden">
                  <div className="h-full bg-[#000080]" style={{ width: `${a.v}%` }}/>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Recent changes */}
        <div className="px-5 py-5 border-b border-[#F0F0F0]">
          <h3 className="text-[14px] font-semibold text-[#111] tracking-[-0.2px] mb-3">최근 변동</h3>
          <ul className="space-y-3">
            {recent.map((r, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="w-[58px] shrink-0 text-[11px] text-[#9CA3AF] pt-0.5">{r.d}</div>
                <span className="font-mono text-[13px] font-semibold shrink-0 w-[34px]" style={{
                  color: r.tone === 'warn' ? '#B73E37' : r.tone === 'mint' ? '#1F7A5C' : '#000080'
                }}>{r.delta > 0 ? `+${r.delta}` : r.delta}</span>
                <span className="text-[12.5px] text-[#374151] leading-snug">{r.src}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA to ladder */}
        <button onClick={onLadder} className="w-full px-5 py-4 flex items-center justify-between active:bg-[#F9FAFB]">
          <div className="text-left">
            <div className="text-[13.5px] font-semibold text-[#111]">9등급 사다리 · 혜택 보기</div>
            <div className="text-[11.5px] text-[#9CA3AF] mt-0.5">A+부터 F까지 등급별 권한과 제한</div>
          </div>
          <span className="text-[#9CA3AF]">{Ic.chev(18)}</span>
        </button>

        {/* How it works */}
        <div className="px-5 py-5 bg-[#FAF8F4] border-t border-[#F0F0F0]">
          <h3 className="text-[13px] font-semibold text-[#111] mb-2">점수는 이렇게 매겨져요</h3>
          <ul className="text-[12px] text-[#6B7280] leading-[1.7] space-y-0.5 list-disc pl-4">
            <li>게시글·댓글 추천 / 비추</li>
            <li>강의평·후기의 추천 비율</li>
            <li>중고 거래 후 받은 매너 칭찬</li>
            <li>신고 누적 (검토 후 차감)</li>
            <li>배심원·신고 처리에 참여</li>
          </ul>
          <p className="text-[11.5px] text-[#9CA3AF] mt-3 leading-relaxed">
            신규 가입 시 B0(80점)으로 시작합니다. 정지 처분을 받으면
            기존 등급과 무관하게 F로 초기화돼요.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Ladder · 등급별 혜택 ────────────────────────────────
function MannerLadderPage({ onBack }) {
  const myGrade = 'B0';
  const benefits = {
    'A+': ['배심원 의견에 우선 표시', '프로필 닉네임 옆 학점 배지 노출(선택)'],
    'A0': ['프로필 닉네임 옆 학점 배지 노출(선택)', '신규 게시글 추천 우선 노출 후보'],
    'B+': ['모든 기본 기능 사용', '닉네임 변경 30일 → 14일 단축'],
    'B0': ['모든 기본 기능 사용 (게시·댓글·채팅·중고거래)'],
    'C+': ['이상 없음 · 누적 시 등급 하락 안내'],
    'C0': ['하루 게시글 5개로 제한', '신고 1회 누적 시 즉시 안내'],
    'D+': ['댓글 30초 쿨다운', '하루 게시글 3개로 제한'],
    'D0': ['댓글·채팅 7일 제한', '강의평 작성 7일 제한'],
    'F':  ['커뮤니티 활동 정지 (열람만 가능)', '이의제기 후 학생회 검토'],
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <AppBar leading={<>
        <button className="p-1 -ml-1" onClick={onBack}>{Ic.back(22)}</button>
        <span className="text-[15px] font-semibold text-[#111] ml-1">매너 학점별 혜택</span>
      </>}/>
      <div className="flex-1 min-h-0 overflow-y-auto scroll">
        {/* 점수 산정 기준 설명 */}
        <div className="mx-4 mt-4 mb-3 p-4 rounded-xl bg-[#F4F4FB] border border-[#DDDDF1]">
          <div className="text-[12.5px] font-semibold text-[#000080] mb-1">점수 반영 기준</div>
          <p className="text-[12px] leading-[1.55] text-[#374151] mb-3">
            모든 사용자는 <b>B0 (80점)</b>으로 시작해요. 아래 활동에 따라 점수가 오르내리고,
            점수에 따라 <b>실시간으로</b> 등급이 바뀝니다.
          </p>
          <div className="space-y-1.5">
            {[
              { sign: '+', c: '#1F7A5C', t: '추천 댓글 10개 받기', p: '+1' },
              { sign: '+', c: '#1F7A5C', t: '강의평·정보글 작성',  p: '+2' },
              { sign: '+', c: '#1F7A5C', t: '배심원 판단 일치',    p: '+1' },
              { sign: '−', c: '#B73E37', t: '신고 반영 (욕설·도배)', p: '−5' },
              { sign: '−', c: '#B73E37', t: '거래 약속 불이행',    p: '−3' },
              { sign: '−', c: '#B73E37', t: '허위 정보',           p: '−10' },
            ].map((r, i) => (
              <div key={i} className="flex items-center text-[12px]">
                <span className="w-4 font-mono font-semibold" style={{ color: r.c }}>{r.sign}</span>
                <span className="flex-1 text-[#374151]">{r.t}</span>
                <span className="font-mono font-semibold" style={{ color: r.c }}>{r.p}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#DDDDF1] text-[11px] text-[#6B7280] leading-[1.5]">
            기준은 학생회·운영진이 함께 정하고, 분기마다 공개 검토해요.
            모든 점수 변동은 <b>내 매너 학점</b> 페이지의 변동 내역에서 확인할 수 있어요.
          </div>
        </div>

        <div className="px-4 pb-1.5 text-[11.5px] font-medium text-[#9CA3AF] tracking-wide">등급별 혜택</div>
        <ul>
          {GRADES.map(g => {
            const me = g.id === myGrade;
            return (
              <li key={g.id} className="border-b border-[#F0F0F0] flex">
                <div style={{ background: g.accent }} className="w-[6px] shrink-0"/>
                <div style={{ background: me ? g.tone : 'transparent' }} className="flex-1 flex gap-4 px-4 py-4">
                <div className="w-[64px] shrink-0 text-center rounded-lg py-2" style={{ background: g.tone }}>
                  <div style={{ color: g.accent }} className="text-[34px] font-bold tracking-[-1px] font-mono leading-none">
                    {g.id}
                  </div>
                  <div className="text-[10px] text-[#6B7280] font-mono mt-1">≥{g.min}점</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[14px] font-semibold text-[#111]">{g.label}</span>
                    {me && <Pill tone="navySolid">내 등급</Pill>}
                  </div>
                  <p className="text-[12px] text-[#6B7280] mb-2">{g.desc}</p>
                  <ul className="space-y-0.5">
                    {benefits[g.id].map((b, i) => (
                      <li key={i} className="text-[12.5px] text-[#374151] flex items-start gap-1.5">
                        <span className="text-[#9CA3AF] mt-1">·</span>{b}
                      </li>
                    ))}
                  </ul>
                </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

Object.assign(window, { MannerBadge, MannerGradePage, MannerLadderPage, GRADES, gradeFromScore });
