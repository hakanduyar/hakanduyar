import { svgDocument } from '../svg.js';
import { V5_PROFILE, V5_PROJECTS, type V5Project } from './content.js';
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
    txt(x, y + size + 18, label, { size: Math.max(11, Math.round(size / 7.5)), weight: 650, fill: theme.ink }),
    txt(x, y + size + 34, caption, { size: 9.3, family: 'mono', weight: 600, fill: theme.muted, spacing: .25 }),
  ].join('');
}

export function renderIdentity(theme: V5Theme, compact = false): string {
  const width = compact ? 480 : 880;
  const height = compact ? 650 : 460;
  const out: string[] = [];

  if (compact) {
    out.push(rect(16, 16, 448, 618, theme.sheet, theme.rule2));
    out.push(txt(34, 46, V5_PROFILE.name, { size: 19, weight: 670, fill: theme.ink, spacing: -.5 }));
    out.push(monoLabel(446, 44, 'Engineering brief · 05', theme, theme.faint, 'end'));
    out.push(rule(34, 66, 446, 66, theme.ink, 2));
    out.push(monoLabel(34, 99, 'Primary positioning', theme, theme.flow));
    out.push(multiline(34, 140, ['Front-end &', 'Systems Engineering.'], {
      size: 39,
      lineHeight: 43,
      weight: 660,
      fill: theme.ink,
      spacing: -1.7,
    }));
    out.push(txt(34, 242, 'Interfaces · application architecture · governed delivery', { size: 12.4, fill: theme.muted }));
    out.push(rect(34, 276, 412, 48, blend(theme.flow, theme.sheet2, .07), theme.rule));
    out.push(monoLabel(48, 296, 'Core', theme, theme.flow));
    out.push(txt(126, 298, 'React · TypeScript · frontend systems', { size: 11.5, weight: 620, fill: theme.ink }));
    out.push(monoLabel(48, 316, 'Principle', theme, theme.authority));
    out.push(txt(126, 318, 'Agents work. Human release.', { size: 10.8, weight: 600, fill: theme.ink }));

    out.push(monoLabel(34, 363, 'Technology hierarchy · scale encodes weight', theme));
    out.push(rule(34, 380, 446, 380, theme.rule2));
    out.push(techAnchor(theme, 'react', 'React', 'INTERFACE', 34, 399, 72, BRAND.react));
    out.push(techAnchor(theme, 'typescript', 'TypeScript', 'LANGUAGE', 124, 399, 72, BRAND.typescript));
    out.push(techAnchor(theme, 'nextjs', 'Next.js', 'APPLICATION', 232, 408, 56, theme.next));
    out.push(techAnchor(theme, 'nodejs', 'Node.js', 'SERVICES', 316, 414, 46, BRAND.node));
    out.push(techAnchor(theme, 'postgresql', 'PostgreSQL', 'DATA', 34, 531, 42, BRAND.postgresql));
    out.push(techAnchor(theme, 'docker', 'Docker', 'PLATFORM', 122, 537, 36, BRAND.docker));
    out.push(txt(232, 562, 'Architecture organizes the stack.', { size: 12, weight: 620, fill: theme.ink }));
    out.push(txt(232, 584, 'Logos mark responsibility, not decoration.', { size: 10.5, fill: theme.muted }));
  } else {
    out.push(rect(20, 18, 840, 424, theme.sheet, theme.rule2));
    out.push(txt(38, 48, V5_PROFILE.name, { size: 21, weight: 670, fill: theme.ink, spacing: -.6 }));
    out.push(txt(38, 68, V5_PROFILE.role, { size: 12.5, weight: 590, fill: theme.muted }));
    out.push(monoLabel(842, 46, 'Engineering brief · architecture first', theme, theme.faint, 'end'));
    out.push(monoLabel(842, 66, 'Public evidence · 2026', theme, theme.muted, 'end'));
    out.push(rule(38, 88, 842, 88, theme.ink, 2));
    out.push(monoLabel(38, 119, 'Primary positioning', theme, theme.flow));
    out.push(multiline(38, 164, ['Front-end & Systems', 'Engineering.'], {
      size: 46,
      lineHeight: 47,
      weight: 660,
      fill: theme.ink,
      spacing: -2,
    }));
    out.push(txt(38, 274, 'Interfaces · application architecture · governed delivery', { size: 13.4, fill: theme.muted }));

    out.push(rect(560, 112, 282, 74, blend(theme.flow, theme.sheet2, .07), theme.rule));
    out.push(monoLabel(576, 136, 'Core depth', theme, theme.flow));
    out.push(txt(576, 160, 'React · TypeScript · architecture', { size: 12, weight: 630, fill: theme.ink }));
    out.push(rect(560, 196, 282, 74, theme.sheet2, theme.rule));
    out.push(monoLabel(576, 220, 'Operating principle', theme, theme.authority));
    out.push(txt(576, 244, 'Agents work. Human release.', { size: 12, weight: 630, fill: theme.ink }));

    out.push(monoLabel(38, 310, 'Technology hierarchy · scale encodes emphasis', theme));
    out.push(rule(38, 326, 842, 326, theme.rule2));
    const flowY = 365;
    out.push(rule(70, flowY, 786, flowY, theme.rule2));
    for (const x of [70, 170, 316, 455, 579, 706]) out.push(circle(x, flowY, 3, theme.flow));
    out.push(techAnchor(theme, 'react', 'React', 'INTERFACE', 38, 336, 62, BRAND.react));
    out.push(techAnchor(theme, 'typescript', 'TypeScript', 'LANGUAGE', 124, 336, 62, BRAND.typescript));
    out.push(techAnchor(theme, 'nextjs', 'Next.js', 'APPLICATION', 282, 342, 50, theme.next));
    out.push(techAnchor(theme, 'nodejs', 'Node.js', 'SERVICES', 430, 348, 40, BRAND.node));
    out.push(techAnchor(theme, 'postgresql', 'PostgreSQL', 'DATA', 556, 348, 40, BRAND.postgresql));
    out.push(techAnchor(theme, 'docker', 'Docker', 'PLATFORM', 690, 353, 34, BRAND.docker));
  }

  return doc(
    theme,
    width,
    height,
    compact ? 'v5-identity-mobile' : 'v5-identity',
    `${V5_PROFILE.name} — ${V5_PROFILE.role}`,
    'Architecture-first engineering identity with React and TypeScript as the primary technology anchors.',
    out.join(''),
  );
}

