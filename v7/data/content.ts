// V7.1 content model — single source of truth for the deterministic generator.
// Every claim string here must stay truthful and match v7/docs/handoff.md.
import type { LogoSlug } from '../src/logos.js';

export const identity = {
  name: 'Hakan Duyar',
  kicker: 'ENGINEERING PROFILE — V7.1 VISUAL PROOF',
  role: 'Front-end & systems engineering — React and TypeScript at the core, carried through data, delivery, and runtime to verified, human-gated release.',
};

export interface ArchPlane {
  id: string;
  /** Plane title, rendered on the plane itself. */
  label: string;
  /** Marks pinned onto the plane. First entries render closer to the viewer. */
  marks: Array<{ slug: LogoSlug; name: string; primary?: boolean }>;
  /** Right-margin annotation, line 1 (technologies). */
  annotation: string;
  /** Right-margin annotation, line 2 (system role). */
  roleNote: string;
}

// The hero: one exploded architectural section, five planes, technologies
// placed where they perform a system role — never as a badge wall.
export const architecture: ArchPlane[] = [
  {
    id: 'interface',
    label: 'INTERFACE',
    marks: [{ slug: 'react', name: 'React', primary: true }],
    annotation: 'React',
    roleNote: 'components · state · accessible UI',
  },
  {
    id: 'application',
    label: 'APPLICATION',
    marks: [{ slug: 'typescript', name: 'TypeScript', primary: true }],
    annotation: 'TypeScript',
    roleNote: 'typed domain · application logic',
  },
  {
    id: 'data',
    label: 'DATA',
    marks: [
      { slug: 'postgresql', name: 'PostgreSQL' },
      { slug: 'redis', name: 'Redis' },
      { slug: 'elasticsearch', name: 'Elasticsearch' },
    ],
    annotation: 'PostgreSQL · Redis · Elasticsearch',
    roleNote: 'records · cache · search',
  },
  {
    id: 'delivery',
    label: 'DELIVERY',
    marks: [
      { slug: 'docker', name: 'Docker' },
      { slug: 'kubernetes', name: 'Kubernetes' },
      { slug: 'nginx', name: 'Nginx' },
      { slug: 'apache', name: 'Apache' },
    ],
    annotation: 'Docker · Kubernetes · Nginx · Apache',
    roleNote: 'images · orchestration · edge',
  },
  {
    id: 'runtime',
    label: 'RUNTIME',
    marks: [
      { slug: 'linux', name: 'Linux' },
      { slug: 'ubuntu', name: 'Ubuntu' },
      { slug: 'debian', name: 'Debian' },
    ],
    annotation: 'Linux · Ubuntu · Debian',
    roleNote: 'operating foundation',
  },
];

export type TruthMarker = 'CONCEPT' | 'BUILT' | 'CONTRIBUTION';

export interface SystemEntry {
  index: string;
  name: string;
  marker: TruthMarker;
  markerNote?: string;
  summary: string;
  boundary: string;
  marks: Array<{ slug: LogoSlug; name: string }>;
}

// Exact required order: Software Factory, Spark, Built in Layers, JointLedger.
export const systems: SystemEntry[] = [
  {
    index: '01',
    name: 'Software Factory',
    marker: 'CONCEPT',
    summary: 'Engineering control plane separating specification, execution, assurance, and release authority.',
    boundary: 'Direction only — no issue/PR automation, orchestration, deployment, or control-room UI built.',
    marks: [],
  },
  {
    index: '02',
    name: 'Spark',
    marker: 'BUILT',
    summary: 'Local-first planning application; runs entirely on-device as a PWA.',
    boundary: 'No backend, login, or cloud sync; no automated test suite claimed.',
    marks: [
      { slug: 'react', name: 'React' },
      { slug: 'typescript', name: 'TypeScript' },
      { slug: 'pwa', name: 'PWA' },
    ],
  },
  {
    index: '03',
    name: 'Built in Layers',
    marker: 'BUILT',
    summary: 'Typed content moved through a deterministic build into rendered, accessible delivery.',
    boundary: 'Architecture evidence — not a full design system; no WCAG AAA claim.',
    marks: [{ slug: 'typescript', name: 'TypeScript' }],
  },
  {
    index: '04',
    name: 'JointLedger',
    marker: 'CONTRIBUTION',
    markerNote: 'RUNTIME',
    summary: 'Docker and PostgreSQL runtime contribution to an upstream accounting product.',
    boundary: 'Engine and UI inherited from the upstream product; unreleased shared-book areas not claimed as built.',
    marks: [
      { slug: 'docker', name: 'Docker' },
      { slug: 'postgresql', name: 'PostgreSQL' },
    ],
  },
];

export interface PathNode {
  label: string;
  note?: string;
  humanGate?: boolean;
}

// One integrated system path — not a card grid. Human authority sits at two
// gates; independent review can send work back for repair.
export const deliveryPath = {
  kicker: 'AI-ASSISTED DELIVERY — ONE PATH, TWO HUMAN GATES',
  nodes: [
    { label: 'SPECIFY', note: 'model-assisted' },
    { label: 'PLAN' },
    { label: 'APPROVE', humanGate: true },
    { label: 'IMPLEMENT' },
    { label: 'VERIFY', note: 'build · types · tests' },
    { label: 'REVIEW', note: 'independent' },
    { label: 'RELEASE', humanGate: true },
  ] satisfies PathNode[],
  repair: { from: 'REVIEW', to: 'IMPLEMENT', label: 'repair' },
};

export const footer = {
  contact: 'Hakan Duyar · iamhakanduyar@gmail.com',
  left: 'V7.1 dark visual proof · deterministic source · static-first, safe under prefers-reduced-motion',
  right: 'Logo marks vendored locally (simple-icons) and belong to their respective projects',
};
