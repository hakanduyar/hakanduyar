import { svgDocument } from '../svg.js';
import { CAPABILITY_TIERS, V5_PROFILE, V5_PROJECTS, type V5Project } from './content.js';
import {
  baseStyle,
  blend,
  circle,
  logo,
  monoLabel,
  multiline,
  path,
  plate,
  rect,
  rule,
  sectionHeading,
  txt,
} from './draw.js';
import { BRAND, type V5Theme } from './theme.js';

export type ProjectKey = V5Project['key'];

interface MotionOptions {
  compact?: boolean;
  progress?: number;
}

function doc(theme: V5Theme, width: number, height: number, id: string, title: string, description: string, body: string): string {
  return svgDocument({ width, height, id, title, description, background: theme.bg, body: `${baseStyle()}${body}` });
}

function techAnchor(
  theme: V5Theme,
  name: Parameters<typeof logo>[0],
  label: string,
  caption: string,
  x: number,
  y: number,
  size: number,
  brand: string,
): string {
  const markSize = Math.round(size * .55);
  return [
    plate(theme, x, y, size, brand),
    logo(name, x + (size - markSize) / 2, y + (size - markSize) / 2, markSize, theme),
    txt(x, y + size + 21, label, { size: Math.max(12, Math.round(size / 7.5)), weight: 650, fill: theme.ink }),
    txt(x, y + size + 39, caption, { size: 10.5, family: 'mono', weight: 550, fill: theme.muted, spacing: .25 }),
  ].join('');
}

export function renderIdentity(theme: V5Theme, compact = false): string {
  const width = compact ? 480 : 880;
  const height = compact ? 780 : 520;
  const out: string[] = [];

  if (compact) {
    out.push(rect(16, 16, 448, 748, theme.sheet, theme.rule2));
    out.push(txt(34, 46, V5_PROFILE.name, { size: 19, weight: 670, fill: theme.ink, spacing: -.5 }));
    out.push(monoLabel(446, 44, 'Engineering brief · 05', theme, theme.faint, 'end'));
    out.push(rule(34, 66, 446, 66, theme.ink, 2));
    out.push(monoLabel(34, 100, 'Primary positioning', theme, theme.flow));
    out.push(multiline(34, 145, ['Front-end &', 'Systems Engineering.'], {
      size: 39,
      lineHeight: 43,
      weight: 660,
      fill: theme.ink,
      spacing: -1.7,
    }));
    out.push(multiline(34, 244, [
      'Product interfaces, application architecture,',
      'service and data boundaries, modern delivery.',
    ], { size: 13.5, lineHeight: 21, fill: theme.muted }));

    const rows = [
      ['DEPTH', 'React · TypeScript · frontend systems'],
      ['BREADTH', 'Node · data · Docker · CI/CD · Linux'],
      ['AI', 'Planned, reviewed, verified, human-gated'],
    ] as const;
    let rowY = 306;
    for (const [key, value] of rows) {
      out.push(rect(34, rowY, 412, 48, theme.sheet2, theme.rule));
      out.push(monoLabel(48, rowY + 20, key, theme, key === 'AI' ? theme.authority : theme.faint));
      out.push(txt(135, rowY + 21, value, { size: 11.5, weight: 580, fill: theme.ink }));
      rowY += 54;
    }

    out.push(monoLabel(34, 495, 'Technology hierarchy · size encodes weight', theme));
    out.push(rule(34, 513, 446, 513, theme.rule2));
    out.push(techAnchor(theme, 'react', 'React', 'INTERFACE', 34, 534, 78, BRAND.react));
    out.push(techAnchor(theme, 'typescript', 'TypeScript', 'LANGUAGE', 128, 534, 78, BRAND.typescript));
    out.push(techAnchor(theme, 'nextjs', 'Next.js', 'APPLICATION', 244, 544, 60, theme.next));
    out.push(techAnchor(theme, 'nodejs', 'Node.js', 'SERVICES', 330, 552, 52, BRAND.node));
    out.push(techAnchor(theme, 'postgresql', 'PostgreSQL', 'DATA', 34, 664, 48, BRAND.postgresql));
    out.push(techAnchor(theme, 'docker', 'Docker', 'PLATFORM', 132, 672, 40, BRAND.docker));
    out.push(txt(244, 697, 'Architecture is the organizing principle.', { size: 12.5, weight: 620, fill: theme.ink }));
    out.push(txt(244, 719, 'Logos are evidence anchors, not a badge wall.', { size: 11.5, fill: theme.muted }));
  } else {
    out.push(rect(20, 18, 840, 484, theme.sheet, theme.rule2));
    out.push(txt(38, 48, V5_PROFILE.name, { size: 21, weight: 670, fill: theme.ink, spacing: -.6 }));
    out.push(txt(38, 68, V5_PROFILE.role, { size: 12.5, weight: 590, fill: theme.muted }));
    out.push(monoLabel(842, 46, 'Engineering brief · architecture first', theme, theme.faint, 'end'));
    out.push(monoLabel(842, 66, 'Public evidence · 2026', theme, theme.muted, 'end'));
    out.push(rule(38, 88, 842, 88, theme.ink, 2));

    out.push(monoLabel(38, 120, 'Primary positioning', theme, theme.flow));
    out.push(multiline(38, 167, ['Front-end & Systems', 'Engineering.'], {
      size: 48,
      lineHeight: 49,
      weight: 660,
      fill: theme.ink,
      spacing: -2.1,
    }));
    out.push(multiline(38, 286, [
      'Product interfaces and the systems behind them —',
      'state, services, persistence, delivery, and governed AI.',
    ], { size: 14.5, lineHeight: 22, fill: theme.muted }));

    const bx = 560;
    const bw = 282;
    const briefRows = [
      ['CORE DEPTH', 'React · TypeScript · architecture'],
      ['APPLIED BREADTH', 'Node · API · PostgreSQL · local-first'],
      ['DELIVERY', 'Docker · CI/CD · Linux'],
      ['PRINCIPLE', 'Agents work. Human release.'],
    ] as const;
    briefRows.forEach(([key, value], index) => {
      const y = 123 + index * 49;
      out.push(rule(bx, y - 9, bx + bw, y - 9, index === 0 ? theme.rule2 : theme.rule));
      out.push(monoLabel(bx, y + 8, key, theme, key === 'PRINCIPLE' ? theme.authority : theme.faint));
      out.push(txt(bx + 112, y + 8, value, { size: 10.7, weight: 560, fill: key === 'PRINCIPLE' ? theme.ink : theme.muted }));
    });
    out.push(rule(bx, 310, bx + bw, 310, theme.rule));

    out.push(monoLabel(38, 349, 'Technology hierarchy · scale encodes emphasis', theme));
    out.push(rule(38, 365, 842, 365, theme.rule2));
    const flowY = 408;
    out.push(rule(72, flowY, 781, flowY, theme.rule2));
    for (const x of [72, 179, 325, 454, 570, 696]) out.push(circle(x, flowY, 3, theme.flow));
    out.push(techAnchor(theme, 'react', 'React', 'INTERFACE', 38, 377, 78, BRAND.react));
    out.push(techAnchor(theme, 'typescript', 'TypeScript', 'LANGUAGE', 136, 377, 78, BRAND.typescript));
    out.push(techAnchor(theme, 'nextjs', 'Next.js', 'APPLICATION', 282, 386, 62, theme.next));
    out.push(techAnchor(theme, 'nodejs', 'Node.js', 'SERVICES', 424, 393, 50, BRAND.node));
    out.push(techAnchor(theme, 'postgresql', 'PostgreSQL', 'DATA', 548, 393, 50, BRAND.postgresql));
    out.push(techAnchor(theme, 'docker', 'Docker', 'PLATFORM', 678, 399, 40, BRAND.docker));
  }

  return doc(
    theme,
    width,
    height,
    compact ? 'v5-identity-mobile' : 'v5-identity',
    `${V5_PROFILE.name} — ${V5_PROFILE.role}`,
    'Architecture-first engineering identity with React and TypeScript as the largest technology anchors, followed by Next.js, Node.js, PostgreSQL, and Docker.',
    out.join(''),
  );
}

