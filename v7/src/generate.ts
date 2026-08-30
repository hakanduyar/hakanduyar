// V7.1 visual-proof generator.
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

function esc(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Rough width estimate (px) — authored layout, not font metrics.
function estWidth(s: string, size: number, family: 'serif' | 'mono', bold = false): number {
  const f = family === 'mono' ? 0.55 : bold ? 0.52 : 0.47;
  return s.length * size * f;
}

function wrap(text: string, maxWidth: number, size: number, family: 'serif' | 'mono'): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (estWidth(candidate, size, family) > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
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
  motionParts: string[]; // ids of connection strokes that may resolve
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

// A technology mark, centered on (cx, cy) at pixel size px.
function logo(ctx: Ctx, slug: LogoSlug, cx: number, cy: number, px: number) {
  const mark = logoMarks[slug];
  const fill = logoFill[slug]?.[ctx.mode] ?? ctx.theme.ink;
  const s = px / 24;
  const tx = +(cx - px / 2).toFixed(2);
  const ty = +(cy - px / 2).toFixed(2);
  ctx.parts.push(
    `<g data-logo="${slug}" data-px="${px}" transform="translate(${tx} ${ty}) scale(${+s.toFixed(4)})">` +
      `<path fill="${fill}" d="${mark.path}"/></g>`,
  );
}

function kicker(ctx: Ctx, label: string, opts?: { rule?: boolean }) {
  const small = ctx.device === 'mobile';
  mono(ctx, ctx.pad, ctx.y, label, {
    size: small ? 9 : 11,
    weight: 700,
    fill: ctx.theme.muted,
    ls: small ? '0.12em' : '0.16em',
  });
  ctx.y += small ? 10 : 12;
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
  ctx.y = d ? 70 : 46;
  mono(ctx, ctx.pad, ctx.y, identity.kicker, {
    size: d ? 11 : 8.5,
    weight: 700,
    fill: theme.muted,
    ls: d ? '0.18em' : '0.12em',
  });
  ctx.y += d ? 54 : 38;
  serif(ctx, ctx.pad, ctx.y, identity.name, { size: d ? 52 : 33, weight: 700, fill: theme.ink });
  ctx.y += d ? 34 : 26;
  const roleLines = wrap(identity.role, ctx.width - ctx.pad * 2 - (d ? 120 : 0), d ? 16.5 : 12.5, 'serif');
  for (const l of roleLines) {
    serif(ctx, ctx.pad, ctx.y, l, { size: d ? 16.5 : 12.5, fill: theme.muted });
    ctx.y += d ? 24 : 18;
  }
  ctx.y += d ? 10 : 8;
  line(ctx, ctx.pad, ctx.y, ctx.width - ctx.pad, ctx.y, theme.ink, 1.25);
  ctx.y += d ? 52 : 36;
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
  ctx.y += d ? 26 : 20;

  const cfg = d
    ? { cx: 470, halfW: 252, halfH: 118, gapPrimary: 248, gap: 186, logoPrimary: 92, logoSmall: 32, stemScale: 1, annX: 936, leadGap: 12 }
    : { cx: 148, halfW: 124, halfH: 58, gapPrimary: 132, gap: 106, logoPrimary: 50, logoSmall: 19, stemScale: 0.62, annX: 298, leadGap: 8 };

  // First plane center must clear the tallest pin above it (the primary mark).
  const topClear = cfg.logoPrimary + pinLayout.interface![0]!.stem * cfg.stemScale + cfg.halfH * 0.2 + (d ? 26 : 16);
  const cys: number[] = [];
  let cy = ctx.y + topClear;
  for (let i = 0; i < architecture.length; i++) {
    cys.push(cy);
    const next = architecture[i + 1];
    if (next) cy += next.marks.some((m) => m.primary) ? cfg.gapPrimary : cfg.gap;
  }
  const lastCy = cys[cys.length - 1]!;
  const heroBottom = lastCy + cfg.halfH + (d ? 30 : 20);

  // Central axis + side rails (the V6 exploded-section skeleton).
  line(ctx, cfg.cx, ctx.y - (d ? 8 : 4), cfg.cx, heroBottom, theme.rail, 1);
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
      size: d ? 12 : 8.5,
      weight: 600,
      fill: theme.ink,
      anchor: 'middle',
      ls: d ? '0.22em' : '0.16em',
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
      const size = mark.primary ? cfg.logoPrimary : cfg.logoSmall * spec.s;
      const stem = spec.stem * cfg.stemScale;
      // Ground contact + stem + mark.
      ctx.parts.push(`<ellipse cx="${ax}" cy="${ay}" rx="${d ? 7 : 4}" ry="${d ? 2.8 : 1.7}" fill="none" stroke="${theme.rail}" stroke-width="1"/>`);
      const stemId = `st-${plane.id}-${mark.slug}-${ctx.device}`;
      line(ctx, ax, ay - (d ? 2.4 : 1.5), ax, ay - stem, theme.muted, 1, `class="resolve" id="${stemId}"`);
      ctx.motionParts.push(stemId);
      logo(ctx, mark.slug, ax, ay - stem - size / 2 - (d ? 4 : 2), size);
      // Name, set on the plane surface just below the contact point.
      mono(ctx, ax, ay + (mark.primary ? (d ? 20 : 13) : d ? 15 : 10), mark.name, {
        size: mark.primary ? (d ? 11.5 : 8.5) : d ? 9.5 : 7,
        weight: mark.primary ? 700 : 400,
        fill: mark.primary ? theme.ink : theme.muted,
        anchor: 'middle',
        ls: mark.primary ? '0.08em' : undefined,
      });
    }

    // Right-margin role annotation with leader line.
    const leadStart = cx + halfW + cfg.leadGap;
    const leadEnd = cfg.annX - (d ? 14 : 8);
    const leadId = `ld-${plane.id}-${ctx.device}`;
    line(ctx, leadStart, pcy, leadEnd, pcy, theme.hair, 1, `class="resolve" id="${leadId}"`);
    ctx.motionParts.push(leadId);
    // Wrap role notes on their " · " separators so no line orphans a dot.
    const roleLines = d
      ? [plane.roleNote]
      : (() => {
          const maxW = ctx.width - ctx.pad - cfg.annX;
          const segs = plane.roleNote.split(' · ');
          const lines: string[] = [];
          let cur = '';
          for (const seg of segs) {
            const cand = cur ? `${cur} · ${seg}` : seg;
            if (estWidth(cand, 8.5, 'mono') > maxW && cur) {
              lines.push(cur);
              cur = seg;
            } else {
              cur = cand;
            }
          }
          if (cur) lines.push(cur);
          return lines;
        })();
    let ry = pcy - ((roleLines.length - 1) * (d ? 0 : 12)) / 2 + (d ? 3.5 : 3);
    for (const rl of roleLines) {
      mono(ctx, cfg.annX, ry, rl, { size: d ? 11.5 : 8.5, fill: theme.muted });
      ry += d ? 16 : 12;
    }
  });

  ctx.y = heroBottom + (d ? 56 : 40);
}

