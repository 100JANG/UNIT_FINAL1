export type Course = {
  id: number;
  name: string;
  prof: string;
  dept: string;
  credit: number;
  rec: number;
  n: number;
  partic: number;
  trust: boolean;
};

export const COURSES: Course[] = [
  { id: 1, name: '데이터분석개론', prof: '김지연', dept: '소프트웨어학과', credit: 3, rec: 78, n: 412, partic: 73, trust: true },
  { id: 2, name: '경영학원론',     prof: '박상우', dept: '경영학과',       credit: 3, rec: 64, n: 286, partic: 81, trust: true },
  { id: 3, name: '미시경제학',     prof: '이태형', dept: '경제학과',       credit: 3, rec: 41, n: 198, partic: 58, trust: false },
  { id: 4, name: '한국근현대사',   prof: '정민서', dept: '사학과',         credit: 2, rec: 89, n: 524, partic: 76, trust: true },
  { id: 5, name: '선형대수',       prof: '윤재훈', dept: '수학과',         credit: 3, rec: 52, n: 167, partic: 49, trust: false },
];

export type Review = {
  vote: 'rec' | 'no';
  body: string;
  nick: string;
  sem: string;
  up: number;
};

export const REVIEWS: Review[] = [
  { vote: 'rec', body: '실무 위주 과제가 많아서 처음엔 부담이지만, 끝나고 나면 포트폴리오에 그대로 넣을 수 있어요. 시험은 오픈북.', nick: '카페인러버', sem: '24-2', up: 23 },
  { vote: 'rec', body: '교수님이 질문에 진지하게 답해주시는 게 좋았어요. 다만 팀플 비중이 50%라 멤버 운이 학점 좌우합니다.', nick: '데이터덕후', sem: '24-1', up: 18 },
  { vote: 'no',  body: '과제량이 진짜 많습니다. 다른 전공 듣는 학기에 같이 들으면 후회해요.', nick: '졸린토끼',     sem: '23-2', up: 12 },
  { vote: 'rec', body: '발표 두 번이 좀 부담이지만 그만큼 얻어가는 거 많음.',                  nick: '바닐라라떼', sem: '23-2', up: 7 },
];