const ARCH_LAYERS = [
  { index: '01', name: 'INTERFACE', tech: 'React', detail: 'Components · interaction', proof: 'Browser · accessibility', logo: 'react', brand: BRAND.react },
  { index: '02', name: 'APPLICATION', tech: 'Next.js', detail: 'State · routing · query', proof: 'Reproducible behavior', logo: 'nextjs', brand: '#FFFFFF' },
  { index: '03', name: 'SERVICES', tech: 'Node.js', detail: 'API · auth · boundaries', proof: 'Integration evidence', logo: 'nodejs', brand: BRAND.node },
  { index: '04', name: 'DATA', tech: 'PostgreSQL', detail: 'Schema · persistence', proof: 'Versioned change', logo: 'postgresql', brand: BRAND.postgresql },
  { index: '05', name: 'PLATFORM', tech: 'Docker', detail: 'CI · runtime · Linux', proof: 'Repeatable delivery', logo: 'docker', brand: BRAND.docker },
] as const;

function motionPosition(progress: number): { request: number; evidence: number; phase: 'request' | 'evidence' } {
  const p = ((progress % 1) + 1) % 1;
  if (p < .5) return { request: p / .5, evidence: 1, phase: 'request' };
  return { request: 1, evidence: 1 - (p - .5) / .5, phase: 'evidence' };
}