const ARCH_LAYERS = [
  { index: '1', name: 'Interface', sub: 'User-facing behavior', owns: ['React', 'Components and interactions'], contract: ['Typed component APIs', 'Props · states · semantics'], evidence: ['Browser + a11y checks', 'Rendered behavior is inspected'], ai: 'Drafts components; a person reads the diff.' },
  { index: '2', name: 'Application', sub: 'Product decisions', owns: ['Next.js · state', 'Routing · query · forms'], contract: ['Server / client split', 'Explicit state ownership'], evidence: ['Reproducible state', 'Export/import restores intent'], ai: 'Plans the work before code is written.' },
  { index: '3', name: 'Services', sub: 'Rules and boundaries', owns: ['Node.js', 'Express / NestJS rules'], contract: ['REST · JWT', 'Role-aware route checks'], evidence: ['Integration tests', 'Exercise the API path'], ai: 'Runs fixed verification commands.' },
  { index: '4', name: 'Data', sub: 'Durable truth', owns: ['PostgreSQL', 'Transactional persistence'], contract: ['Prisma · Dexie', 'Typed and versioned schemas'], evidence: ['Migrations are history', 'Recoverable upgrades'], ai: 'Independent review reads schema changes.' },
  { index: '5', name: 'Platform', sub: 'Repeatable runtime', owns: ['Docker · Compose', 'Packaged environments'], contract: ['CI · Nginx · Linux', 'Pipeline delivery gates'], evidence: ['Same result twice', 'Manifest reproduces runtime'], ai: 'Repair is bounded; release is not delegated.' },
] as const;

function motionPosition(progress: number): { request: { y: number; opacity: number }; evidence: { y: number; opacity: number } } {
  const p = ((progress % 1) + 1) % 1;
  if (p < .47) {
    const t = p / .47;
    return { request: { y: t, opacity: Math.sin(Math.PI * t) }, evidence: { y: 1, opacity: 0 } };
  }
  if (p < .53) return { request: { y: 1, opacity: 0 }, evidence: { y: 1, opacity: 0 } };
  const t = (p - .53) / .47;
  return { request: { y: 1, opacity: 0 }, evidence: { y: 1 - t, opacity: Math.sin(Math.PI * t) } };
}

