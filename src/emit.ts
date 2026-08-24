import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { optimize, type Config } from 'svgo';

export const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const SVGO_CONFIG: Config = {
  multipass: true,
  js2svg: { indent: 0, pretty: false },
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          cleanupIds: false,
          inlineStyles: false,
          collapseGroups: false,
          mergePaths: false,
          removeHiddenElems: false,
          removeUnknownsAndDefaults: { keepRoleAttr: true },
          convertPathData: { floatPrecision: 2, transformPrecision: 2 },
        },
      },
    },
    'removeDimensions',
  ],
};

export function optimizeSvg(source: string): string {
  return optimize(source, SVGO_CONFIG).data;
}
export function emitSvg(relativePath: string, source: string): { path: string; bytes: number; changed: boolean } {
  const output = optimizeSvg(source);
  const absolutePath = resolve(REPO_ROOT, relativePath);
  mkdirSync(dirname(absolutePath), { recursive: true });
  const previous = existsSync(absolutePath) ? readFileSync(absolutePath, 'utf8') : null;
  const changed = previous !== output;
  if (changed) writeFileSync(absolutePath, output, 'utf8');
  return {
    path: relative(REPO_ROOT, absolutePath).replace(/\\/g, '/'),
    bytes: Buffer.byteLength(output, 'utf8'),
    changed,
  };
}