/* ------------------------------------------------------------------ */
/* Selected systems — editorial ledger, not cards                      */
/* ------------------------------------------------------------------ */

function markerGlyph(ctx: Ctx, x: number, y: number, entry: SystemEntry): number {
  const t = ctx.theme;
  const s = 8; // glyph box
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
  mono(ctx, x + s + 7, y, label, { size: ctx.device === 'desktop' ? 10.5 : 9, weight: 700, fill: t.ink, ls: '0.1em' });
  return x + s + 7 + estWidth(label, ctx.device === 'desktop' ? 10.5 : 9, 'mono');
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
  mono(ctx, x + w / 2, mid + 16, 'not built — direction', { size: 8.5, fill: t.faint, anchor: 'middle' });
}

function renderSystems(ctx: Ctx) {
  const { theme } = ctx;
  const d = ctx.device === 'desktop';
  kicker(ctx, d ? 'SELECTED SYSTEMS — FOUR, IN ORDER, WITH TRUTH MARKERS' : 'SELECTED SYSTEMS — TRUTH MARKERS');
  ctx.y += d ? 34 : 26;

  const bodyX = d ? ctx.pad + 70 : ctx.pad + 44;
  const logoZoneW = d ? 250 : 0; // desktop reserves a right zone for marks
  const bodyW = ctx.width - ctx.pad - bodyX - (d ? logoZoneW + 40 : 0);

  systems.forEach((entry, i) => {
    const top = ctx.y;
    // Index numeral
    serif(ctx, ctx.pad, top + (d ? 22 : 16), entry.index, { size: d ? 27 : 20, weight: 400, fill: theme.faint });
    // Name + marker
    serif(ctx, bodyX, top + (d ? 22 : 16), entry.name, { size: d ? 22 : 17, weight: 700, fill: theme.ink });
    const nameEnd = bodyX + estWidth(entry.name, d ? 22 : 17, 'serif', true);
    if (d) {
      markerGlyph(ctx, nameEnd + 20, top + 21, entry);
    } else {
      markerGlyph(ctx, bodyX, top + 34, entry);
    }
    let ly = top + (d ? 48 : 52);
    const sumLines = wrap(entry.summary, bodyW, d ? 14.5 : 12, 'serif');
    for (const l of sumLines) {
      serif(ctx, bodyX, ly, l, { size: d ? 14.5 : 12, fill: theme.text });
      ly += d ? 20 : 16;
    }
    ly += d ? 6 : 4;
    const bndLines = wrap(`BOUNDARY — ${entry.boundary}`, bodyW, d ? 10.5 : 9, 'mono');
    for (const l of bndLines) {
      mono(ctx, bodyX, ly, l, { size: d ? 10.5 : 9, fill: theme.muted });
      ly += d ? 15 : 13;
    }

    // Technology marks for this system.
    if (d) {
      const zoneRight = ctx.width - ctx.pad;
      if (entry.marks.length === 0) {
        conceptGlyph(ctx, zoneRight - 200, top + 26, 160);
      } else {
        const step = 84;
        const firstCx = zoneRight - 30 - (entry.marks.length - 1) * step;
        entry.marks.forEach((m, j) => {
          const mcx = firstCx + j * step;
          logo(ctx, m.slug, mcx, top + 22, 24);
          mono(ctx, mcx, top + 48, m.name, { size: 8.5, fill: theme.faint, anchor: 'middle' });
        });
      }
    } else if (entry.marks.length > 0) {
      let mx = bodyX + 10;
      entry.marks.forEach((m) => {
        logo(ctx, m.slug, mx, ly + 8, 17);
        mono(ctx, mx + 13, ly + 12, m.name, { size: 8.5, fill: theme.faint });
        mx += 26 + estWidth(m.name, 8.5, 'mono') + 22;
      });
      ly += 26;
    }

    ctx.y = Math.max(ly, top + (d ? 64 : 56)) + (d ? 18 : 14);
    if (i < systems.length - 1) {
      line(ctx, ctx.pad, ctx.y, ctx.width - ctx.pad, ctx.y, theme.hair, 1);
      ctx.y += d ? 26 : 20;
    }
  });
  ctx.y += d ? 48 : 34;
}

