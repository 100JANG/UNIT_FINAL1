export type GradeId = 'A+' | 'A0' | 'B+' | 'B0' | 'C+' | 'C0' | 'D+' | 'D0' | 'F';

export type Grade = {
  id: GradeId;
  min: number;
  label: string;
  tone: string;
  accent: string;
  desc: string;
};

export const GRADES: Grade[] = [
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

export const gradeFromScore = (score: number): Grade =>
  GRADES.find((g) => score >= g.min) ?? GRADES[GRADES.length - 1];

export const BENEFITS: Record<GradeId, string[]> = {
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