export function renderArchitecture(theme: V5Theme, options: MotionOptions = {}): string {
  const compact = options.compact ?? false;
  const progress = options.progress ?? 0;
  const width = compact ? 480 : 880;
  const height = compact ? 1190 : 790;
  const out: string[] = [];

  if (compact) {
    out.push(rect(16, 0, 448, 1174, theme.sheet, theme.rule2));
    out.push(sectionHeading(theme, '01', 'Responsibility plan', ['A request descends.', 'Evidence comes back.'], 32, 42, true));
    out.push(multiline(32, 130, ['Five layers. Each names what it owns,', 'the contract it exposes, and the proof it returns.'], { size: 12.5, lineHeight: 19, fill: theme.muted }));
    const cardX = 32;
    const cardW = 416;
    const cardH = 176;
    const startY = 188;
    const railX = 50;
    const railStart = startY + 28;
    const railEnd = startY + cardH * 4 + 28;
    out.push(rule(railX, railStart, railX, railEnd, theme.rule2, 2));
    ARCH_LAYERS.forEach((layer, index) => {
      const y = startY + index * cardH;
      const core = index < 2;
      out.push(rect(cardX, y, cardW, cardH - 10, core ? blend(theme.flow, theme.sheet, .07) : theme.sheet2, theme.rule));
      out.push(circle(railX, y + 28, 13, theme.sheet, { stroke: theme.rule2, 'stroke-width': 1 }));
      out.push(txt(railX, y + 32, layer.index, { size: 10, family: 'mono', weight: 700, fill: core ? theme.flow : theme.muted, anchor: 'middle' }));
      out.push(monoLabel(76, y + 26, layer.name, theme, core ? theme.flow : theme.ink));
      out.push(txt(76, y + 47, layer.sub, { size: 11.5, fill: theme.faint }));
      const fields = [
        ['OWNS', layer.owns],
        ['CONTRACT', layer.contract],
        ['EVIDENCE', layer.evidence],
      ] as const;
      fields.forEach(([key, values], fieldIndex) => {
        const fx = 76 + (fieldIndex % 2) * 178;
        const fy = y + 80 + Math.floor(fieldIndex / 2) * 53;
        out.push(monoLabel(fx, fy, key, theme));
        out.push(txt(fx, fy + 19, values[0], { size: 11.5, weight: 630, fill: theme.ink }));
        out.push(txt(fx, fy + 36, values[1], { size: 10.3, fill: theme.muted }));
      });
      out.push(txt(254, y + 150, layer.ai, { size: 10.2, fill: theme.muted }));
    });
    const motion = motionPosition(progress);
    out.push(circle(railX, railStart + (railEnd - railStart) * motion.request.y, 5.5, theme.flow, { opacity: motion.request.opacity }));
    out.push(circle(railX, railStart + (railEnd - railStart) * motion.evidence.y, 5.5, theme.authority, { opacity: motion.evidence.opacity }));
    out.push(rect(32, 1080, 416, 70, theme.sheet2, undefined));
    out.push(rect(32, 1080, 3, 70, theme.authority));
    out.push(multiline(48, 1105, ['Request ↓ moves toward runtime.', 'Evidence ↑ returns to the human release gate.'], { size: 11.5, lineHeight: 20, weight: 590, fill: theme.ink }));
    out.push(circle(422, 1101, 4, theme.flow));
    out.push(circle(422, 1125, 4, theme.authority));
  } else {
    out.push(rect(20, 0, 840, 774, theme.sheet, theme.rule2));
    out.push(sectionHeading(theme, '01', 'Responsibility plan', ['A request descends the layers.', 'Evidence returns to the decision.'], 38, 44));
    out.push(multiline(548, 67, ['Architecture is a responsibility map:', 'ownership, contract, evidence, and authority.'], { size: 12.5, lineHeight: 19, fill: theme.muted }));

    const x = 38;
    const y = 153;
    const widths = [42, 142, 197, 197, 226] as const;
    const headerH = 45;
    const rowH = 95;
    const tableW = widths.reduce((sum, value) => sum + value, 0);
    out.push(rect(x, y, tableW, headerH + ARCH_LAYERS.length * rowH, theme.sheet, theme.rule2));
    out.push(rect(x, y, tableW, headerH, theme.sheet2));
    const headers = ['', 'LAYER', 'OWNS', 'CONTRACT', 'EVIDENCE / AI PARTICIPATION'];
    let hx = x;
    headers.forEach((header, index) => {
      if (index > 0) out.push(monoLabel(hx + 13, y + 27, header, theme));
      hx += widths[index] ?? 0;
      if (index < widths.length - 1) out.push(rule(hx, y, hx, y + headerH + ARCH_LAYERS.length * rowH, theme.rule));
    });
    const railX = x + 21;
    const railStart = y + headerH + rowH / 2;
    const railEnd = y + headerH + rowH * 4 + rowH / 2;
    out.push(rule(railX, railStart, railX, railEnd, theme.rule2, 2));
    ARCH_LAYERS.forEach((layer, index) => {
      const rowY = y + headerH + index * rowH;
      if (index < 2) out.push(rect(x + widths[0], rowY, widths[1], rowH, blend(theme.flow, theme.sheet, .07)));
      if (index > 0) out.push(rule(x, rowY, x + tableW, rowY, theme.rule));
      out.push(circle(railX, rowY + rowH / 2, 11.5, theme.sheet, { stroke: theme.rule2, 'stroke-width': 1 }));
      out.push(txt(railX, rowY + rowH / 2 + 3.5, layer.index, { size: 9.5, family: 'mono', weight: 700, fill: index < 2 ? theme.flow : theme.muted, anchor: 'middle' }));
      let cx = x + widths[0] + 13;
      out.push(monoLabel(cx, rowY + 29, layer.name, theme, index < 2 ? theme.flow : theme.ink));
      out.push(txt(cx, rowY + 52, layer.sub, { size: 10.5, fill: theme.faint }));
      cx += widths[1];
      out.push(txt(cx + 13, rowY + 31, layer.owns[0], { size: 12.2, weight: 650, fill: theme.ink }));
      out.push(txt(cx + 13, rowY + 54, layer.owns[1], { size: 10.4, fill: theme.muted }));
      cx += widths[2];
      out.push(txt(cx + 13, rowY + 31, layer.contract[0], { size: 12.2, weight: 650, fill: theme.ink }));
      out.push(txt(cx + 13, rowY + 54, layer.contract[1], { size: 10.4, fill: theme.muted }));
      cx += widths[3];
      out.push(txt(cx + 13, rowY + 27, layer.evidence[0], { size: 12.2, weight: 650, fill: theme.ink }));
      out.push(txt(cx + 13, rowY + 48, layer.evidence[1], { size: 10.4, fill: theme.muted }));
      out.push(txt(cx + 13, rowY + 71, layer.ai, { size: 9.7, fill: theme.faint }));
    });
    const motion = motionPosition(progress);
    out.push(circle(railX, railStart + (railEnd - railStart) * motion.request.y, 5.5, theme.flow, { opacity: motion.request.opacity }));
    out.push(circle(railX, railStart + (railEnd - railStart) * motion.evidence.y, 5.5, theme.authority, { opacity: motion.evidence.opacity }));
    out.push(rect(38, 690, 804, 58, theme.sheet2));
    out.push(rect(38, 690, 3, 58, theme.authority));
    out.push(txt(54, 718, 'A request descends. Evidence climbs back to the person who decides the release.', { size: 11.8, weight: 600, fill: theme.ink }));
    out.push(circle(676, 716, 4, theme.flow));
    out.push(monoLabel(688, 720, 'Request', theme, theme.muted));
    out.push(circle(766, 716, 4, theme.authority));
    out.push(monoLabel(778, 720, 'Evidence', theme, theme.muted));
  }

  return doc(
    theme,
    width,
    height,
    compact ? 'v5-architecture-mobile' : 'v5-architecture',
    'Engineering responsibility architecture',
    'Five responsibility layers connect interface, application, services, data, and platform. A request moves down; evidence returns to a human release decision.',
    out.join(''),
  );
}

