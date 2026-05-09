// jury.jsx — 학생 배심원 자치 투표 (AI 분석 영역 없음)

function JuryPage({ onClose }) {
  const [responded, setResponded] = React.useState(17);
  const [voted, setVoted] = React.useState(null);

  React.useEffect(() => {
    if (voted) return;
    const id = setInterval(() => {
      setResponded(r => Math.min(30, r + 1));
    }, 2200);
    return () => clearInterval(id);
  }, [voted]);

  const pct = (responded / 30) * 100;

  return (
    <div className="h-full flex flex-col bg-white">
      <AppBar
        leading={<button className="p-1 -ml-1" onClick={onClose}>{Ic.x(22)}</button>}
        trailing={<button className="p-2">{Ic.shield(20)}</button>}
      />
      <div className="flex-1 min-h-0 overflow-y-auto scroll px-5 pt-2 pb-4">
        {/* Title */}
        <div className="text-[12px] text-[#000080] font-semibold tracking-wide mb-1.5">배심원 호출</div>
        <h1 className="text-[22px] font-semibold tracking-[-0.5px] text-[#111] leading-[1.3]">
          이 글, 같은 학과 학생들의<br/>판단이 필요합니다
        </h1>
        <p className="text-[13px] text-[#6B7280] mt-2 leading-[1.6]">
          신고가 누적되어 같은 학과 학생 30명에게 검토를 요청했어요.
          24시간 안에 한 표 부탁드려요.
        </p>

        {/* Reported post preview */}
        <div className="mt-5 border border-[#E5E7EB] rounded-xl p-4 bg-white">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Pill tone="plain">자유</Pill>
            <span className="text-[11.5px] text-[#9CA3AF]">익명 · 1시간 전</span>
            <span className="ml-auto text-[11px] text-[#9A3412] bg-[#FFF4EE] px-1.5 py-0.5 rounded">신고 5</span>
          </div>
          <h3 className="text-[14.5px] font-semibold text-[#111] tracking-[-0.2px] leading-snug mb-1">
            중간고사 기간 도서관 운영시간 진짜 너무함
          </h3>
          <p className="text-[13px] text-[#374151] leading-[1.6] line-clamp-4">
            매번 시험 기간만 되면 운영시간 줄이는 거 진짜 이해가 안 갑니다. 학생회는 뭐 하나요?
            지금까지 별다른 입장도 없고, 이런 식이면 학생회비 왜 내는지 모르겠어요.
          </p>
        </div>

        {/* Counter */}
        <div className="mt-5">
          <div className="flex items-baseline gap-2">
            <span className="text-[26px] font-bold text-[#000080] tracking-[-0.5px]" style={{ animation: 'count-bounce 220ms ease-out' }} key={responded}>
              {responded}
            </span>
            <span className="text-[14px] text-[#6B7280]">/ 30명 응답</span>
            <span className="ml-auto text-[12px] text-[#9CA3AF]">남은 시간 18시간</span>
          </div>
          <div className="mt-2 h-[6px] rounded-full bg-[#F3F4F6] overflow-hidden">
            <div className="h-full bg-[#000080] transition-all" style={{ width: `${pct}%` }}/>
          </div>
        </div>

        {/* Rule */}
        <div className="mt-5 px-4 py-3 rounded-lg bg-[#F8F9FA] text-[12px] text-[#6B7280] leading-[1.6]">
          판단 기준은 학과별로 정한 자치 규정을 따릅니다.<br/>
          기록은 내 프로필 → 배심원 기록에서 확인할 수 있어요.
        </div>

        {voted && (
          <div className="mt-4 px-4 py-3 rounded-lg bg-[#E8E8F2] text-[#000080] text-[13px] flex items-center gap-2">
            {Ic.check(16)} 의견을 등록했어요. 결과는 응답이 모이면 알려드릴게요.
          </div>
        )}
      </div>

      {/* Two big actions */}
      <div className="px-4 pt-3 pb-4 border-t border-[#F0F0F0] grid grid-cols-2 gap-2.5">
        <button onClick={() => setVoted('ok')} disabled={!!voted}
          className={`h-12 rounded-lg text-[14.5px] font-semibold border ${voted === 'ok' ? 'bg-[#000080] text-white border-[#000080]' : voted ? 'bg-[#F3F4F6] text-[#9CA3AF] border-[#F3F4F6]' : 'bg-white text-[#111] border-[#E5E7EB] active:bg-[#F9FAFB]'}`}>
          문제 없음
        </button>
        <button onClick={() => setVoted('issue')} disabled={!!voted}
          className={`h-12 rounded-lg text-[14.5px] font-semibold ${voted === 'issue' ? 'bg-[#000080] text-white' : voted ? 'bg-[#F3F4F6] text-[#9CA3AF]' : 'bg-[#000080] text-white active:opacity-90'}`}>
          문제 있음
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { JuryPage });