export function renderArchitecture(theme: V5Theme, options: MotionOptions = {}): string {
  const compact = options.compact ?? false;
  const progress = options.progress ?? 0;
  const width = compact ? 480 : 880;
  const height = compact ? 760 : 480;
  const out: string[] = [];
  const motion = motionPosition(progress);

  if (compact) {
    out.push(rect(16, 0, 448, 744, theme.sheet, theme.rule2));
    out.push(sectionHeading(theme, '01', 'Architecture', ['Request to runtime.', 'Evidence to release.'], 32, 40, true));
    out.push(txt(32, 126, 'Five responsibility layers. One accountable path.', { size: 11.8, fill: theme.muted }));
    const startY = 166;
    const rowH = 96;
    const railX = 49;
    out.push(rule(railX, startY + 45, railX, startY + rowH * 4 + 45, theme.rule2, 2));
    ARCH_LAYERS.forEach((layer, index) => {
      const y = startY + index * rowH;
      const mark = index < 2 ? theme.flow : theme.rule2;
      out.push(rect(32, y, 416, 84, index < 2 ? blend(theme.flow, theme.sheet2, .06) : theme.sheet2, theme.rule));
      out.push(circle(railX, y + 42, 11, theme.sheet, { stroke: mark, 'stroke-width': 1.5 }));
      out.push(txt(railX, y + 45, layer.index.slice(1), { size: 9, family: 'mono', weight: 700, fill: index < 2 ? theme.flow : theme.muted, anchor: 'middle' }));
      out.push(plate(theme, 76, y + 15, 52, layer.brand));
      out.push(logo(layer.logo, 88, y + 27, 28, theme));
      out.push(monoLabel(145, y + 24, layer.name, theme, index < 2 ? theme.flow : theme.faint));
      out.push(txt(145, y + 48, layer.tech, { size: 14, weight: 670, fill: theme.ink }));
      out.push(txt(252, y + 32, layer.detail, { size: 10.2, fill: theme.muted }));
      out.push(txt(252, y + 55, layer.proof, { size: 10.2, weight: 600, fill: theme.ink }));
    });
    const railStart = startY + 42;
    const railEnd = startY + rowH * 4 + 42;
    out.push(circle(railX, railStart + (railEnd - railStart) * motion.request, 5.5, theme.flow, { opacity: motion.phase === 'request' ? 1 : 0 }));
    out.push(circle(railX, railStart + (railEnd - railStart) * motion.evidence, 5.5, theme.authority, { opacity: motion.phase === 'evidence' ? 1 : 0 }));
    out.push(rect(32, 662, 416, 52, theme.sheet2));
    out.push(circle(52, 688, 4, theme.flow));
    out.push(monoLabel(64, 692, 'Request ↓', theme, theme.muted));
    out.push(circle(174, 688, 4, theme.authority));
    out.push(monoLabel(186, 692, 'Evidence ↑', theme, theme.muted));
    out.push(monoLabel(431, 692, 'Human release', theme, theme.authority, 'end'));
  } else {
    out.push(rect(20, 0, 840, 464, theme.sheet, theme.rule2));
    out.push(sectionHeading(theme, '01', 'Architecture', ['Request to runtime.', 'Evidence to release.'], 38, 42));
    out.push(multiline(582, 67, ['Five responsibility layers.', 'One accountable path.'], { size: 12.2, lineHeight: 19, fill: theme.muted }));
    const startX = 38;
    const cardY = 151;
    const cardW = 148;
    const gap = 16;
    ARCH_LAYERS.forEach((layer, index) => {
      const x = startX + index * (cardW + gap);
      out.push(rect(x, cardY, cardW, 190, index < 2 ? blend(theme.flow, theme.sheet2, .06) : theme.sheet2, theme.rule));
      out.push(monoLabel(x + 14, cardY + 25, `${layer.index} · ${layer.name}`, theme, index < 2 ? theme.flow : theme.faint));
      out.push(plate(theme, x + 14, cardY + 43, 54, layer.brand));
      out.push(logo(layer.logo, x + 27, cardY + 56, 28, theme));
      out.push(txt(x + 14, cardY + 120, layer.tech, { size: 14, weight: 670, fill: theme.ink }));
      out.push(txt(x + 14, cardY + 145, layer.detail, { size: 9.6, fill: theme.muted }));
      out.push(txt(x + 14, cardY + 169, layer.proof, { size: 9.7, weight: 610, fill: theme.ink }));
      if (index < ARCH_LAYERS.length - 1) {
        const arrowX = x + cardW + 5;
        out.push(path(`M${arrowX} ${cardY + 95}l6 -5v10z`, { fill: theme.rule2 }));
      }
    });
    const railY = 381;
    const railStart = 58;
    const railEnd = 822;
    out.push(rule(railStart, railY, railEnd, railY, theme.rule2, 2));
    out.push(circle(railStart + (railEnd - railStart) * motion.request, railY, 6, theme.flow, { opacity: motion.phase === 'request' ? 1 : 0 }));
    out.push(circle(railStart + (railEnd - railStart) * motion.evidence, railY, 6, theme.authority, { opacity: motion.phase === 'evidence' ? 1 : 0 }));
    out.push(rect(38, 405, 804, 35, theme.sheet2));
    out.push(monoLabel(52, 427, 'Request →', theme, theme.flow));
    out.push(monoLabel(164, 427, 'Evidence ←', theme, theme.authority));
    out.push(monoLabel(826, 427, 'Release authority remains human', theme, theme.authority, 'end'));
  }

  return doc(
    theme,
    width,
    height,
    compact ? 'v5-architecture-mobile' : 'v5-architecture',
    'Compact engineering responsibility architecture',
    'Five visual responsibility layers connect interface, application, services, data, and platform. Requests move toward runtime and evidence returns to human release authority.',
    out.join(''),
  );
}

