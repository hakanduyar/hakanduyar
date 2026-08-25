export interface LayoutBox {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface LayoutCircle {
  id: string;
  cx: number;
  cy: number;
  radius: number;
}

export interface CollisionSpec {
  name: string;
  width: number;
  height: number;
  margin: number;
  textZones: readonly LayoutBox[];
  nodeZones?: readonly LayoutCircle[];
  avoidBands?: readonly LayoutBox[];
}

function separated(a: LayoutBox, b: LayoutBox, gap: number): boolean {
  return (
    a.x + a.width + gap <= b.x ||
    b.x + b.width + gap <= a.x ||
    a.y + a.height + gap <= b.y ||
    b.y + b.height + gap <= a.y
  );
}

function circleTouchesBox(circle: LayoutCircle, box: LayoutBox, gap: number): boolean {
  const nearestX = Math.max(box.x, Math.min(circle.cx, box.x + box.width));
  const nearestY = Math.max(box.y, Math.min(circle.cy, box.y + box.height));
  return Math.hypot(circle.cx - nearestX, circle.cy - nearestY) < circle.radius + gap;
}

export function collisionErrors(spec: CollisionSpec, gap = 8): string[] {
  const errors: string[] = [];
  for (const box of spec.textZones) {
    if (
      box.x < spec.margin ||
      box.y < spec.margin ||
      box.x + box.width > spec.width - spec.margin ||
      box.y + box.height > spec.height - spec.margin
    ) {
      errors.push(`${spec.name}: ${box.id} leaves the protected canvas`);
    }
  }
  for (let index = 0; index < spec.textZones.length; index += 1) {
    const first = spec.textZones[index];
    if (!first) continue;
    for (let nextIndex = index + 1; nextIndex < spec.textZones.length; nextIndex += 1) {
      const second = spec.textZones[nextIndex];
      if (second && !separated(first, second, gap)) {
        errors.push(`${spec.name}: ${first.id} collides with ${second.id}`);
      }
    }
  }
  for (const node of spec.nodeZones ?? []) {
    for (const box of spec.textZones) {
      if (circleTouchesBox(node, box, gap)) errors.push(`${spec.name}: ${node.id} touches ${box.id}`);
    }
  }
  for (const band of spec.avoidBands ?? []) {
    for (const box of spec.textZones) {
      if (!separated(band, box, gap)) errors.push(`${spec.name}: ${band.id} enters ${box.id}`);
    }
  }
  return errors;
}

export function assertCollisionSpec(spec: CollisionSpec): void {
  const errors = collisionErrors(spec);
  if (errors.length) throw new Error(errors.join('\n'));
}