function layerSpine(theme: V5Theme, project: V5Project, x: number, y: number, span = project.span): string {
  const letters = ['I', 'A', 'S', 'D', 'P'];
  const parts: string[] = [];
  letters.forEach((letter, index) => {
    const active = project.occupied.includes(index);
    parts.push(rect(x + index * 31, y, 27, 22, active ? theme.flow : theme.sheet2, active ? theme.flow : theme.rule2));
    parts.push(txt(x + index * 31 + 13.5, y + 15, letter, { size: 9.5, family: 'mono', weight: 700, fill: active ? theme.bg : theme.faint, anchor: 'middle' }));
  });
  parts.push(monoLabel(x + 172, y + 15, span, theme, theme.muted));
  return parts.join('');
}

function projectPath(theme: V5Theme, project: V5Project, x: number, y: number, width: number, compact: boolean): string {
  const parts: string[] = [];
  if (compact) {
    const compactDetails: Record<ProjectKey, readonly string[]> = {
      factory: [],
      spark: ['Feature views · transactional actions', 'Reactive compound-index reads', 'Versioned persistence · v1 → v8'],
      layers: ['Gray Matter + Zod frontmatter', 'Invalid content fails the build', 'RSC + SSG · progressive enhancement'],
      ledger: ['Book · member · invitation models', 'Owner / editor / viewer checks', 'Accounts · categories · tags by book'],
    };
    project.path.forEach((item, index) => {
      const py = y + index * 67;
      parts.push(rect(x, py, width, 57, theme.sheet2, theme.rule));
      parts.push(monoLabel(x + 13, py + 20, `0${index + 1}`, theme));
      parts.push(txt(x + 51, py + 21, item.title, { size: 11.8, weight: 650, fill: theme.ink }));
      parts.push(txt(x + 51, py + 41, compactDetails[project.key][index] ?? item.detail, { size: 10.2, fill: theme.muted }));
    });
  } else {
    const gap = 8;
    const cardW = (width - gap * 2) / 3;
    project.path.forEach((item, index) => {
      const px = x + index * (cardW + gap);
      parts.push(rect(px, y, cardW, 72, theme.sheet2, theme.rule));
      parts.push(monoLabel(px + 13, y + 21, `0${index + 1}`, theme));
      parts.push(txt(px + 13, y + 43, item.title, { size: 11.8, weight: 650, fill: theme.ink }));
      parts.push(txt(px + 13, y + 61, item.detail, { size: 9.3, fill: theme.muted }));
      if (index > 0) {
        parts.push(path(`M${px - 6} ${y + 36}l4 -4v8z`, { fill: theme.rule2 }));
      }
    });
  }
  return parts.join('');
}

function projectNotes(theme: V5Theme, project: V5Project, x: number, y: number, width: number, compact: boolean): string {
  const parts: string[] = [];
  if (compact) {
    project.notes.forEach((note, index) => {
      const ny = y + index * 61;
      if (index > 0) parts.push(rule(x, ny, x + width, ny, theme.rule));
      parts.push(monoLabel(x, ny + 19, note.key, theme));
      parts.push(txt(x + 113, ny + 20, note.title, { size: 10.8, weight: 650, fill: theme.ink }));
      parts.push(txt(x + 113, ny + 39, note.detail, { size: 9.9, fill: theme.muted }));
    });
  } else {
    const colW = width / 3;
    project.notes.forEach((note, index) => {
      const nx = x + index * colW;
      if (index > 0) parts.push(rule(nx, y, nx, y + 68, theme.rule));
      parts.push(monoLabel(nx + (index ? 14 : 0), y + 20, note.key, theme));
      parts.push(txt(nx + (index ? 14 : 0), y + 41, note.title, { size: 10.8, weight: 650, fill: theme.ink }));
      parts.push(txt(nx + (index ? 14 : 0), y + 59, note.detail, { size: 9.6, fill: theme.muted }));
    });
  }
  return parts.join('');
}

function factoryDomain(theme: V5Theme, x: number, y: number, width: number, compact: boolean): string {
  const parts: string[] = [];
  const durableH = compact ? 134 : 96;
  const portH = compact ? 60 : 44;
  const workersH = compact ? 112 : 72;
  parts.push(rect(x, y, width, durableH, blend(theme.flow, theme.sheet, .08), theme.rule2));
  parts.push(monoLabel(x + 16, y + 24, 'Durable domain · SQLite', theme, theme.flow));
  const items = compact
    ? ['plans', 'revisions', 'work items', 'runs', 'verification evidence', 'reviews', 'approvals', 'release lineage']
    : ['plans', 'revisions', 'work items', 'runs', 'verification evidence', 'reviews', 'approvals', 'release lineage'];
  let ix = x + 16;
  let iy = y + 42;
  for (const item of items) {
    const itemW = Math.max(50, item.length * 6.2 + 18);
    if (ix + itemW > x + width - 14) {
      ix = x + 16;
      iy += 30;
    }
    parts.push(rect(ix, iy, itemW, 23, theme.sheet, theme.rule2));
    parts.push(txt(ix + 9, iy + 16, item, { size: 9.5, family: 'mono', weight: 600, fill: theme.ink }));
    ix += itemW + 6;
  }
  const portY = y + durableH;
  parts.push(rect(x, portY, width, portH, theme.sheet2, theme.rule2));
  if (compact) {
    parts.push(monoLabel(x + 16, portY + 22, 'Provider-neutral worker ports', theme, theme.muted));
    parts.push(monoLabel(x + 16, portY + 43, 'Domain does not know the vendor', theme, theme.faint));
  } else {
    parts.push(monoLabel(x + 16, portY + 27, 'Provider-neutral worker ports', theme, theme.muted));
    parts.push(monoLabel(x + width - 16, portY + 27, 'Domain does not know the vendor', theme, theme.muted, 'end'));
  }
  const workerY = portY + portH;
  parts.push(rect(x, workerY, width, workersH, theme.sheet, theme.rule2));
  parts.push(monoLabel(x + 16, workerY + 25, 'Disposable workers · process adapters', theme));
  parts.push(rect(x + 16, workerY + 39, 88, 24, theme.sheet2, theme.rule2));
  parts.push(txt(x + 28, workerY + 56, 'Codex CLI', { size: 10.2, family: 'mono', weight: 600, fill: theme.muted }));
  parts.push(rect(x + 111, workerY + 39, 115, 24, theme.sheet2, theme.rule2));
  parts.push(txt(x + 123, workerY + 56, 'Claude Code CLI', { size: 10.2, family: 'mono', weight: 600, fill: theme.muted }));
  if (compact) {
    parts.push(txt(x + 16, workerY + 87, 'Workspace-scoped · default deny · replaceable', { size: 10.2, fill: theme.faint }));
  } else {
    parts.push(txt(x + width - 16, workerY + 56, 'Workspace-scoped · default deny · replaceable', { size: 9.7, fill: theme.faint, anchor: 'end' }));
  }
  return parts.join('');
}