/* ------------------------------------------------------------------ */
/* Delivery path — one integrated system path                          */
/* ------------------------------------------------------------------ */

function renderDeliveryPath(ctx: Ctx) {
  const { theme } = ctx;
  const d = ctx.device === 'desktop';
  kicker(ctx, deliveryPath.kicker);
  ctx.y += d ? 58 : 26;

  const nodes = deliveryPath.nodes;
  const idxFrom = nodes.findIndex((n) => n.label === deliveryPath.repair.from);
  const idxTo = nodes.findIndex((n) => n.label === deliveryPath.repair.to);

  if (d) {
    const x0 = ctx.pad + 30;
    const x1 = ctx.width - ctx.pad - 30;
    const py = ctx.y + 14;
    const step = (x1 - x0) / (nodes.length - 1);
    line(ctx, x0 - 22, py, x1 + 22, py, theme.ink, 1.25);
    ctx.parts.push(`<path d="M${x1 + 22} ${py} l-6 -4 v8 Z" fill="${theme.ink}"/>`);
    nodes.forEach((n, i) => {
      const nx = x0 + i * step;
      if (n.humanGate) {
        ctx.parts.push(`<rect x="${nx - 5.6}" y="${py - 5.6}" width="11.2" height="11.2" transform="rotate(45 ${nx} ${py})" fill="${theme.bg}" stroke="${theme.ink}" stroke-width="1.4"/>`);
      } else {
        ctx.parts.push(`<circle cx="${nx}" cy="${py}" r="4.4" fill="${theme.bg}" stroke="${theme.ink}" stroke-width="1.4"/>`);
      }
      mono(ctx, nx, py - 18, n.label, { size: 11, weight: 700, fill: theme.ink, anchor: 'middle', ls: '0.08em' });
      const below = n.humanGate ? 'HUMAN GATE' : n.note;
      if (below) {
        mono(ctx, nx, py + 26, below, {
          size: 9,
          weight: n.humanGate ? 700 : 400,
          fill: n.humanGate ? theme.ink : theme.faint,
          anchor: 'middle',
          ls: n.humanGate ? '0.1em' : undefined,
        });
      }
    });
    // Repair return: review -> implement.
    const fx = x0 + idxFrom * step;
    const tx = x0 + idxTo * step;
    const dip = py + 58;
    const repairId = `rp-${ctx.device}`;
    ctx.parts.push(
      `<path id="${repairId}" class="resolve" d="M${fx} ${py + 34} C ${fx} ${dip}, ${tx} ${dip}, ${tx} ${py + 12}" fill="none" stroke="${theme.muted}" stroke-width="1" stroke-dasharray="4,3"/>`,
    );
    ctx.parts.push(`<path d="M${tx} ${py + 10} l-3.6 5.4 h7.2 Z" fill="${theme.muted}"/>`);
    mono(ctx, (fx + tx) / 2, dip + 16, deliveryPath.repair.label, { size: 9.5, fill: theme.muted, anchor: 'middle' });
    ctx.y = dip + 34;
  } else {
    const lx = ctx.pad + 16;
    const step = 50;
    const py0 = ctx.y + 6;
    const py1 = py0 + (nodes.length - 1) * step;
    line(ctx, lx, py0 - 16, lx, py1 + 18, theme.ink, 1.25);
    ctx.parts.push(`<path d="M${lx} ${py1 + 18} l-4 -6 h8 Z" fill="${theme.ink}"/>`);
    nodes.forEach((n, i) => {
      const ny = py0 + i * step;
      if (n.humanGate) {
        ctx.parts.push(`<rect x="${lx - 5}" y="${ny - 5}" width="10" height="10" transform="rotate(45 ${lx} ${ny})" fill="${theme.bg}" stroke="${theme.ink}" stroke-width="1.3"/>`);
      } else {
        ctx.parts.push(`<circle cx="${lx}" cy="${ny}" r="4" fill="${theme.bg}" stroke="${theme.ink}" stroke-width="1.3"/>`);
      }
      mono(ctx, lx + 22, ny + 3.5, n.label, { size: 10.5, weight: 700, fill: theme.ink, ls: '0.06em' });
      const below = n.humanGate ? 'HUMAN GATE' : n.note;
      if (below) {
        mono(ctx, lx + 22 + estWidth(n.label, 10.5, 'mono') + 14, ny + 3.5, below, {
          size: 8.5,
          weight: n.humanGate ? 700 : 400,
          fill: n.humanGate ? theme.ink : theme.faint,
        });
      }
    });
    // Repair return on the right side.
    const fy = py0 + idxFrom * step;
    const ty = py0 + idxTo * step;
    const bulge = ctx.width - ctx.pad - 24;
    ctx.parts.push(
      `<path class="resolve" id="rp-${ctx.device}" d="M${lx + 150} ${fy} C ${bulge} ${fy}, ${bulge} ${ty}, ${lx + 165} ${ty}" fill="none" stroke="${theme.muted}" stroke-width="1" stroke-dasharray="4,3"/>`,
    );
    ctx.parts.push(`<path d="M${lx + 162} ${ty} l6 -3.6 v7.2 Z" fill="${theme.muted}"/>`);
    mono(ctx, bulge - 2, (fy + ty) / 2 + 3, deliveryPath.repair.label, { size: 8.5, fill: theme.muted, anchor: 'end' });
    ctx.y = py1 + 40;
  }
  ctx.y += d ? 30 : 22;
}

