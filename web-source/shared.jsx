// shared.jsx — line icons, AppBar, BottomTab, common bits
// Palette: navy #000080 (primary) · mint #1F7A5C (trust) · coral #B73E37 (warning) · cream #FAF8F4 (alt bg)

const Ic = {
  search:  (s=22) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6"/><path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  bell:    (s=22) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M12 3a6 6 0 0 0-6 6v3.5L4.5 16.5h15L18 12.5V9a6 6 0 0 0-6-6Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/><path d="M10 19a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  back:    (s=22) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="m15 18-6-6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  more:    (s=22) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="5" r="1.4" fill="currentColor"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/><circle cx="12" cy="19" r="1.4" fill="currentColor"/></svg>,
  home:    (s=22, f=false) => <svg width={s} height={s} viewBox="0 0 24 24" fill={f?'currentColor':'none'}><path d="M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1v-8Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>,
  grid:    (s=22, f=false) => <svg width={s} height={s} viewBox="0 0 24 24" fill={f?'currentColor':'none'}><rect x="4" y="4" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6"/><rect x="13" y="4" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6"/><rect x="4" y="13" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6"/><rect x="13" y="13" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6"/></svg>,
  chatTab: (s=22, f=false) => <svg width={s} height={s} viewBox="0 0 24 24" fill={f?'currentColor':'none'}><path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-3l-4 4-4-4H6a2 2 0 0 1-2-2V6Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>,
  user:    (s=22, f=false) => <svg width={s} height={s} viewBox="0 0 24 24" fill={f?'currentColor':'none'}><circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.6"/><path d="M4 20c1.5-3.5 4.5-5 8-5s6.5 1.5 8 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  pencil:  (s=22) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M4 20h4l11-11-4-4L4 16v4Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/><path d="m13 6 4 4" stroke="currentColor" strokeWidth="1.7"/></svg>,
  thumb:   (s=18) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M7 11v9H4v-9h3Zm0 0 4-7c1.5 0 2 1 2 2v3h5a2 2 0 0 1 2 2.4l-1.4 6.6a2 2 0 0 1-2 1.6H7" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>,
  msg:     (s=18) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-5 4V5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>,
  bookmark:(s=18, f=false) => <svg width={s} height={s} viewBox="0 0 24 24" fill={f?'currentColor':'none'}><path d="M6 4h12v17l-6-4-6 4V4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>,
  share:   (s=18) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M12 4v11M8 8l4-4 4 4M5 14v5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  chev:    (s=18) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="m9 6 6 6-6 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>,
  chevDn:  (s=14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  check:   (s=18) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="m5 12 5 5 9-11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  x:       (s=20) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>,
  shield:  (s=18) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M12 3 4 6v6c0 4.5 3.5 8 8 9 4.5-1 8-4.5 8-9V6l-8-3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>,
  camera:  (s=18) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M4 8a2 2 0 0 1 2-2h2l1.5-2h5L16 6h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/><circle cx="12" cy="13" r="3.5" stroke="currentColor" strokeWidth="1.6"/></svg>,
  plus:    (s=18) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  send:    (s=20) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M4 12 20 4l-7 16-2-7-7-1Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/></svg>,
  bus:     (s=22) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><rect x="5" y="4" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.6"/><path d="M5 12h14M8 17v2M16 17v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/><circle cx="9" cy="14.5" r="0.8" fill="currentColor"/><circle cx="15" cy="14.5" r="0.8" fill="currentColor"/></svg>,
  fork:    (s=22) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M7 4v8a2 2 0 0 0 2 2v6M9 4v6M5 4v6M15 4c-1 3-1 7 1 8v8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  cal:     (s=22) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><rect x="4" y="6" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.6"/><path d="M4 10h16M9 4v3M15 4v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  chair:   (s=22) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M6 4h12v9H6V4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/><path d="M5 13h14M8 13v7M16 13v7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  phone:   (s=22) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M5 4h4l2 5-2.5 2a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A15 15 0 0 1 4 5a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>,
  trophy:  (s=22) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/><path d="M5 5H3v2a3 3 0 0 0 3 3M19 5h2v2a3 3 0 0 1-3 3M9 14h6v3l1 4H8l1-4v-3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>,
  briefcase:(s=22) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><rect x="3" y="7" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.6"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18" stroke="currentColor" strokeWidth="1.6"/></svg>,
  tag:     (s=22) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M4 4h7l9 9-7 7-9-9V4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/><circle cx="8.5" cy="8.5" r="1.2" fill="currentColor"/></svg>,
  friend:  (s=22) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><circle cx="9" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.6"/><path d="M3 19c1-3 3-4.5 6-4.5s5 1.5 6 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/><path d="M17 11h4M19 9v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
};

// School favicon urls (Google s2 — reliable)
const SCHOOLS = [
  { id: 'inha', name: '인하대학교', short: '인하대',  domain: 'inha.ac.kr' },
  { id: 'ajou', name: '아주대학교', short: '아주대',  domain: 'ajou.ac.kr' },
  { id: 'snu',  name: '서울대학교', short: '서울대',  domain: 'snu.ac.kr' },
  { id: 'yonsei',name:'연세대학교', short: '연세대',  domain: 'yonsei.ac.kr' },
];
const schoolIcon = (domain) => `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

function AppBar({ title, leading, trailing, divider = true }) {
  return (
    <div className={`h-12 flex items-center justify-between px-4 bg-white ${divider ? 'border-b border-[#E5E7EB]' : ''}`}>
      <div className="flex items-center gap-1 min-w-0">
        {leading || (<span className="text-[17px] font-semibold tracking-[-0.3px] text-[#111] truncate">{title}</span>)}
      </div>
      <div className="flex items-center gap-1 text-[#333]">{trailing}</div>
    </div>
  );
}

function BottomTab({ active = 'home', onTap }) {
  const tabs = [
    { id: 'home',   label: '피드',  icon: Ic.home },
    { id: 'campus', label: '캠퍼스', icon: Ic.grid },
    { id: 'write',  label: '쓰기' },
    { id: 'chat',   label: '채팅',  icon: Ic.chatTab },
    { id: 'me',     label: '나',    icon: Ic.user },
  ];
  return (
    <div className="border-t border-[#E5E7EB] bg-white px-2 pt-1 pb-2 flex items-end justify-around relative">
      {tabs.map(t => {
        if (t.id === 'write') {
          return (
            <button key={t.id} onClick={() => onTap?.(t.id)}
              className="relative -mt-5 w-12 h-12 rounded-full bg-[#000080] text-white flex items-center justify-center shadow-[0_4px_14px_rgba(0,0,128,0.28)] active:scale-95 transition">
              {Ic.pencil(20)}
            </button>
          );
        }
        const on = active === t.id;
        return (
          <button key={t.id} onClick={() => onTap?.(t.id)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-1.5 ${on ? 'text-[#000080]' : 'text-[#6B7280]'}`}>
            {t.icon(22, on)}
            <span className={`text-[10.5px] ${on ? 'font-semibold' : 'font-medium'}`}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

