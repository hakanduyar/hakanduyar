/**
 * Curated public copy.
 *
 * Everything here is a human editorial decision; everything measured lives in
 * `data/telemetry.json`. The split matters: a number must never be typed into
 * this file, and a sentence must never be generated from the API. The content
 * lint enforces the first half of that rule.
 *
 * v2 note. This file used to carry two identity paragraphs, five operating
 * principles and a four-sentence capability gloss — roughly 200 words that the
 * README printed as prose beneath the graphics. None of it survived the
 * redesign, because none of it was doing work the panels were not already
 * doing better. What is left is what actually gets drawn.
 *
 * Language: professional English throughout, including anything that ends up
 * inside a generated graphic.
 */

export interface CapabilityModule {
  /** Domain name, drawn uppercase in the left column of the focus panel. */
  name: string;
  /**
   * What is practised in that domain. Drawn at `TYPE.body` in a 610u column,
   * which holds ~37 characters — `renderFocus` asserts the fit, so an overlong
   * edit fails the build rather than colliding with the panel margin.
   */
  capability: string;
}

export const PROFILE = {
  /** The identity plate's discipline line. Uppercased at render time. */
  discipline: 'INTERFACE AND SYSTEMS ENGINEERING',

  /**
   * The one line of real Markdown text on the page. It exists so the profile
   * still says who this is when images fail to load, and so search and screen
   * readers get the claim as text rather than as an image description.
   */
  strapline: 'Hakan Duyar — interface and systems engineer. TypeScript, React, Node.',

  modules: [
    { name: 'INTERFACE', capability: 'Component architecture in React' },
    { name: 'SYSTEMS', capability: 'Transactional, idempotent services' },
    { name: 'DATA', capability: 'Local-first persistence and offline' },
    { name: 'MOTION', capability: 'Animation as a composable system' },
  ] satisfies CapabilityModule[],

  /** Rendered as the final line of the README, replacing any sign-off. */
  provenanceNote:
    'Every image on this page is generated from source in this repository. Nothing is fetched from a third-party service.',
} as const;