/* ------------------------------------------------------------------ */
/* Footer                                                              */
/* ------------------------------------------------------------------ */

function renderFooter(ctx: Ctx) {
  const { theme } = ctx;
  const d = ctx.device === 'desktop';
  line(ctx, ctx.pad, ctx.y, ctx.width - ctx.pad, ctx.y, theme.hair, 1);
  ctx.y += d ? 24 : 18;
  if (d) {
    mono(ctx, ctx.pad, ctx.y, footer.left, { size: 10, fill: theme.faint });
    mono(ctx, ctx.width - ctx.pad, ctx.y, footer.right, { size: 10, fill: theme.faint, anchor: 'end' });
    ctx.y += 20;
  } else {
    for (const s of [footer.left, footer.right]) {
      for (const l of wrap(s, ctx.width - ctx.pad * 2, 8.5, 'mono')) {
        mono(ctx, ctx.pad, ctx.y, l, { size: 8.5, fill: theme.faint });
        ctx.y += 13;
      }
      ctx.y += 4;
    }
  }
  ctx.y += d ? 26 : 16;
}

/* ------------------------------------------------------------------ */

// Motion: connections (pin stems, leader lines, repair return) resolve once.
// The base attribute state is the fully-resolved drawing, so any renderer
// that ignores CSS (librsvg/sharp for the PNG proof) and any viewer with
// prefers-reduced-motion set sees the identical final image with zero loss.
function motionStyle(ids: string[]): string {
  if (ids.length === 0) return '';
  const delays = ids
    .map((id, i) => `#${esc(id)}{animation-delay:${(i * 60) / 1000}s}`)
    .join('');
  return (
    `<style>` +
    `@media (prefers-reduced-motion: no-preference){` +
    `.resolve{stroke-dasharray:420;stroke-dashoffset:420;animation:v7resolve 0.9s ease-out forwards}` +
    delays +
    `@keyframes v7resolve{to{stroke-dashoffset:0}}` +
    `}` +
    `</style>`
  );
}