const PROJECT_VISUALS: Record<ProjectKey, {
  scope: 'PROOF' | 'CONTRIBUTION';
  kind: string;
  chain: readonly string[];
  proof: string;
}> = {
  factory: {
    scope: 'PROOF',
    kind: 'AGENTIC CONTROL PLANE',
    chain: ['Plan', 'Execute', 'Verify', 'Review', 'Repair', 'Release'],
    proof: 'Agents work. Human release authority remains separate.',
  },
  spark: {
    scope: 'PROOF',
    kind: 'LOCAL-FIRST PWA',
    chain: ['React', 'TypeScript', 'PWA', 'Dexie', 'IndexedDB'],
    proof: 'Local-first planning with offline browser persistence.',
  },
  layers: {
    scope: 'PROOF',
    kind: 'TYPED CONTENT PIPELINE',
    chain: ['MDX', 'Zod', 'Build Gate', 'RSC', 'SSG', 'QA'],
    proof: 'Typed content makes accessibility delivery evidence.',
  },
  ledger: {
    scope: 'CONTRIBUTION',
    kind: 'UPSTREAM BACKEND EXTENSION',
    chain: ['Vue upstream', 'Docker', 'PostgreSQL', 'Book API', 'Role checks'],
    proof: 'Docker runtime and shared-book backend contribution.',
  },
};

function chainDiagram(theme: V5Theme, items: readonly string[], x: number, y: number, width: number, compact: boolean): string {
  const out: string[] = [];
  const gap = compact ? 5 : 8;
  const nodeW = (width - gap * (items.length - 1)) / items.length;
  items.forEach((item, index) => {
    const nx = x + index * (nodeW + gap);
    out.push(rect(nx, y, nodeW, compact ? 37 : 42, index === 0 ? blend(theme.flow, theme.sheet2, .09) : theme.sheet2, index === 0 ? theme.flow : theme.rule2));
    out.push(txt(nx + nodeW / 2, y + (compact ? 24 : 27), item, { size: compact ? 8.3 : 9.4, family: 'mono', weight: 650, fill: theme.ink, anchor: 'middle' }));
    if (index < items.length - 1) {
      const ax = nx + nodeW + 1;
      out.push(path(`M${ax} ${y + (compact ? 18.5 : 21)}l3 -3v6z`, { fill: theme.rule2 }));
    }
  });
  return out.join('');
}

