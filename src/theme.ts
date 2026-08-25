export type ThemeName = 'light' | 'dark';

export interface Theme {
  name: ThemeName;
  bg: string;
  surface: string;
  text: string;
  muted: string;
  line: string;
  lineSoft: string;
  blue: string;
  blueSoft: string;
  amber: string;
  red: string;
  violet: string;
  mint: string;
}

export const THEMES: Record<ThemeName, Theme> = {
  light: {
    name: 'light',
    bg: '#ffffff',
    surface: '#eef1f4',
    text: '#0d1117',
    muted: '#3d444d',
    line: '#768390',
    lineSoft: '#98a3ae',
    blue: '#0550ae',
    blueSoft: '#b6e3ff',
    amber: '#7d4e00',
    red: '#a40e26',
    violet: '#512da8',
    mint: '#0a6759',
  },
  dark: {
    name: 'dark',
    bg: '#0d1117',
    surface: '#161b22',
    text: '#f0f6fc',
    muted: '#8b949e',
    line: '#30363d',
    lineSoft: '#21262d',
    blue: '#58a6ff',
    blueSoft: '#12233d',
    amber: '#d29922',
    red: '#ff7b72',
    violet: '#a371f7',
    mint: '#56d4ad',
  },
};