export function generateVariant(mode: Mode, device: Device): { svg: string; width: number; height: number } {
  const theme = themes[mode];
  const width = device === 'desktop' ? 1240 : 430;
  const pad = device === 'desktop' ? 72 : 26;

  const ctx: Ctx = { parts: [], y: 0, width, pad, device, mode, theme, motionParts: [] };

  renderMasthead(ctx);
  renderHero(ctx);
  renderSystems(ctx);
  renderDeliveryPath(ctx);
  renderFooter(ctx);

  const height = Math.ceil(ctx.y);
  const label =
    `${identity.name} — V7.1 architecture-led profile, ${device} ${mode}. ` +
    `Exploded architectural section of five planes — interface (React), application (TypeScript), ` +
    `data (PostgreSQL, Redis, Elasticsearch), delivery (Docker, Kubernetes, Nginx, Apache), ` +
    `runtime (Linux, Ubuntu, Debian) — followed by four systems with concept/built/contribution ` +
    `truth markers and one AI-assisted delivery path with two human gates.`;

  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="${esc(label)}">`,
    motionStyle(ctx.motionParts),
    `<rect x="0" y="0" width="${width}" height="${height}" fill="${theme.bg}"/>`,
    ...ctx.parts,
    `</svg>`,
  ]
    .filter(Boolean)
    .join('\n');

  return { svg, width, height };
}
