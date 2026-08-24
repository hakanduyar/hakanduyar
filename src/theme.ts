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
    surface: '#f6f8fa',
    text: '#1f2328',
    muted: '#656d76',
    line: '#d0d7de',
    lineSoft: '#eaeef2',
    blue: '#0969da',
    blueSoft: '#ddf4ff',
    amber: '#9a6700',
    red: '#cf222e',
    violet: '#6e40c9',
    mint: '#1a7f64',
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
