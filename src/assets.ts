const THEMES = ['light', 'dark'] as const;
const STATIC_SCENES = ['identity', 'project-factory', 'project-spark', 'project-layers', 'project-ledger', 'capability', 'expand'] as const;
const MOTION_SCENES = ['architecture', 'ai'] as const;

export const GENERATED_ASSET_NAMES = [
  ...STATIC_SCENES.flatMap((scene) => THEMES.flatMap((theme) => [
    `${scene}-${theme}.svg`,
    `${scene}-mobile-${theme}.svg`,
  ])),
  ...MOTION_SCENES.flatMap((scene) => THEMES.flatMap((theme) => [
    `${scene}-${theme}.gif`,
    `${scene}-mobile-${theme}.gif`,
    `${scene}-static-${theme}.svg`,
    `${scene}-mobile-static-${theme}.svg`,
  ])),
] as const;

export const V5_STATIC_SCENES = STATIC_SCENES;
export const V5_MOTION_SCENES = MOTION_SCENES;
export const V5_ASSET_THEMES = THEMES;
