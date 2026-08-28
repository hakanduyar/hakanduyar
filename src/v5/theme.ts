export type V5ThemeName = 'light' | 'dark';

export interface V5Theme {
  name: V5ThemeName;
  bg: string;
  sheet: string;
  sheet2: string;
  plate: string;
  ink: string;
  muted: string;
  faint: string;
  rule: string;
  rule2: string;
  flow: string;
  authority: string;
  next: string;
}

export const V5_THEMES: Record<V5ThemeName, V5Theme> = {
  dark: {
    name: 'dark',
    bg: '#0A0C10',
    sheet: '#12161C',
    sheet2: '#171C23',
    plate: '#080A0E',
    ink: '#E9EDF2',
    muted: '#939DA9',
    faint: '#858F9D',
    rule: '#242B34',
    rule2: '#3A444F',
    flow: '#88A7CD',
    authority: '#D3B36A',
    next: '#FFFFFF',
  },
  light: {
    name: 'light',
    bg: '#E5E7E2',
    sheet: '#FCFCFB',
    sheet2: '#F1F2EE',
    plate: '#161A20',
    ink: '#13171B',
    muted: '#525C65',
    faint: '#5E666E',
    rule: '#D6D8D3',
    rule2: '#A8ADA8',
    flow: '#2B5581',
    authority: '#7C5A0F',
    next: '#000000',
  },
};

export const BRAND = {
  react: '#61DAFB',
  typescript: '#3178C6',
  node: '#5FA04E',
  postgresql: '#4169E1',
  docker: '#2496ED',
} as const;
