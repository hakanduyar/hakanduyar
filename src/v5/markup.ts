import { V5_PROJECTS } from './content.js';

function escapeAttribute(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character] ?? character);
}

function staticPicture(prefix: string, base: string, alt: string, summary = false): string {
  const width = summary ? '95%' : '880';
  const align = summary ? 'middle' : 'top';
  // GitHub rewrites any source containing prefers-color-scheme and discards
  // the rest of that source's media condition. Keep viewport and theme sources
  // separate: mobile uses the high-contrast dark composition in every theme,
  // while desktop follows the active GitHub theme.
  return `<picture><source media="(max-width: 600px)" srcset="${prefix}${base}-mobile-dark.svg"><source media="(prefers-color-scheme: dark)" srcset="${prefix}${base}-dark.svg"><img src="${prefix}${base}-light.svg" alt="${escapeAttribute(alt)}" width="${width}" align="${align}"></picture>`;
}

function motionPicture(prefix: string, base: string, alt: string): string {
  return `<picture><source media="(max-width: 600px) and (prefers-reduced-motion: reduce)" srcset="${prefix}${base}-mobile-static-dark.svg"><source media="(prefers-reduced-motion: reduce)" srcset="${prefix}${base}-static-dark.svg"><source media="(max-width: 600px)" srcset="${prefix}${base}-mobile-dark.gif"><source media="(prefers-color-scheme: dark)" srcset="${prefix}${base}-dark.gif"><img src="${prefix}${base}-light.gif" alt="${escapeAttribute(alt)}" width="880" align="top"></picture>`;
}

export function profileFragment(prefix = 'assets/generated/'): string {
  const identity = staticPicture(
    prefix,
    'identity',
    'Hakan Duyar — Front-end and Systems Engineering. React and TypeScript are the primary technology anchors, followed by Next.js, Node.js, PostgreSQL, and Docker.',
  );
  const expand = staticPicture(
    prefix,
    'expand',
    'Show more: architecture, selected applications, AI engineering workflow, and calibrated capability record.',
    true,
  );
  const architecture = motionPicture(
    prefix,
    'architecture',
    'Five engineering responsibility layers: interface, application, services, data, and platform. A request travels down the architecture and evidence returns to a human release decision.',
  );
  const projects = V5_PROJECTS.map((project) => {
    const image = staticPicture(prefix, `project-${project.key}`, `${project.name}. ${project.claim} ${project.description} ${project.boundary}`);
    return `<a href="${project.repo}">${image}</a>`;
  }).join('');
  const ai = motionPicture(
    prefix,
    'ai',
    'Governed AI engineering workflow: specify, plan, approve, implement, verify, independently review, repair when required, and release through a human gate.',
  );
  const capability = staticPicture(
    prefix,
    'capability',
    'Engineering capabilities calibrated as core established work, applied public evidence, platform working awareness, current expansion, and supporting familiarity.',
  );
  return `${identity}<details><summary>${expand}</summary>${architecture}${projects}${ai}${capability}</details>`;
}
