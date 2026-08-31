// V7.2 dual-theme visual-proof generator.
// Pure and deterministic: same input -> byte-identical SVG. No browser, no
// network fonts, no external hosts. Extends the V6 editorial print language
// (warm paper, hairline rules, monospace annotations, axonometric planes)
// with real technology marks placed as semantic architecture elements.

import { themes, logoFill, type Theme } from './theme.js';
import { logoMarks, type LogoSlug } from './logos.js';
import {
  identity,
  architecture,
  systems,
  deliveryPath,
  footer,
  type SystemEntry,
} from '../data/content.js';

export type Device = 'desktop' | 'mobile';
export type Mode = 'light' | 'dark';

const SERIF = "Georgia, 'Times New Roman', serif";
const MONO = "Consolas, 'Courier New', monospace";

// Motion timing. `delay` is an explicit override in seconds (used to sync an
// emphasis to a point along an in-progress draw animation); items without it
// get the next sequential slot, so the composition resolves top-to-bottom in
// document order — restrained stagger, not simultaneous or randomised.
interface MotionItem {
  id: string;
  kind: 'draw' | 'reveal' | 'emphasize';
  delay?: number;
}
const MOTION_STEP = 0.06;
const DRAW_DURATION = 1.4;
const REVEAL_DURATION = 0.5;
const EMPHASIZE_DURATION = 0.6;