export function renderProject(theme: V5Theme, key: ProjectKey, compact = false): string {
  const project = V5_PROJECTS.find((candidate) => candidate.key === key);
  if (!project) throw new Error(`Unknown V5 project: ${key}`);
  const width = compact ? 480 : 880;
  const heights: Record<ProjectKey, [number, number]> = {
    factory: [680, 1010],
    spark: [480, 760],
    layers: [480, 760],
    ledger: [560, 820],
  };
  const height = heights[key][compact ? 1 : 0];
  const out: string[] = [];
  const margin = compact ? 16 : 20;
  const cardX = compact ? 16 : 20;
  const cardW = width - cardX * 2;
  let cardY = 0;

  if (key === 'factory') {
    const headerH = compact ? 150 : 130;
    out.push(rect(margin, 0, cardW, headerH - 12, theme.bg));
    out.push(sectionHeading(theme, '02', 'Applications', compact ? ['Four systems.', 'Four failure boundaries.'] : ['Four systems, read by the failure', 'each one is built to prevent.'], compact ? 30 : 38, compact ? 38 : 40, compact));
    if (!compact) out.push(multiline(571, 64, ['Constraint → architecture → evidence.', 'Scope limits remain part of the claim.'], { size: 11.8, lineHeight: 18, fill: theme.muted }));
    cardY = headerH;
  }

  out.push(rect(cardX, cardY, cardW, height - cardY, theme.sheet, theme.rule2));
  const innerX = cardX + (compact ? 16 : 18);
  const innerW = cardW - (compact ? 32 : 36);
  const top = cardY + (compact ? 24 : 27);
  if (compact) {
    const compactKinds: Record<ProjectKey, string> = {
      factory: 'Governed agentic control plane',
      spark: 'Local-first React PWA',
      layers: 'Typed content system',
      ledger: 'Backend extension · runtime',
    };
    const compactSpans: Record<ProjectKey, string> = {
      factory: 'Application → platform',
      spark: 'Interface → data · no server',
      layers: 'Interface → platform',
      ledger: 'Services → platform · backend only',
    };
    const compactClaims: Record<ProjectKey, readonly string[]> = {
      factory: ['Agents can produce work.', 'They cannot grant it authority.'],
      spark: ['It keeps working with no account,', 'no server, and no network.'],
      layers: ['Content cannot publish itself', 'past its own contract.'],
      ledger: ['A shared ledger is a permissions', 'problem before it is a screen.'],
    };
    const compactDescriptions: Record<ProjectKey, readonly string[]> = {
      factory: ['A durable control plane separates planning, execution,', 'verification, review, and human release.'],
      spark: ['A React and TypeScript planner where the browser', 'is the database.'],
      layers: ['Typed content with build-time schema gates and', 'checkable accessibility evidence.'],
      ledger: ['Docker/PostgreSQL runtime plus an unreleased', 'shared-book backend extension to upstream code.'],
    };
    out.push(monoLabel(innerX, top, project.index, theme));
    out.push(txt(innerX + 42, top + 2, project.name, { size: key === 'factory' ? 27 : 24, weight: 670, fill: theme.ink, spacing: -.9 }));
    out.push(monoLabel(innerX, top + 32, compactKinds[key], theme, theme.flow));
    out.push(rule(innerX, top + 47, innerX + innerW, top + 47, theme.rule));
    out.push(layerSpine(theme, project, innerX, top + 62, compactSpans[key]));
    out.push(multiline(innerX, top + 114, compactClaims[key], { size: 17, lineHeight: 21, weight: 650, fill: theme.ink, spacing: -.4 }));
    out.push(multiline(innerX, top + 167, compactDescriptions[key], { size: 11.5, lineHeight: 18, fill: theme.muted }));
  } else {
    out.push(monoLabel(innerX, top, project.index, theme));
    out.push(txt(innerX + 42, top + 2, project.name, { size: key === 'factory' ? 30 : 25, weight: 670, fill: theme.ink, spacing: -.9 }));
    out.push(monoLabel(cardX + cardW - 18, top, project.kind, theme, theme.flow, 'end'));
    out.push(rule(innerX, top + 19, innerX + innerW, top + 19, theme.rule));
    out.push(layerSpine(theme, project, innerX, top + 34));
    out.push(txt(innerX, top + 92, project.claim, { size: key === 'factory' ? 21 : 18.5, weight: 650, fill: theme.ink, spacing: -.45 }));
    out.push(multiline(innerX, top + 119, [project.description], { size: 11.8, fill: theme.muted }));
  }

  if (key === 'factory') {
    const domainY = top + (compact ? 208 : 148);
    out.push(factoryDomain(theme, innerX, domainY, innerW, compact));
    const notesY = domainY + (compact ? 306 : 226) + 20;
    out.push(rule(innerX, notesY - 10, innerX + innerW, notesY - 10, theme.rule));
    out.push(projectNotes(theme, project, innerX, notesY, innerW, compact));
    const boundY = notesY + (compact ? 193 : 82);
    out.push(rect(innerX, boundY, innerW, compact ? 70 : 48, theme.sheet2, theme.rule2));
    out.push(rect(innerX, boundY, 3, compact ? 70 : 48, theme.authority));
    out.push(monoLabel(innerX + 16, boundY + 20, 'Not claimed', theme, theme.authority));
    out.push(multiline(innerX + (compact ? 16 : 108), boundY + (compact ? 41 : 21), compact
      ? ['GitHub PR automation · n8n · deployment · publishing.', 'No completed control-room UI is claimed.']
      : [project.boundary.replace('Not claimed: ', '')], { size: compact ? 9.8 : 9.7, fill: theme.muted }));
  } else {
    const pathY = top + (compact ? 208 : 151);
    out.push(projectPath(theme, project, innerX, pathY, innerW, compact));
    const notesY = pathY + (compact ? 218 : 93);
    out.push(rule(innerX, notesY - 8, innerX + innerW, notesY - 8, theme.rule));
    out.push(projectNotes(theme, project, innerX, notesY, innerW, compact));
    const boundY = notesY + (compact ? 195 : 82);
    out.push(rect(innerX, boundY, innerW, compact ? (key === 'ledger' ? 90 : 70) : 48, theme.sheet2, theme.rule2));
    out.push(rect(innerX, boundY, 3, compact ? (key === 'ledger' ? 90 : 70) : 48, theme.authority));
    out.push(monoLabel(innerX + 16, boundY + 20, key === 'ledger' ? 'Inherited / scope boundary' : 'Scope boundary', theme, theme.authority));
    const compactBoundaries: Record<Exclude<ProjectKey, 'factory'>, readonly string[]> = {
      spark: ['No backend, login, cloud sync,', 'or automated test suite is claimed.'],
      layers: ['Architecture proof — deliberately', 'not the subject of the profile.'],
      ledger: ['Upstream engine and Vue UI are not Hakan’s work.', 'No shared-book frontend, selector, or complete invitation flow.'],
    };
    out.push(multiline(innerX + (compact ? 16 : 146), boundY + (compact ? 42 : 21), compact
      ? compactBoundaries[key as Exclude<ProjectKey, 'factory'>]
      : [project.boundary], { size: compact ? 9.7 : 9.5, lineHeight: 17, fill: theme.muted }));
  }

  return doc(
    theme,
    width,
    height,
    `v5-project-${key}${compact ? '-mobile' : ''}`,
    `${project.index} — ${project.name}`,
    `${project.claim} ${project.description} ${project.boundary}`,
    out.join(''),
  );
}

