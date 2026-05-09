export type School = {
  id: 'inha' | 'ajou' | 'snu' | 'yonsei';
  name: string;
  short: string;
  domain: string;
};

export const SCHOOLS: School[] = [
  { id: 'inha',   name: '인하대학교', short: '인하대', domain: 'inha.ac.kr' },
  { id: 'ajou',   name: '아주대학교', short: '아주대', domain: 'ajou.ac.kr' },
  { id: 'snu',    name: '서울대학교', short: '서울대', domain: 'snu.ac.kr' },
  { id: 'yonsei', name: '연세대학교', short: '연세대', domain: 'yonsei.ac.kr' },
];

export const schoolIcon = (domain: string): string =>
  `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