export function renderProject(theme: V5Theme, key: ProjectKey, compact = false): string {
  const project = V5_PROJECTS.find((candidate) => candidate.key === key);
  if (!project) throw new Error(`Unknown V5 project: ${key}`);
  const visual = PROJECT_VISUALS[key];
  const width = compact ? 480 : 880;
  const first = key === 'factory';
  const height = compact ? (first ? 350 : 250) : (first ? 280 : 180);
  const out: string[] = [];
  const cardX = compact ? 16 : 20;
  const cardW = width - cardX * 2;
  const cardY = first ? (compact ? 112 : 98) : 0;

  if (first) {
    if (compact) {
      out.push(sectionHeading(theme, '02', 'Selected systems', ['Four systems.', 'Four evidence paths.'], 30, 35, true));
    } else {
      out.push(sectionHeading(theme, '02', 'Selected systems', ['Four systems. Four evidence paths.'], 38, 38));
      out.push(txt(603, 67, 'Architecture first. Scope stays visible.', { size: 11.8, fill: theme.muted }));
    }
  }

  out.push(rect(cardX, cardY, cardW, height - cardY, theme.sheet, theme.rule2));
  const innerX = cardX + (compact ? 16 : 18);
  const innerW = cardW - (compact ? 32 : 36);
  const top = cardY + (compact ? 25 : 25);
  out.push(monoLabel(innerX, top, `${project.index} · ${visual.scope}`, theme, visual.scope === 'CONTRIBUTION' ? theme.authority : theme.flow));
  out.push(txt(innerX, top + 35, project.name, { size: compact ? 22 : 23, weight: 680, fill: theme.ink, spacing: -.7 }));
  out.push(monoLabel(innerX + innerW, top + 34, visual.kind, theme, theme.faint, 'end'));
  out.push(chainDiagram(theme, visual.chain, innerX, top + (compact ? 58 : 54), innerW, compact));
  out.push(circle(innerX + 4, top + (compact ? 119 : 113), 3.5, visual.scope === 'CONTRIBUTION' ? theme.authority : theme.flow));
  out.push(txt(innerX + 17, top + (compact ? 123 : 117), visual.proof, { size: compact ? 11.1 : 11.4, weight: 610, fill: theme.ink }));

  return doc(
    theme,
    width,
    height,
    `v5-project-${key}${compact ? '-mobile' : ''}`,
    `${project.index} — ${project.name}`,
    `${visual.kind}. ${visual.chain.join(' to ')}. ${visual.proof}`,
    out.join(''),
  );
}

const AI_STEPS = [
  { index: '01', title: 'Specify', actor: 'HUMAN' },
  { index: '02', title: 'Plan', actor: 'AGENT' },
  { index: '03', title: 'Approve', actor: 'HUMAN' },
  { index: '04', title: 'Implement', actor: 'AGENT' },
  { index: '05', title: 'Verify', actor: 'PROCESS' },
  { index: '06', title: 'Review', actor: 'INDEPENDENT' },
  { index: '07', title: 'Repair', actor: 'BOUNDED' },
  { index: '08', title: 'Release', actor: 'HUMAN GATE' },
] as const;

function aiColor(theme: V5Theme, actor: string): string {
  if (actor.includes('HUMAN')) return theme.authority;
  if (actor === 'PROCESS') return theme.faint;
  return theme.flow;
}