const AI_STEPS = [
  { index: '01', title: 'Specify', detail: 'Objective · constraints · acceptance criteria', actor: 'human' },
  { index: '02', title: 'Plan', detail: 'Dependency graph · deterministic validation', actor: 'agent' },
  { index: '03', title: 'Approve', detail: 'Approval binds to one plan revision', actor: 'human' },
  { index: '04', title: 'Implement', detail: 'Scoped worker · default-deny environment', actor: 'agent' },
  { index: '05', title: 'Verify', detail: 'Fixed command and argv · process facts', actor: 'fixed' },
  { index: '06', title: 'Review', detail: 'Independent principal · fail-closed verdict', actor: 'agent' },
  { index: '07', title: 'Release', detail: 'Content-addressed evidence snapshot', actor: 'human' },
] as const;

function aiStepColor(theme: V5Theme, actor: string): string {
  if (actor === 'human') return theme.authority;
  if (actor === 'agent') return theme.flow;
  return theme.faint;
}

export function renderAiWorkflow(theme: V5Theme, options: MotionOptions = {}): string {
  const compact = options.compact ?? false;
  const progress = ((options.progress ?? 0) % 1 + 1) % 1;
  const activeStep = Math.min(AI_STEPS.length - 1, Math.floor(progress * AI_STEPS.length));
  const width = compact ? 480 : 880;
  const height = compact ? 1060 : 735;
  const out: string[] = [];

  if (compact) {
    out.push(rect(16, 0, 448, 1044, theme.sheet, theme.rule2));
    out.push(sectionHeading(theme, '03', 'AI engineering', ['Agents participate.', 'The system keeps authority.'], 32, 42, true));
    out.push(multiline(32, 131, ['The workflow matters more than tool brands.', 'Providers are adapters; evidence and authority persist.'], { size: 12.2, lineHeight: 19, fill: theme.muted }));
    const posY = 190;
    out.push(rect(32, posY, 416, 146, '#0B0E13', '#3A444F'));
    out.push(monoLabel(50, posY + 26, 'Position', theme, '#9AA5B2'));
    out.push(multiline(50, posY + 59, ['Model confidence is not', 'system evidence.'], { size: 21, lineHeight: 24, weight: 660, fill: '#F2F5F8', spacing: -.5 }));
    out.push(txt(50, posY + 122, 'ZERO AUTONOMOUS RELEASE AUTHORITY', { size: 9.5, family: 'mono', weight: 700, fill: '#D3B36A', spacing: 1 }));

    const listY = 365;
    const rowH = 67;
    const railX = 55;
    out.push(rule(railX, listY + 24, railX, listY + rowH * 6 + 24, theme.rule2, 2));
    AI_STEPS.forEach((step, index) => {
      const y = listY + index * rowH;
      const color = aiStepColor(theme, step.actor);
      const active = index === activeStep;
      out.push(rect(32, y, 416, 57, active ? blend(color, theme.sheet2, .12) : theme.sheet2, active ? color : theme.rule));
      out.push(circle(railX, y + 28, active ? 9 : 6, color, { opacity: active ? 1 : .72 }));
      out.push(monoLabel(76, y + 20, step.index, theme, color));
      out.push(txt(113, y + 22, step.title, { size: 13, weight: 670, fill: theme.ink }));
      out.push(txt(113, y + 42, step.detail, { size: 10.1, fill: theme.muted }));
    });
    const repairY = listY + rowH * 7 + 4;
    out.push(rect(32, repairY, 416, 64, theme.sheet2, theme.rule));
    out.push(monoLabel(48, repairY + 22, 'Repair ↺', theme, theme.flow));
    out.push(multiline(48, repairY + 43, ['Changes required returns to implementation.', 'The loop is bounded.'], { size: 10.2, lineHeight: 16, fill: theme.muted }));
    out.push(rect(32, repairY + 76, 416, 77, theme.sheet2));
    out.push(rect(32, repairY + 76, 3, 77, theme.authority));
    out.push(monoLabel(48, repairY + 99, 'Human release gate', theme, theme.authority));
    out.push(multiline(48, repairY + 121, ['A newer implementation invalidates prior evidence.', 'Nothing carries forward on reputation.'], { size: 10.5, lineHeight: 17, weight: 580, fill: theme.ink }));
  } else {
    out.push(rect(20, 0, 840, 719, theme.sheet, theme.rule2));
    out.push(sectionHeading(theme, '03', 'AI engineering', ['Agents participate.', 'The system keeps authority.'], 38, 44));
    out.push(multiline(556, 68, ['Providers are replaceable adapters.', 'Plans, evidence, and release authority are not.'], { size: 12, lineHeight: 19, fill: theme.muted }));
    const bodyY = 155;
    out.push(rect(38, bodyY, 246, 500, '#0B0E13', '#3A444F'));
    out.push(monoLabel(60, bodyY + 29, 'Position', theme, '#9AA5B2'));
    out.push(multiline(60, bodyY + 75, ['Model confidence', 'is not system', 'evidence.'], { size: 25, lineHeight: 28, weight: 660, fill: '#F2F5F8', spacing: -.7 }));
    out.push(multiline(60, bodyY + 183, ['Agents work inside a system whose', 'durable state and release authority', 'never depend on model output.'], { size: 11.2, lineHeight: 18, fill: '#9AA5B2' }));
    out.push(rule(60, bodyY + 262, 260, bodyY + 262, '#303842'));
    out.push(monoLabel(60, bodyY + 291, 'Operating law', theme, '#9AA5B2'));
    out.push(multiline(60, bodyY + 322, ['Model text is recorded', 'as evidence — never read', 'as acceptance.'], { size: 13, lineHeight: 20, weight: 600, fill: '#F2F5F8' }));
    out.push(rect(60, bodyY + 424, 200, 48, '#11161D', '#D3B36A'));
    out.push(multiline(160, bodyY + 443, ['ZERO AUTONOMOUS', 'RELEASE AUTHORITY'], { size: 9.5, lineHeight: 14, family: 'mono', weight: 700, fill: '#D3B36A', anchor: 'middle', spacing: .9 }));

    const listX = 300;
    const listW = 542;
    const rowH = 55;
    const railX = listX + 20;
    out.push(monoLabel(listX, bodyY + 14, 'Objective → accountable release', theme));
    out.push(rule(railX, bodyY + 47, railX, bodyY + 47 + rowH * 6, theme.rule2, 2));
    AI_STEPS.forEach((step, index) => {
      const y = bodyY + 31 + index * rowH;
      const color = aiStepColor(theme, step.actor);
      const active = index === activeStep;
      out.push(rect(listX, y, listW, 46, active ? blend(color, theme.sheet2, .12) : theme.sheet2, active ? color : theme.rule));
      out.push(circle(railX, y + 23, active ? 8.5 : 5.5, color, { opacity: active ? 1 : .72 }));
      out.push(monoLabel(listX + 42, y + 19, step.index, theme, color));
      out.push(txt(listX + 81, y + 21, step.title, { size: 12.2, weight: 670, fill: theme.ink }));
      out.push(txt(listX + 182, y + 21, step.detail, { size: 10.3, fill: theme.muted }));
      out.push(monoLabel(listX + listW - 14, y + 19, step.actor === 'fixed' ? 'PROCESS' : step.actor, theme, color, 'end'));
    });
    const repairY = bodyY + 31 + rowH * 7 + 7;
    out.push(rect(listX, repairY, listW, 49, theme.sheet2, theme.rule));
    out.push(monoLabel(listX + 16, repairY + 21, 'Repair ↺', theme, theme.flow));
    out.push(txt(listX + 108, repairY + 21, 'Changes required returns to implementation for a bounded number of cycles.', { size: 9.9, fill: theme.muted }));
    out.push(monoLabel(listX + listW - 16, repairY + 21, 'Bounded', theme, theme.flow, 'end'));
    const gateY = repairY + 61;
    out.push(rect(listX, gateY, listW, 62, theme.sheet2));
    out.push(rect(listX, gateY, 3, 62, theme.authority));
    out.push(multiline(listX + 16, gateY + 23, ['A newer implementation invalidates prior verification, review, and approval.', 'Nothing carries forward on reputation.'], { size: 10.2, lineHeight: 17, fill: theme.ink }));
    out.push(monoLabel(listX + listW - 16, gateY + 38, 'Human release gate', theme, theme.authority, 'end'));
  }

  return doc(
    theme,
    width,
    height,
    compact ? 'v5-ai-mobile' : 'v5-ai',
    'Governed AI engineering workflow',
    'A seven-step workflow moves from human specification through agent planning and implementation, deterministic verification, independent review, bounded repair, and a human release gate.',
    out.join(''),
  );
}

