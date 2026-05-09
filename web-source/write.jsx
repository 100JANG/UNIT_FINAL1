// write.jsx — 단순 글쓰기 (no AI, no 분탕 차단 UI)

function WritePage({ onClose }) {
  const [board, setBoard] = React.useState('자유게시판');
  const [anon, setAnon] = React.useState(true);
  const [title, setTitle] = React.useState('');
  const [body, setBody] = React.useState('');
  const [tags, setTags] = React.useState('');
  const canPublish = title.trim().length > 0 && body.trim().length > 0;

  return (
    <div className="h-full flex flex-col bg-white">
      <AppBar
        leading={<>
          <button className="p-1 -ml-1" onClick={onClose}>{Ic.x(22)}</button>
          <span className="text-[15.5px] font-semibold text-[#111] ml-2">글쓰기</span>
        </>}
        trailing={<>
          <button className="px-2.5 py-1.5 text-[13px] text-[#6B7280]">임시저장</button>
          <button disabled={!canPublish}
            className={`px-3 py-1.5 text-[13.5px] font-semibold rounded-md ${canPublish ? 'text-white bg-[#000080]' : 'text-[#9CA3AF] bg-[#F3F4F6]'}`}>
            게시
          </button>
        </>}
      />
      <div className="flex-1 min-h-0 overflow-y-auto scroll">
        {/* Board picker */}
        <button className="w-full px-4 h-12 flex items-center justify-between border-b border-[#F0F0F0]">
          <span className="text-[14px] text-[#111]">{board}</span>
          <span className="text-[#9CA3AF] flex items-center gap-1 text-[12.5px]">
            게시판 선택{Ic.chev(14)}
          </span>
        </button>
        {/* Anonymous toggle */}
        <button onClick={() => setAnon(!anon)}
          className="w-full px-4 h-12 flex items-center justify-between border-b border-[#F0F0F0]">
          <span className="text-[14px] text-[#111]">익명으로 작성</span>
          <span className={`w-[42px] h-[24px] rounded-full relative transition ${anon ? 'bg-[#000080]' : 'bg-[#E5E7EB]'}`}>
            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${anon ? 'left-[20px]' : 'left-0.5'}`}/>
          </span>
        </button>

        {/* Title */}
        <input
          value={title} onChange={e => setTitle(e.target.value)}
          placeholder="제목을 입력하세요"
          className="w-full px-4 pt-5 pb-3 text-[18px] font-semibold tracking-[-0.4px] outline-none placeholder:text-[#C9CDD3]"/>
        <Hairline className="mx-4"/>

        {/* Body */}
        <textarea
          value={body} onChange={e => setBody(e.target.value)}
          placeholder={'내용을 자유롭게 작성하세요.\n\n같은 학과 학생들이 읽을 수 있어요.'}
          rows={9}
          className="w-full px-4 pt-4 pb-2 text-[15px] leading-[1.7] tracking-[-0.2px] outline-none resize-none placeholder:text-[#C9CDD3]"/>

        {/* Attached photos */}
        <div className="px-4 pb-3 flex items-center gap-2 overflow-x-auto">
          <button className="shrink-0 w-16 h-16 rounded-lg border border-[#E5E7EB] flex flex-col items-center justify-center gap-0.5 text-[#6B7280] active:bg-[#F9FAFB]">
            {Ic.camera(20)}
            <span className="text-[10.5px]">2/10</span>
          </button>
          {[
            'linear-gradient(135deg,#E8E8F2,#F5F5F7)',
            'linear-gradient(135deg,#FAF8F4,#EFE9DD)',
          ].map((bg, i) => (
            <div key={i} className="shrink-0 w-16 h-16 rounded-lg relative overflow-hidden" style={{ background: bg }}>
              <button className="absolute top-1 right-1 w-4 h-4 rounded-full bg-black/60 text-white flex items-center justify-center text-[10px]">×</button>
            </div>
          ))}
        </div>

        {/* Tags */}
        <div className="px-4 pt-3 pb-4">
          <input value={tags} onChange={e => setTags(e.target.value)}
            placeholder="태그를 추가하세요 (쉼표로 구분)"
            className="w-full h-10 text-[13.5px] outline-none placeholder:text-[#C9CDD3]"/>
        </div>
        <Hairline className="mx-4"/>

        {/* Notice */}
        <div className="px-4 py-4 text-[12px] leading-[1.6] text-[#9CA3AF]">
          작성한 글은 같은 학과 학생들이 볼 수 있어요. 신고가 누적되면 학과 학생 30명에게 검토를 요청할 수 있습니다.
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { WritePage });