export function renderAiWorkflow(theme: V5Theme, options: MotionOptions = {}): string {
  const compact = options.compact ?? false;
  const progress = ((options.progress ?? 0) % 1 + 1) % 1;
  const activeStep = Math.min(AI_STEPS.length - 1, Math.floor(progress * AI_STEPS.length));
  const width = compact ? 480 : 880;
  const height = compact ? 560 : 360;
  const out: string[] = [];

  if (compact) {
    out.push(rect(16, 0, 448, 544, theme.sheet, theme.rule2));
    out.push(sectionHeading(theme, '03', 'AI engineering', ['Governed workflow.', 'Human release.'], 32, 40, true));
    out.push(txt(32, 126, 'Execution is assisted. Evidence and authority persist.', { size: 11.2, fill: theme.muted }));
    const startY = 158;
    const rowH = 43;
    const railX = 49;
    out.push(rule(railX, startY + 19, railX, startY + rowH * 7 + 19, theme.rule2, 2));
    AI_STEPS.forEach((step, index) => {
      const y = startY + index * rowH;
      const color = aiColor(theme, step.actor);
      const active = index === activeStep;
      out.push(rect(32, y, 416, 36, active ? blend(color, theme.sheet2, .13) : theme.sheet2, active ? color : theme.rule));
      out.push(circle(railX, y + 18, active ? 8 : 5, color));
      out.push(monoLabel(72, y + 14, step.index, theme, color));
      out.push(txt(110, y + 22, step.title, { size: 12, weight: 670, fill: theme.ink }));
      out.push(monoLabel(430, y + 22, step.actor, theme, color, 'end'));
    });
    out.push(path('M430 500 C365 514 265 514 205 500', { fill: 'none', stroke: theme.flow, 'stroke-width': 1.5, 'stroke-dasharray': '4 4' }));
    out.push(path('M205 500l7 -2l-3 7z', { fill: theme.flow }));
    out.push(rect(32, 520, 416, 24, theme.sheet2));
    out.push(monoLabel(48, 537, 'Repair loops back. Release never delegates.', theme, theme.authority));
  } else {
    out.push(rect(20, 0, 840, 344, theme.sheet, theme.rule2));
    out.push(sectionHeading(theme, '03', 'AI engineering', ['Governed workflow. Human release.'], 38, 40));
    out.push(multiline(586, 65, ['Execution is assisted.', 'Evidence and authority persist.'], { size: 11.8, lineHeight: 18, fill: theme.muted }));
    const startX = 38;
    const nodeY = 151;
    const nodeW = 91;
    const gap = 11;
    AI_STEPS.forEach((step, index) => {
      const x = startX + index * (nodeW + gap);
      const color = aiColor(theme, step.actor);
      const active = index === activeStep;
      out.push(rect(x, nodeY, nodeW, 78, active ? blend(color, theme.sheet2, .14) : theme.sheet2, active ? color : theme.rule));
      out.push(monoLabel(x + 12, nodeY + 20, step.index, theme, color));
      out.push(txt(x + 12, nodeY + 47, step.title, { size: 12.2, weight: 670, fill: theme.ink }));
      out.push(monoLabel(x + 12, nodeY + 67, step.actor, theme, color));
      if (index < AI_STEPS.length - 1) {
        const ax = x + nodeW + 3;
        out.push(path(`M${ax} ${nodeY + 39}l5 -4v8z`, { fill: theme.rule2 }));
      }
    });
    out.push(path('M826 238 C826 316 514 320 446 248', { fill: 'none', stroke: theme.flow, 'stroke-width': 1.5, 'stroke-dasharray': '5 5' }));
    out.push(path('M446 248l8 -1l-4 7z', { fill: theme.flow }));
    out.push(monoLabel(621, 276, 'Changes required · bounded repair loop', theme, theme.flow, 'middle'));
    out.push(rect(38, 307, 804, 25, theme.sheet2));
    out.push(monoLabel(52, 325, 'Agents participate', theme, theme.flow));
    out.push(monoLabel(826, 325, 'Release authority remains human', theme, theme.authority, 'end'));
  }

  return doc(
    theme,
    width,
    height,
    compact ? 'v5-ai-mobile' : 'v5-ai',
    'Governed AI engineering workflow',
    'Specify, plan, approve, implement, verify, independently review, repair when required, and release through a human gate.',
    out.join(''),
  );
}

const CAPABILITY_LANES = [
  { key: 'CORE', items: ['React', 'TypeScript', 'Frontend', 'Architecture'], color: 'flow' },
  { key: 'APPLIED', items: ['Next.js', 'Node.js', 'REST', 'PostgreSQL', 'IndexedDB', 'Docker', 'CI / Linux'], color: 'rule' },
  { key: 'EXPANSION', items: ['Kubernetes', 'Ansible', 'Grafana', 'n8n'], color: 'authority' },
] as const;

function capabilityLane(theme: V5Theme, key: string, items: readonly string[], x: number, y: number, width: number, compact: boolean, accent: string): string {
  const out: string[] = [];
  const labelW = compact ? 96 : 100;
  out.push(monoLabel(x, y + 22, key, theme, accent));
  const itemX = x + labelW;
  const gap = compact ? 5 : 7;
  const itemW = (width - labelW - gap * (items.length - 1)) / items.length;
  items.forEach((item, index) => {
    const nx = itemX + index * (itemW + gap);
    out.push(rect(nx, y, itemW, compact ? 35 : 37, index === 0 && key === 'CORE' ? blend(theme.flow, theme.sheet2, .09) : theme.sheet2, key === 'CORE' ? accent : theme.rule2));
    out.push(txt(nx + itemW / 2, y + (compact ? 23 : 24), item, { size: compact ? 8.5 : 9.5, family: 'mono', weight: 640, fill: theme.ink, anchor: 'middle' }));
  });
  return out.join('');
}

