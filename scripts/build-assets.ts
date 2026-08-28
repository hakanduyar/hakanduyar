import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import sharp from 'sharp';
import { GENERATED_ASSET_NAMES, V5_ASSET_THEMES } from '../src/assets.js';
import { emitSvg, optimizeSvg, REPO_ROOT } from '../src/emit.js';
import {
  renderAiWorkflow,
  renderArchitecture,
  renderCapability,
  renderExpand,
  renderIdentity,
  renderProject,
  V5_SCENE_DIMENSIONS,
} from '../src/v5/scenes-compact.js';
import { V5_THEMES } from '../src/v5/theme.js';

interface Output {
  path: string;
  bytes: number;
  changed: boolean;
}

function emitBinary(relativePath: string, output: Buffer): Output {
  const absolute = resolve(REPO_ROOT, relativePath);
  mkdirSync(dirname(absolute), { recursive: true });
  const previous = existsSync(absolute) ? readFileSync(absolute) : null;
  const changed = !previous || !previous.equals(output);
  if (changed) writeFileSync(absolute, output);
  return {
    path: relative(REPO_ROOT, absolute).replace(/\\/g, '/'),
    bytes: output.byteLength,
    changed,
  };
}

async function renderMotionGif(options: {
  relativePath: string;
  width: number;
  height: number;
  frame: (progress: number) => string;
}): Promise<Output> {
  const frameCount = 28;
  const delay = 140;
  const frames: Buffer[] = [];
  for (let index = 0; index < frameCount; index += 1) {
    const svg = optimizeSvg(options.frame((index + .5) / frameCount));
    const rgba = await sharp(Buffer.from(svg, 'utf8')).ensureAlpha().raw().toBuffer();
    frames.push(rgba);
  }
  const gif = await sharp(Buffer.concat(frames), {
    raw: {
      width: options.width,
      height: options.height * frameCount,
      channels: 4,
      pageHeight: options.height,
    },
  }).gif({
    loop: 0,
    delay: Array.from({ length: frameCount }, () => delay),
    colours: 128,
    effort: 10,
    dither: .2,
    interFrameMaxError: 2,
    interPaletteMaxError: 5,
  }).toBuffer();
  return emitBinary(options.relativePath, gif);
}

async function main(): Promise<void> {
  const outputs: Output[] = [];

  for (const themeName of V5_ASSET_THEMES) {
    const theme = V5_THEMES[themeName];
    outputs.push(emitSvg(`assets/generated/identity-${themeName}.svg`, renderIdentity(theme, false)));
    outputs.push(emitSvg(`assets/generated/identity-mobile-${themeName}.svg`, renderIdentity(theme, true)));
    outputs.push(emitSvg(`assets/generated/expand-${themeName}.svg`, renderExpand(theme, false)));
    outputs.push(emitSvg(`assets/generated/expand-mobile-${themeName}.svg`, renderExpand(theme, true)));

    for (const project of ['factory', 'spark', 'layers', 'ledger'] as const) {
      outputs.push(emitSvg(`assets/generated/project-${project}-${themeName}.svg`, renderProject(theme, project, false)));
      outputs.push(emitSvg(`assets/generated/project-${project}-mobile-${themeName}.svg`, renderProject(theme, project, true)));
    }

    outputs.push(emitSvg(`assets/generated/capability-${themeName}.svg`, renderCapability(theme, false)));
    outputs.push(emitSvg(`assets/generated/capability-mobile-${themeName}.svg`, renderCapability(theme, true)));

    outputs.push(emitSvg(`assets/generated/architecture-static-${themeName}.svg`, renderArchitecture(theme, { compact: false, progress: .99 })));
    outputs.push(emitSvg(`assets/generated/architecture-mobile-static-${themeName}.svg`, renderArchitecture(theme, { compact: true, progress: .99 })));
    outputs.push(emitSvg(`assets/generated/ai-static-${themeName}.svg`, renderAiWorkflow(theme, { compact: false, progress: .99 })));
    outputs.push(emitSvg(`assets/generated/ai-mobile-static-${themeName}.svg`, renderAiWorkflow(theme, { compact: true, progress: .99 })));

    const architectureDesktop = V5_SCENE_DIMENSIONS.architecture.desktop;
    outputs.push(await renderMotionGif({
      relativePath: `assets/generated/architecture-${themeName}.gif`,
      width: architectureDesktop[0],
      height: architectureDesktop[1],
      frame: (progress) => renderArchitecture(theme, { compact: false, progress }),
    }));
    const architectureMobile = V5_SCENE_DIMENSIONS.architecture.mobile;
    outputs.push(await renderMotionGif({
      relativePath: `assets/generated/architecture-mobile-${themeName}.gif`,
      width: architectureMobile[0],
      height: architectureMobile[1],
      frame: (progress) => renderArchitecture(theme, { compact: true, progress }),
    }));
    const aiDesktop = V5_SCENE_DIMENSIONS.ai.desktop;
    outputs.push(await renderMotionGif({
      relativePath: `assets/generated/ai-${themeName}.gif`,
      width: aiDesktop[0],
      height: aiDesktop[1],
      frame: (progress) => renderAiWorkflow(theme, { compact: false, progress }),
    }));
    const aiMobile = V5_SCENE_DIMENSIONS.ai.mobile;
    outputs.push(await renderMotionGif({
      relativePath: `assets/generated/ai-mobile-${themeName}.gif`,
      width: aiMobile[0],
      height: aiMobile[1],
      frame: (progress) => renderAiWorkflow(theme, { compact: true, progress }),
    }));
  }

  for (const output of outputs) {
    console.log(`[render] ${output.changed ? 'wrote' : 'kept '} ${output.path} (${output.bytes.toLocaleString()} bytes)`);
  }

  const emitted = outputs.map((output) => output.path.split('/').at(-1)).sort();
  const expected = [...GENERATED_ASSET_NAMES].sort();
  if (JSON.stringify(emitted) !== JSON.stringify(expected)) {
    throw new Error(`Generated asset manifest and renderer outputs diverged\nExpected: ${expected.join(', ')}\nActual: ${emitted.join(', ')}`);
  }
}

await main();
