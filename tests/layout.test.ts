import { describe, expect, it } from 'vitest';
import { collisionErrors } from '../src/layout.js';
import { ARCHITECTURE_COLLISION_SPECS } from '../src/scenes/architecture.js';
import { SIGNAL_COLLISION_SPECS } from '../src/scenes/signal.js';
import { SYSTEMS_COLLISION_SPECS } from '../src/scenes/systems.js';

const scenes = {
  ...SYSTEMS_COLLISION_SPECS,
  architectureDesktop: ARCHITECTURE_COLLISION_SPECS.desktop,
  architectureMobile: ARCHITECTURE_COLLISION_SPECS.mobile,
  signalDesktop: SIGNAL_COLLISION_SPECS.desktop,
  signalMobile: SIGNAL_COLLISION_SPECS.mobile,
};

describe('critical SVG collision zones', () => {
  for (const [name, spec] of Object.entries(scenes)) {
    it(`${name} keeps text, nodes, trajectories, and canvas bounds separated`, () => {
      expect(collisionErrors(spec)).toEqual([]);
    });
  }
});