export function renderCapability(theme: V5Theme, compact = false): string {
  const width = compact ? 480 : 880;
  const height = compact ? 430 : 280;
  const out: string[] = [];

  if (compact) {
    out.push(rect(16, 0, 448, 414, theme.sheet, theme.rule2));
    out.push(sectionHeading(theme, '04', 'Capability', ['Depth first.', 'Breadth calibrated.'], 32, 40, true));
    out.push(txt(32, 126, 'Three visual tiers. They are deliberately not equal.', { size: 11.2, fill: theme.muted }));
    let y = 164;
    CAPABILITY_LANES.forEach((lane) => {
      const accent = lane.color === 'flow' ? theme.flow : lane.color === 'authority' ? theme.authority : theme.rule2;
      out.push(rect(32, y, 416, 65, theme.sheet2, theme.rule));
      out.push(rect(32, y, 3, 65, accent));
      out.push(monoLabel(49, y + 22, lane.key, theme, accent));
      const cols = lane.key === 'APPLIED' ? 4 : lane.items.length;
      const gap = 5;
      const boxW = (382 - gap * (cols - 1)) / cols;
      lane.items.forEach((item, index) => {
        const row = Math.floor(index / cols);
        const col = index % cols;
        const bx = 49 + col * (boxW + gap);
        const by = y + 32 + row * 24;
        out.push(rect(bx, by, boxW, 20, theme.sheet, theme.rule2));
        out.push(txt(bx + boxW / 2, by + 14, item, { size: 8.1, family: 'mono', weight: 620, fill: theme.ink, anchor: 'middle' }));
      });
      y += lane.key === 'APPLIED' ? 88 : 76;
    });
    out.push(rule(32, 390, 448, 390, theme.ink, 2));
    out.push(monoLabel(32, 410, 'Build the interface · understand the system', theme, theme.muted));
  } else {
    out.push(rect(20, 0, 840, 264, theme.sheet, theme.rule2));
    out.push(sectionHeading(theme, '04', 'Capability', ['Depth first. Breadth calibrated.'], 38, 40));
    out.push(txt(590, 67, 'Three visual tiers. Deliberately unequal.', { size: 11.8, fill: theme.muted }));
    let y = 133;
    CAPABILITY_LANES.forEach((lane) => {
      const accent = lane.color === 'flow' ? theme.flow : lane.color === 'authority' ? theme.authority : theme.rule2;
      out.push(capabilityLane(theme, lane.key, lane.items, 38, y, 804, false, accent));
      y += 45;
    });
  }

  return doc(
    theme,
    width,
    height,
    compact ? 'v5-capability-mobile' : 'v5-capability',
    'Compact calibrated engineering capability landscape',
    'Core React and TypeScript depth, applied systems breadth, and current expansion are shown as deliberately unequal visual tiers.',
    out.join(''),
  );
}

export function renderExpand(theme: V5Theme, compact = false): string {
  const width = compact ? 450 : 836;
  const height = 54;
  const label = compact ? 'SHOW MORE · SYSTEMS & AI' : 'SHOW MORE · ARCHITECTURE, SYSTEMS & AI';
  const body = [
    baseStyle(),
    rect(0, 0, width, height, theme.bg),
    rule(0, 1, width, 1, theme.rule2),
    rule(0, height - 1, width, height - 1, theme.rule),
    txt(width / 2, 32, label, { size: compact ? 9.7 : 10.3, family: 'mono', weight: 700, fill: theme.muted, anchor: 'middle', spacing: 1.2 }),
    circle(width / 2 - (compact ? 150 : 250), 28, 3.5, theme.flow),
    circle(width / 2 + (compact ? 150 : 250), 28, 3.5, theme.authority),
  ].join('');
  return svgDocument({
    width,
    height,
    id: compact ? 'v5-expand-mobile' : 'v5-expand',
    title: 'Show more',
    description: 'Show the compact architecture, selected systems, AI workflow, and capability record.',
    background: theme.bg,
    body,
  });
}

export const V5_SCENE_DIMENSIONS = {
  architecture: { desktop: [880, 480], mobile: [480, 760] },
  ai: { desktop: [880, 360], mobile: [480, 560] },
} as const;