export function renderCapability(theme: V5Theme, compact = false): string {
  const width = compact ? 480 : 880;
  const height = compact ? 985 : 650;
  const out: string[] = [];

  if (compact) {
    out.push(rect(16, 0, 448, 969, theme.sheet, theme.rule2));
    out.push(sectionHeading(theme, '04', 'Capability', ['Depth stays obvious.', 'Breadth stays calibrated.'], 32, 42, true));
    out.push(multiline(32, 131, ['Established work, applied evidence, platform awareness,', 'and current expansion are deliberately not equal.'], { size: 11.8, lineHeight: 18, fill: theme.muted }));
    let y = 190;
    CAPABILITY_TIERS.forEach((tier, index) => {
      const h = index === 1 ? 168 : 148;
      const accent = index === 0 ? theme.flow : index === 3 ? theme.authority : theme.rule2;
      out.push(rect(32, y, 416, h, index === 0 ? blend(theme.flow, theme.sheet2, .07) : theme.sheet2, theme.rule));
      out.push(rect(32, y, 3, h, accent));
      out.push(monoLabel(49, y + 25, tier.key, theme, index === 0 ? theme.flow : index === 3 ? theme.authority : theme.faint));
      out.push(txt(49, y + 52, tier.title, { size: 14, weight: 660, fill: theme.ink }));
      const listLines = index === 0
        ? ['React · TypeScript · JavaScript · Next.js', 'component architecture · state/data integration', 'accessible product interfaces']
        : index === 1
          ? ['Node.js · Express · NestJS · REST · JWT / roles', 'PostgreSQL · Prisma · Supabase · PWA', 'IndexedDB / Dexie · state/query/form systems']
          : index === 2
            ? ['Git · GitHub · Actions · GitLab CI/CD', 'Docker · Compose · Nginx · Linux', 'Vercel · Netlify']
            : ['Kubernetes · Ansible · Grafana · n8n', 'model routing · local/open models', 'K9s only as Kubernetes tooling'];
      out.push(multiline(49, y + 80, listLines, { size: 10.5, lineHeight: 18, fill: theme.muted }));
      out.push(monoLabel(431, y + h - 16, tier.mark, theme, theme.faint, 'end'));
      y += h + 10;
    });
    out.push(rect(32, 842, 416, 68, theme.sheet2));
    out.push(monoLabel(49, 864, 'Working familiarity · not claimed depth', theme));
    out.push(multiline(49, 884, ['GraphQL · WebSocket · MongoDB · Firebase · Redis · Elasticsearch · Kafka', 'Ant Design · Chakra · shadcn/ui · Apache · DigitalOcean'], { size: 9.4, lineHeight: 16, fill: theme.muted }));
    out.push(rule(32, 928, 448, 928, theme.ink, 2));
    out.push(txt(32, 955, 'Build the interface. Understand the system. Govern the automation.', { size: 11.7, weight: 650, fill: theme.ink }));
  } else {
    out.push(rect(20, 0, 840, 634, theme.sheet, theme.rule2));
    out.push(sectionHeading(theme, '04', 'Capability', ['Breadth is useful only while', 'the depth stays obvious.'], 38, 44));
    out.push(multiline(561, 67, ['Four calibrated tiers. Platform exposure and', 'in-progress learning never compete with core depth.'], { size: 11.8, lineHeight: 18, fill: theme.muted }));
    const x = 38;
    const startY = 157;
    const rowH = 84;
    CAPABILITY_TIERS.forEach((tier, index) => {
      const y = startY + index * rowH;
      const bg = index === 0 ? blend(theme.flow, theme.sheet2, .07) : theme.sheet2;
      const accent = index === 0 ? theme.flow : index === 3 ? theme.authority : theme.rule2;
      out.push(rect(x, y, 804, rowH - 8, bg, theme.rule));
      out.push(rect(x, y, 3, rowH - 8, accent));
      out.push(monoLabel(x + 16, y + 23, tier.key, theme, index === 0 ? theme.flow : index === 3 ? theme.authority : theme.faint));
      out.push(txt(x + 16, y + 49, tier.title, { size: 13.5, weight: 660, fill: theme.ink }));
      const lines = index === 0
        ? ['React · TypeScript · JavaScript · Next.js · component architecture · state/data integration', 'accessible product interfaces']
        : index === 1
          ? ['Node.js · Express · NestJS · REST · JWT/roles · PostgreSQL · Prisma · Supabase', 'PWA · IndexedDB/Dexie · modern state, query and form systems']
          : index === 2
            ? ['Git · GitHub · Actions · GitLab CI/CD · Docker · Compose · Nginx · Linux · Vercel · Netlify']
            : ['Kubernetes · Ansible · Grafana · n8n · model routing · local/open-model experimentation'];
      out.push(multiline(x + 295, y + 28, lines, { size: 10.2, lineHeight: 18, fill: theme.muted }));
      out.push(monoLabel(x + 787, y + 58, tier.mark, theme, theme.faint, 'end'));
    });
    out.push(rect(x, 501, 804, 51, theme.sheet2));
    out.push(monoLabel(x + 16, 522, 'Working familiarity · not claimed depth', theme));
    out.push(txt(x + 16, 542, 'GraphQL · WebSocket · MongoDB · Firebase · Redis · Elasticsearch · Kafka · Ant Design · Chakra · shadcn/ui · Apache · DigitalOcean', { size: 9.8, fill: theme.muted }));
    out.push(rule(x, 576, x + 804, 576, theme.ink, 2));
    out.push(txt(x, 606, 'Build the interface. Understand the system. Govern the automation.', { size: 17, weight: 660, fill: theme.ink, spacing: -.4 }));
    out.push(multiline(x + 804, 596, ['GITHUB / HAKANDUYAR', 'LINKEDIN / IN/HAKANDUYAR'], { size: 9.7, lineHeight: 17, family: 'mono', weight: 650, fill: theme.muted, anchor: 'end', spacing: 1 }));
  }

  return doc(
    theme,
    width,
    height,
    compact ? 'v5-capability-mobile' : 'v5-capability',
    'Calibrated engineering capability landscape',
    'Core expertise, applied public evidence, platform working awareness, current expansion, and supporting familiarity are separated so breadth does not dilute the primary React and TypeScript identity.',
    out.join(''),
  );
}