function esc(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Rough width estimate (px) — authored layout, not font metrics. `ls` is
// tracking in em units (letter-spacing), which matters for the tracked
// mono kickers — ignoring it under-estimates their width enough to let a
// wrapped line run past the mobile viewBox.
function estWidth(s: string, size: number, family: 'serif' | 'mono', bold = false, ls = 0): number {
  const f = family === 'mono' ? 0.55 : bold ? 0.52 : 0.47;
  return s.length * size * f + Math.max(0, s.length - 1) * ls * size;
}

function wrap(text: string, maxWidth: number, size: number, family: 'serif' | 'mono', ls = 0): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (estWidth(candidate, size, family, false, ls) > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

// Wrap a " · "-joined role note onto its dot separators first, so notes read
// as short natural phrases; a segment with no dot to break on (e.g. a single
// phrase like "operating foundation") falls back to word-wrap instead of
// overflowing, since it would otherwise never be split.
function wrapRoleNote(text: string, maxWidth: number, size: number): string[] {
  const segs = text.split(' · ');
  const lines: string[] = [];
  let cur = '';
  for (const seg of segs) {
    const cand = cur ? `${cur} · ${seg}` : seg;
    if (estWidth(cand, size, 'mono') <= maxWidth) {
      cur = cand;
      continue;
    }
    if (cur) lines.push(cur);
    if (estWidth(seg, size, 'mono') > maxWidth) {
      lines.push(...wrap(seg, maxWidth, size, 'mono'));
      cur = '';
    } else {
      cur = seg;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

interface Ctx {
  parts: string[];
  y: number;
  width: number;
  pad: number;
  device: Device;
  mode: Mode;
  theme: Theme;
  motion: MotionItem[];
}

interface TextOpts {
  size: number;
  fill: string;
  weight?: number;
  anchor?: 'start' | 'middle' | 'end';
  ls?: string; // letter-spacing
  italic?: boolean;
}

function txt(ctx: Ctx, family: string, x: number, y: number, s: string, o: TextOpts) {
  const attrs = [
    `x="${x}"`,
    `y="${y}"`,
    `font-family="${family}"`,
    `font-size="${o.size}"`,
    o.weight ? `font-weight="${o.weight}"` : '',
    o.anchor ? `text-anchor="${o.anchor}"` : '',
    o.ls ? `letter-spacing="${o.ls}"` : '',
    o.italic ? `font-style="italic"` : '',
    `fill="${o.fill}"`,
  ]
    .filter(Boolean)
    .join(' ');
  ctx.parts.push(`<text ${attrs}>${esc(s)}</text>`);
}

const serif = (ctx: Ctx, x: number, y: number, s: string, o: TextOpts) => txt(ctx, SERIF, x, y, s, o);
const mono = (ctx: Ctx, x: number, y: number, s: string, o: TextOpts) => txt(ctx, MONO, x, y, s, o);

function line(ctx: Ctx, x1: number, y1: number, x2: number, y2: number, stroke: string, w = 1, extra = '') {
  ctx.parts.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${w}"${extra ? ` ${extra}` : ''}/>`);
}

// A technology mark, centered on (cx, cy) at pixel size px. When `revealId`
// is given, the mark fades/lifts in with a short stagger once other marks in
// the same composition have appeared (guarded by prefers-reduced-motion).
function logo(ctx: Ctx, slug: LogoSlug, cx: number, cy: number, px: number, revealId?: string) {
  const mark = logoMarks[slug];
  const fill = logoFill[slug]?.[ctx.mode] ?? ctx.theme.ink;
  const s = px / 24;
  const tx = +(cx - px / 2).toFixed(2);
  const ty = +(cy - px / 2).toFixed(2);
  const reveal = revealId ? ` class="reveal" id="${revealId}"` : '';
  ctx.parts.push(
    `<g data-logo="${slug}" data-px="${px}"${reveal} transform="translate(${tx} ${ty}) scale(${+s.toFixed(4)})">` +
      `<path fill="${fill}" d="${mark.path}"/></g>`,
  );
  if (revealId) ctx.motion.push({ id: revealId, kind: 'reveal' });
}

function kicker(ctx: Ctx, label: string, opts?: { rule?: boolean }) {
  const small = ctx.device === 'mobile';
  const size = small ? 13.5 : 13;
  const lsEm = small ? 0.13 : 0.16;
  const ls = `${lsEm}em`;
  // Mobile kickers wrap instead of running past the 390px viewBox — some
  // section kickers share the same long label across both devices. The
  // tracking (letter-spacing) has to be included in the wrap width, or a
  // wrapped line can still run past the edge once tracking is applied.
  const lines = small ? wrap(label, ctx.width - ctx.pad * 2, size, 'mono', lsEm) : [label];
  for (const l of lines) {
    mono(ctx, ctx.pad, ctx.y, l, { size, weight: 700, fill: ctx.theme.muted, ls });
    ctx.y += 16;
  }
  if (opts?.rule !== false) {
    line(ctx, ctx.pad, ctx.y, ctx.width - ctx.pad, ctx.y, ctx.theme.hair, 1);
  }
}

/* ------------------------------------------------------------------ */
/* Masthead                                                            */
/* ------------------------------------------------------------------ */

function renderMasthead(ctx: Ctx) {
  const { theme } = ctx;
  const d = ctx.device === 'desktop';
  ctx.y = d ? 70 : 56;
  mono(ctx, ctx.pad, ctx.y, identity.kicker, {
    size: d ? 12.5 : 13,
    weight: 700,
    fill: theme.muted,
    ls: d ? '0.18em' : '0.13em',
  });
  ctx.y += d ? 54 : 48;
  serif(ctx, ctx.pad, ctx.y, identity.name, { size: d ? 52 : 44, weight: 700, fill: theme.ink });
  ctx.y += d ? 34 : 34;
  const roleLines = wrap(identity.role, ctx.width - ctx.pad * 2 - (d ? 120 : 0), d ? 17 : 16.5, 'serif');
  for (const l of roleLines) {
    serif(ctx, ctx.pad, ctx.y, l, { size: d ? 17 : 16.5, fill: theme.muted });
    ctx.y += d ? 25 : 24;
  }
  ctx.y += d ? 10 : 10;
  line(ctx, ctx.pad, ctx.y, ctx.width - ctx.pad, ctx.y, theme.ink, 1.25);
  ctx.y += d ? 52 : 44;
}

/* ------------------------------------------------------------------ */
/* Hero — exploded architectural section with pinned marks             */
/* ------------------------------------------------------------------ */

interface PinSpec {
  fx: number; // anchor position as fraction of halfW
  fy: number; // anchor position as fraction of halfH
  s: number; // size multiplier on cfg.logoSmall (ignored for primary)
  stem: number; // stem height at desktop scale
}

const pinLayout: Record<string, PinSpec[]> = {
  interface: [{ fx: -0.2, fy: -0.12, s: 1, stem: 46 }],
  application: [{ fx: 0.3, fy: -0.1, s: 1, stem: 46 }],
  data: [
    { fx: -0.5, fy: 0.16, s: 1.1, stem: 30 },
    { fx: 0.0, fy: -0.3, s: 0.95, stem: 24 },
    { fx: 0.48, fy: 0.22, s: 0.95, stem: 36 },
  ],
  delivery: [
    { fx: -0.62, fy: 0.1, s: 1.15, stem: 30 },
    { fx: -0.18, fy: -0.3, s: 1.05, stem: 24 },
    { fx: 0.26, fy: -0.04, s: 0.95, stem: 32 },
    { fx: 0.62, fy: 0.24, s: 1.35, stem: 34 },
  ],
  runtime: [
    { fx: -0.46, fy: 0.12, s: 1.1, stem: 30 },
    { fx: 0.02, fy: -0.26, s: 1.0, stem: 24 },
    { fx: 0.48, fy: 0.2, s: 1.0, stem: 36 },
  ],
};

function renderHero(ctx: Ctx) {
  const { theme } = ctx;
  const d = ctx.device === 'desktop';

  kicker(ctx, d ? 'SYSTEM ARCHITECTURE — FIVE PLANES, TECHNOLOGIES IN ROLE' : 'SYSTEM ARCHITECTURE');
  ctx.y += d ? 26 : 22;

  const cfg = d
    ? { cx: 470, halfW: 258, halfH: 128, gapPrimary: 214, gap: 214, logoPrimary: 116, logoSmall: 48, stemScale: 1, annX: 940, leadGap: 12 }
    : { cx: 116, halfW: 102, halfH: 82, gapPrimary: 178, gap: 178, logoPrimary: 96, logoSmall: 38, stemScale: 0.88, annX: 240, leadGap: 12 };

  // First plane center must clear the tallest pin above it (the primary mark).
  const topClear = cfg.logoPrimary + pinLayout.interface![0]!.stem * cfg.stemScale + cfg.halfH * 0.2 + (d ? 26 : 18);
  const cys: number[] = [];
  let cy = ctx.y + topClear;
  for (let i = 0; i < architecture.length; i++) {
    cys.push(cy);
    const next = architecture[i + 1];
    if (next) cy += next.marks.some((m) => m.primary) ? cfg.gapPrimary : cfg.gap;
  }
  const lastCy = cys[cys.length - 1]!;
  const heroBottom = lastCy + cfg.halfH + (d ? 30 : 20);

  // Central axis + side rails (the V6 exploded-section skeleton). The axis
  // draws top-to-bottom once — the request/data path travelling downward
  // through the five planes.
  const spineId = `spine-${ctx.device}`;
  line(ctx, cfg.cx, ctx.y - (d ? 8 : 4), cfg.cx, heroBottom, theme.rail, 1, `class="resolve" id="${spineId}"`);
  ctx.motion.push({ id: spineId, kind: 'draw' });
  ctx.parts.push(`<path d="M${cfg.cx - 5} ${heroBottom - 6} L${cfg.cx} ${heroBottom} L${cfg.cx + 5} ${heroBottom - 6}" stroke="${theme.ink}" fill="none" stroke-width="1"/>`);
  line(ctx, cfg.cx - cfg.halfW, cys[0]!, cfg.cx - cfg.halfW, lastCy, theme.rail, 1);
  line(ctx, cfg.cx + cfg.halfW, cys[0]!, cfg.cx + cfg.halfW, lastCy, theme.rail, 1);

  architecture.forEach((plane, i) => {
    const pcy = cys[i]!;
    const { cx, halfW, halfH } = cfg;
    // Plane
    ctx.parts.push(
      `<polygon points="${cx},${pcy - halfH} ${cx + halfW},${pcy} ${cx},${pcy + halfH} ${cx - halfW},${pcy}" fill="${theme.plane}" stroke="${theme.ink}" stroke-width="1.25"/>`,
    );
    // Plane title, low on the plane so pins own the upper surface.
    mono(ctx, cx, pcy + halfH * 0.52, plane.label, {
      size: d ? 13.5 : 13,
      weight: 600,
      fill: theme.ink,
      anchor: 'middle',
      ls: d ? '0.2em' : '0.13em',
    });

    // Pins — back to front.
    const specs = pinLayout[plane.id] ?? [];
    const order = plane.marks
      .map((mark, j) => ({ mark, spec: specs[j] ?? { fx: 0, fy: 0, s: 1, stem: 28 } }))
      .sort((a, b) => a.spec.fy - b.spec.fy);
    for (const { mark, spec } of order) {
      // Mobile pulls pins toward the axis so name labels stay on the plane.
      const ax = cx + spec.fx * halfW * (d ? 1 : 0.78);
      const ay = pcy + spec.fy * halfH;
      const primaryScale = plane.id === 'application' ? 0.88 : 1;
      const size = mark.primary ? cfg.logoPrimary * primaryScale : cfg.logoSmall * spec.s;
      const logoDrop = plane.id === 'application' ? (d ? 10 : 7) : 0;
      const stem = spec.stem * cfg.stemScale;
      // Ground contact + stem + mark.
      ctx.parts.push(`<ellipse cx="${ax}" cy="${ay}" rx="${d ? 7 : 4.5}" ry="${d ? 2.8 : 1.9}" fill="none" stroke="${theme.rail}" stroke-width="1"/>`);
      const stemId = `st-${plane.id}-${mark.slug}-${ctx.device}`;
      line(ctx, ax, ay - (d ? 2.4 : 1.6), ax, ay - stem, theme.muted, 1, `class="resolve" id="${stemId}"`);
      ctx.motion.push({ id: stemId, kind: 'draw' });
      logo(ctx, mark.slug, ax, ay - stem - size / 2 - (d ? 4 : 3) + logoDrop, size);
      // Name, set on the plane surface just below the contact point.
      mono(ctx, ax, ay + (mark.primary ? (d ? 24 : 20) : d ? 18 : 15), mark.name, {
        size: mark.primary ? (d ? 13.5 : 13) : d ? 12 : 11.5,
        weight: mark.primary ? 700 : 400,
        fill: mark.primary ? theme.ink : theme.muted,
        anchor: 'middle',
        ls: mark.primary ? '0.07em' : undefined,
      });
    }

    // Right-margin role annotation with leader line.
    const leadStart = cx + halfW + cfg.leadGap;
    const leadEnd = cfg.annX - (d ? 14 : 8);
    const leadId = `ld-${plane.id}-${ctx.device}`;
    line(ctx, leadStart, pcy, leadEnd, pcy, theme.hair, 1, `class="resolve" id="${leadId}"`);
    ctx.motion.push({ id: leadId, kind: 'draw' });
    // Wrap role notes on their " · " separators so no line orphans a dot;
    // any segment that still doesn't fit (no dot to break on) falls back to
    // plain word-wrap so it can never run past the mobile viewBox edge.
    const roleLines = d ? [plane.roleNote] : wrapRoleNote(plane.roleNote, ctx.width - ctx.pad - cfg.annX, 13);
    let ry = pcy - ((roleLines.length - 1) * (d ? 0 : 17)) / 2 + (d ? 4 : 3.5);
    for (const rl of roleLines) {
      mono(ctx, cfg.annX, ry, rl, { size: d ? 13 : 13, fill: theme.muted });
      ry += d ? 18 : 17;
    }
  });

  ctx.y = heroBottom + (d ? 56 : 40);
}

/* ------------------------------------------------------------------ */
/* Selected systems — editorial ledger, not cards                      */
/* ------------------------------------------------------------------ */

function markerGlyph(ctx: Ctx, x: number, y: number, entry: SystemEntry): number {
  const t = ctx.theme;
  const s = ctx.device === 'desktop' ? 12 : 10; // glyph box
  const gy = y - s + 1;
  if (entry.marker === 'BUILT') {
    ctx.parts.push(`<rect x="${x}" y="${gy}" width="${s}" height="${s}" fill="${t.ink}"/>`);
  } else if (entry.marker === 'CONCEPT') {
    ctx.parts.push(`<rect x="${x}" y="${gy}" width="${s}" height="${s}" fill="none" stroke="${t.ink}" stroke-width="1.1" stroke-dasharray="2.4,1.8"/>`);
  } else {
    ctx.parts.push(
      `<rect x="${x}" y="${gy}" width="${s}" height="${s}" fill="none" stroke="${t.ink}" stroke-width="1.1"/>` +
        `<path d="M${x} ${gy + s} L${x + s} ${gy} L${x + s} ${gy + s} Z" fill="${t.ink}"/>`,
    );
  }
  const label = entry.markerNote ? `${entry.marker} — ${entry.markerNote}` : entry.marker;
  const markerSize = ctx.device === 'desktop' ? 16 : 13;
  mono(ctx, x + s + 9, y, label, { size: markerSize, weight: 700, fill: t.ink, ls: '0.08em' });
  return x + s + 9 + estWidth(label, markerSize, 'mono');
}

// Small dashed control-plane glyph for the concept entry (no technology
// marks are claimed for a concept).
function conceptGlyph(ctx: Ctx, x: number, y: number, w: number) {
  const t = ctx.theme;
  const mid = y;
  const n = 3;
  const step = w / (n - 1);
  line(ctx, x, mid, x + w, mid, t.muted, 1, `stroke-dasharray="4,3"`);
  for (let i = 0; i < n; i++) {
    const nx = x + i * step;
    if (i === 1) {
      ctx.parts.push(`<rect x="${nx - 4.2}" y="${mid - 4.2}" width="8.4" height="8.4" transform="rotate(45 ${nx} ${mid})" fill="${t.plane}" stroke="${t.muted}" stroke-width="1" stroke-dasharray="2.2,1.8"/>`);
    } else {
      ctx.parts.push(`<circle cx="${nx}" cy="${mid}" r="3" fill="none" stroke="${t.muted}" stroke-width="1" stroke-dasharray="2.2,1.8"/>`);
    }
  }
  mono(ctx, x + w / 2, mid + 20, 'not built — direction', { size: 11, fill: t.faint, anchor: 'middle' });
}

function renderSystems(ctx: Ctx) {
  const { theme } = ctx;
  const d = ctx.device === 'desktop';
  kicker(ctx, d ? 'SELECTED SYSTEMS — FOUR, IN ORDER, WITH TRUTH MARKERS' : 'SELECTED SYSTEMS — TRUTH MARKERS');
  ctx.y += d ? 34 : 30;

  const bodyX = d ? ctx.pad + 82 : ctx.pad + 52;
  const logoZoneW = d ? 360 : 0; // desktop reserves a right zone for large marks
  const bodyW = ctx.width - ctx.pad - bodyX - (d ? logoZoneW + 40 : 0);

  systems.forEach((entry, i) => {
    const top = ctx.y;
    // Index numeral
    serif(ctx, ctx.pad, top + (d ? 38 : 19), entry.index, { size: d ? 40 : 25, weight: 400, fill: theme.faint });
    // Name + marker
    serif(ctx, bodyX, top + (d ? 36 : 19), entry.name, { size: d ? 36 : 22, weight: 700, fill: theme.ink });
    const nameEnd = bodyX + estWidth(entry.name, d ? 36 : 22, 'serif', true);
    if (d) {
      markerGlyph(ctx, nameEnd + 28, top + 34, entry);
    } else {
      markerGlyph(ctx, bodyX, top + 46, entry);
    }
    let ly = top + (d ? 82 : 72);
    const sumLines = wrap(entry.summary, bodyW, d ? 22 : 16, 'serif');
    for (const l of sumLines) {
      serif(ctx, bodyX, ly, l, { size: d ? 22 : 16, fill: theme.text });
      ly += d ? 30 : 23;
    }
    ly += d ? 12 : 8;
    const bndLines = wrap(`BOUNDARY — ${entry.boundary}`, bodyW, d ? 16 : 13, 'mono');
    for (const l of bndLines) {
      mono(ctx, bodyX, ly, l, { size: d ? 16 : 13, fill: theme.muted });
      ly += d ? 23 : 18;
    }

    // Technology marks for this system.
    if (d) {
      const zoneRight = ctx.width - ctx.pad;
      if (entry.marks.length === 0) {
        conceptGlyph(ctx, zoneRight - 275, top + 46, 230);
      } else {
        const step = 120;
        const firstCx = zoneRight - 48 - (entry.marks.length - 1) * step;
        entry.marks.forEach((m, j) => {
          const mcx = firstCx + j * step;
          logo(ctx, m.slug, mcx, top + 52, 70, `pm-${i}-${m.slug}-${ctx.device}`);
          mono(ctx, mcx, top + 98, m.name, { size: 16, fill: theme.faint, anchor: 'middle' });
        });
      }
    } else if (entry.marks.length > 0) {
      const rowRight = ctx.width - ctx.pad;
      const rowStart = bodyX + 10;
      let mx = rowStart;
      let rowY = ly;
      entry.marks.forEach((m) => {
        const w = 42 + estWidth(m.name, 13, 'mono') + 16;
        if (mx + w > rowRight && mx > rowStart) {
          mx = rowStart;
          rowY += 48;
        }
        logo(ctx, m.slug, mx, rowY + 17, 38, `pm-${i}-${m.slug}-${ctx.device}`);
        mono(ctx, mx + 22, rowY + 22, m.name, { size: 13, fill: theme.faint });
        mx += w;
      });
      ly = rowY + 46;
    }

    ctx.y = Math.max(ly, top + (d ? 132 : 82)) + (d ? 30 : 18);
    if (i < systems.length - 1) {
      line(ctx, ctx.pad, ctx.y, ctx.width - ctx.pad, ctx.y, theme.hair, 1);
      ctx.y += d ? 34 : 24;
    }
  });
  ctx.y += d ? 48 : 40;
}

/* ------------------------------------------------------------------ */
/* Delivery path — one integrated system path                          */
/* ------------------------------------------------------------------ */

function renderDeliveryPath(ctx: Ctx) {
  const { theme } = ctx;
  const d = ctx.device === 'desktop';
  kicker(ctx, deliveryPath.kicker);
  ctx.y += d ? 58 : 30;

  const nodes = deliveryPath.nodes;
  const idxFrom = nodes.findIndex((n) => n.label === deliveryPath.repair.from);
  const idxTo = nodes.findIndex((n) => n.label === deliveryPath.repair.to);

  if (d) {
    const x0 = ctx.pad + 30;
    const x1 = ctx.width - ctx.pad - 30;
    const py = ctx.y + 14;
    const step = (x1 - x0) / (nodes.length - 1);
    const pathId = `path-${ctx.device}`;
    line(ctx, x0 - 22, py, x1 + 22, py, theme.ink, 1.25, `class="resolve" id="${pathId}"`);
    ctx.motion.push({ id: pathId, kind: 'draw' });
    const pathDelay = (ctx.motion.length - 1) * MOTION_STEP;
    ctx.parts.push(`<path d="M${x1 + 22} ${py} l-6 -4 v8 Z" fill="${theme.ink}"/>`);
    nodes.forEach((n, i) => {
      const nx = x0 + i * step;
      if (n.humanGate) {
        const gateId = `gate-${n.label.toLowerCase()}-${ctx.device}`;
        ctx.motion.push({ id: gateId, kind: 'emphasize', delay: pathDelay + (i / (nodes.length - 1)) * DRAW_DURATION });
        ctx.parts.push(`<rect class="emphasize" id="${gateId}" x="${nx - 5.6}" y="${py - 5.6}" width="11.2" height="11.2" transform="rotate(45 ${nx} ${py})" fill="${theme.bg}" stroke="${theme.ink}" stroke-width="1.4"/>`);
      } else {
        ctx.parts.push(`<circle cx="${nx}" cy="${py}" r="4.4" fill="${theme.bg}" stroke="${theme.ink}" stroke-width="1.4"/>`);
      }
      mono(ctx, nx, py - 22, n.label, { size: 12.5, weight: 700, fill: theme.ink, anchor: 'middle', ls: '0.07em' });
      const below = n.humanGate ? 'HUMAN GATE' : n.note;
      if (below) {
        mono(ctx, nx, py + 30, below, {
          size: 11.5,
          weight: n.humanGate ? 700 : 400,
          fill: n.humanGate ? theme.ink : theme.faint,
          anchor: 'middle',
          ls: n.humanGate ? '0.09em' : undefined,
        });
      }
    });
    // Repair return: review -> implement.
    const fx = x0 + idxFrom * step;
    const tx = x0 + idxTo * step;
    const dip = py + 62;
    const repairId = `rp-${ctx.device}`;
    ctx.motion.push({ id: repairId, kind: 'draw' });
    ctx.parts.push(
      `<path id="${repairId}" class="resolve" d="M${fx} ${py + 34} C ${fx} ${dip}, ${tx} ${dip}, ${tx} ${py + 12}" fill="none" stroke="${theme.muted}" stroke-width="1" stroke-dasharray="4,3"/>`,
    );
    ctx.parts.push(`<path d="M${tx} ${py + 10} l-3.6 5.4 h7.2 Z" fill="${theme.muted}"/>`);
    mono(ctx, (fx + tx) / 2, dip + 18, deliveryPath.repair.label, { size: 11.5, fill: theme.muted, anchor: 'middle' });
    ctx.y = dip + 36;
  } else {
    const lx = ctx.pad + 20;
    const step = 64;
    const py0 = ctx.y + 8;
    const py1 = py0 + (nodes.length - 1) * step;
    const pathId = `path-${ctx.device}`;
    line(ctx, lx, py0 - 16, lx, py1 + 18, theme.ink, 1.25, `class="resolve" id="${pathId}"`);
    ctx.motion.push({ id: pathId, kind: 'draw' });
    const pathDelay = (ctx.motion.length - 1) * MOTION_STEP;
    ctx.parts.push(`<path d="M${lx} ${py1 + 18} l-4 -6 h8 Z" fill="${theme.ink}"/>`);
    nodes.forEach((n, i) => {
      const ny = py0 + i * step;
      if (n.humanGate) {
        const gateId = `gate-${n.label.toLowerCase()}-${ctx.device}`;
        ctx.motion.push({ id: gateId, kind: 'emphasize', delay: pathDelay + (i / (nodes.length - 1)) * DRAW_DURATION });
        ctx.parts.push(`<rect class="emphasize" id="${gateId}" x="${lx - 6.8}" y="${ny - 6.8}" width="13.6" height="13.6" transform="rotate(45 ${lx} ${ny})" fill="${theme.bg}" stroke="${theme.ink}" stroke-width="1.4"/>`);
      } else {
        ctx.parts.push(`<circle cx="${lx}" cy="${ny}" r="5.6" fill="${theme.bg}" stroke="${theme.ink}" stroke-width="1.4"/>`);
      }
      mono(ctx, lx + 28, ny + 4, n.label, { size: 14, weight: 700, fill: theme.ink, ls: '0.05em' });
      const below = n.humanGate ? 'HUMAN GATE' : n.note;
      if (below) {
        mono(ctx, lx + 28 + estWidth(n.label, 14, 'mono') + 16, ny + 4, below, {
          size: 13,
          weight: n.humanGate ? 700 : 400,
          fill: n.humanGate ? theme.ink : theme.faint,
        });
      }
    });
    // Repair return on the right side.
    const fy = py0 + idxFrom * step;
    const ty = py0 + idxTo * step;
    const bulge = ctx.width - ctx.pad - 24;
    ctx.motion.push({ id: `rp-${ctx.device}`, kind: 'draw' });
    ctx.parts.push(
      `<path class="resolve" id="rp-${ctx.device}" d="M${lx + 158} ${fy} C ${bulge} ${fy}, ${bulge} ${ty}, ${lx + 173} ${ty}" fill="none" stroke="${theme.muted}" stroke-width="1" stroke-dasharray="4,3"/>`,
    );
    ctx.parts.push(`<path d="M${lx + 170} ${ty} l6 -3.6 v7.2 Z" fill="${theme.muted}"/>`);
    mono(ctx, bulge - 2, (fy + ty) / 2 + 3, deliveryPath.repair.label, { size: 12.5, fill: theme.muted, anchor: 'end' });
    ctx.y = py1 + 44;
  }
  ctx.y += d ? 30 : 24;
}

/* ------------------------------------------------------------------ */
/* Footer                                                              */
/* ------------------------------------------------------------------ */

function renderFooter(ctx: Ctx) {
  const { theme } = ctx;
  const d = ctx.device === 'desktop';
  line(ctx, ctx.pad, ctx.y, ctx.width - ctx.pad, ctx.y, theme.hair, 1);
  ctx.y += d ? 24 : 24;
  mono(ctx, ctx.pad, ctx.y, footer.contact, { size: d ? 13 : 15, weight: 700, fill: theme.ink, ls: '0.03em' });
  ctx.y += d ? 26 : 28;
  if (d) {
    // Side-by-side only if both strings fit without touching; otherwise
    // stack them so neither is ever overlapped or truncated.
    const gap = 32;
    const fits =
      ctx.pad + estWidth(footer.left, 11.5, 'mono') + gap <= ctx.width - ctx.pad - estWidth(footer.right, 11.5, 'mono');
    if (fits) {
      mono(ctx, ctx.pad, ctx.y, footer.left, { size: 11.5, fill: theme.faint });
      mono(ctx, ctx.width - ctx.pad, ctx.y, footer.right, { size: 11.5, fill: theme.faint, anchor: 'end' });
      ctx.y += 22;
    } else {
      mono(ctx, ctx.pad, ctx.y, footer.left, { size: 11.5, fill: theme.faint });
      ctx.y += 20;
      mono(ctx, ctx.pad, ctx.y, footer.right, { size: 11.5, fill: theme.faint });
      ctx.y += 22;
    }
  } else {
    for (const s of [footer.left, footer.right]) {
      for (const l of wrap(s, ctx.width - ctx.pad * 2, 13, 'mono')) {
        mono(ctx, ctx.pad, ctx.y, l, { size: 13, fill: theme.faint });
        ctx.y += 18;
      }
      ctx.y += 6;
    }
  }
  ctx.y += d ? 26 : 18;
}

/* ------------------------------------------------------------------ */

// Motion: architecture connectors, the request/data spine, technology marks,
// the AI delivery path and its repair return all resolve once; human gates
// receive a restrained emphasis only once the path has reached them. The
// base attribute state is the fully-resolved, fully-visible drawing, so any
// renderer that ignores CSS (librsvg/sharp for the PNG proof) and any viewer
// with prefers-reduced-motion set sees the identical final image with zero
// information loss — nothing here is expressed only through animation.
function motionStyle(items: MotionItem[]): string {
  if (items.length === 0) return '';
  let autoIndex = 0;
  const delays = items
    .map((item) => {
      const delay = item.delay ?? autoIndex * MOTION_STEP;
      if (item.delay === undefined) autoIndex++;
      return `#${esc(item.id)}{animation-delay:${delay.toFixed(3)}s}`;
    })
    .join('');
  return (
    `<style>` +
    `@media (prefers-reduced-motion: no-preference){` +
    `.resolve{stroke-dasharray:1800;stroke-dashoffset:1800;animation:v7resolve ${DRAW_DURATION}s ease-out forwards}` +
    `.reveal{opacity:0;animation:v7reveal ${REVEAL_DURATION}s ease-out forwards}` +
    `.emphasize{animation:v7emphasize ${EMPHASIZE_DURATION}s ease-out forwards}` +
    delays +
    `@keyframes v7resolve{to{stroke-dashoffset:0}}` +
    `@keyframes v7reveal{to{opacity:1}}` +
    `@keyframes v7emphasize{0%{stroke-width:1.4}45%{stroke-width:2.6}100%{stroke-width:1.4}}` +
    `}` +
    `</style>`
  );
}

export function generateVariant(mode: Mode, device: Device): { svg: string; width: number; height: number } {
  const theme = themes[mode];
  const width = device === 'desktop' ? 1240 : 390;
  const pad = device === 'desktop' ? 72 : 22;

  const ctx: Ctx = { parts: [], y: 0, width, pad, device, mode, theme, motion: [] };

  renderMasthead(ctx);
  renderHero(ctx);
  renderSystems(ctx);
  renderDeliveryPath(ctx);
  renderFooter(ctx);

  const height = Math.ceil(ctx.y);
  const label =
    `${identity.name} — V7.2 architecture-led profile, ${device} ${mode}. ` +
    `Exploded architectural section of five planes — interface (React), application (TypeScript), ` +
    `data (PostgreSQL, Redis, Elasticsearch), delivery (Docker, Kubernetes, Nginx, Apache), ` +
    `runtime (Linux, Ubuntu, Debian) — followed by four systems with concept/built/contribution ` +
    `truth markers and one AI-assisted delivery path with two human gates. Contact: ${footer.contact.split(' · ')[1]}.`;

  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="${esc(label)}">`,
    motionStyle(ctx.motion),
    `<rect x="0" y="0" width="${width}" height="${height}" fill="${theme.bg}"/>`,
    ...ctx.parts,
    `</svg>`,
  ]
    .filter(Boolean)
    .join('\n');

  return { svg, width, height };
}