const Pill = ({ children, tone = 'plain', className = '' }) => {
  const tones = {
    plain:  'bg-[#EEF0F3] text-[#1F2937]',
    navy:   'bg-[#DDDDF1] text-[#000080]',
    navySolid: 'bg-[#000080] text-white',
    line:   'border border-[#D1D5DB] text-[#1F2937] bg-white',
    mint:   'bg-[#D6EBE0] text-[#155E45]',
    warn:   'bg-[#FADAD3] text-[#992F26]',
    cream:  'bg-[#F4ECDC] text-[#5A3F1E]',
  };
  return <span className={`inline-flex items-center h-[20px] px-2 rounded-md text-[11px] font-semibold ${tones[tone]} ${className}`}>{children}</span>;
};

const Avatar = ({ name = '익', size = 30, hue }) => (
  <div style={{ width: size, height: size, fontSize: size * 0.42, background: hue || '#F1F3F5' }}
    className="rounded-full text-[#6B7280] font-semibold flex items-center justify-center shrink-0">
    {name.slice(0, 1)}
  </div>
);

const Hairline = ({ className = '' }) => <div className={`h-px bg-[#E5E7EB] ${className}`} />;

function Screen({ children, bottomTab = null, scrollClass = '', appBar = null }) {
  return (
    <div className="h-full flex flex-col bg-white">
      {appBar}
      <div className={`flex-1 min-h-0 overflow-y-auto scroll ${scrollClass}`}>{children}</div>
      {bottomTab}
    </div>
  );
}

Object.assign(window, { Ic, AppBar, BottomTab, Pill, Avatar, Hairline, Screen, SCHOOLS, schoolIcon });