export function renderExpand(theme: V5Theme, compact = false): string {
  const width = compact ? 450 : 836;
  const height = 62;
  const label = compact ? 'SHOW MORE · ENGINEERING RECORD' : 'SHOW MORE · ARCHITECTURE, APPLICATIONS & AI ENGINEERING';
  const body = [
    baseStyle(),
    rect(0, 0, width, height, theme.bg),
    rule(0, 1, width, 1, theme.rule2),
    rule(0, height - 1, width, height - 1, theme.rule),
    txt(width / 2, 36, label, { size: compact ? 9.7 : 10.4, family: 'mono', weight: 700, fill: theme.muted, anchor: 'middle', spacing: 1.25 }),
    circle(width / 2 - (compact ? 166 : 282), 32, 3.5, theme.flow),
    circle(width / 2 + (compact ? 166 : 282), 32, 3.5, theme.authority),
  ].join('');
  return svgDocument({
    width,
    height,
    id: compact ? 'v5-expand-mobile' : 'v5-expand',
    title: 'Show more',
    description: 'Show the architecture, selected applications, AI engineering workflow, and calibrated capability record.',
    background: theme.bg,
    body,
  });
}

export const V5_SCENE_DIMENSIONS = {
  architecture: { desktop: [880, 790], mobile: [480, 1190] },
  ai: { desktop: [880, 735], mobile: [480, 1060] },
} as const;
