// V7.1 palette — extends the V6 editorial print language (warm paper, dark
// ink, hairline rules) instead of the generic dashboard grey/blue it replaced.
export interface Theme {
  bg: string;
  plane: string; // architectural plane fill
  ink: string; // primary line + display text
  text: string; // body text
  muted: string; // secondary text
  faint: string; // tertiary annotations
  hair: string; // hairline rules & leader lines
  rail: string; // hero side rails / axis
}

export const themes: Record<'light' | 'dark', Theme> = {
  light: {
    bg: '#F7F4EE',
    plane: '#FDFCF8',
    ink: '#1A1D21',
    text: '#22262B',
    muted: '#5D646C',
    faint: '#878D94',
    hair: '#CFC9BD',
    rail: '#C4BEB1',
  },
  dark: {
    bg: '#0F1114',
    plane: '#1B1F25',
    ink: '#E8E4DA',
    text: '#DCD9D0',
    muted: '#9BA1A8',
    faint: '#6E747B',
    hair: '#383D44',
    rail: '#41464E',
  },
};

// Per-mark fill, tuned per mode: brand color wherever it holds contrast on the
// warm paper / charcoal grounds, an adjusted variant where it would not, and
// classic monochrome ink for Tux (the penguin is canonically black-and-white).
export const logoFill: Record<string, { light: string; dark: string }> = {
  react: { light: '#087EA4', dark: '#61DAFB' },
  typescript: { light: '#3178C6', dark: '#3D8FE0' },
  kubernetes: { light: '#326CE5', dark: '#4E85F0' },
  docker: { light: '#1D74C4', dark: '#2496ED' },
  nginx: { light: '#009639', dark: '#00B44B' },
  apache: { light: '#C0201F', dark: '#E04A42' },
  redis: { light: '#D82C20', dark: '#FF4438' },
  elasticsearch: { light: '#005571', dark: '#00BFB3' },
  linux: { light: '#1A1D21', dark: '#E8E4DA' },
  ubuntu: { light: '#DD4814', dark: '#E95420' },
  debian: { light: '#A81D33', dark: '#D4506A' },
  postgresql: { light: '#336791', dark: '#7FA6CB' },
  pwa: { light: '#5A0FC8', dark: '#A886F2' },
};
