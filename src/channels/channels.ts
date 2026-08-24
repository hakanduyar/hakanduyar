/**
 * Panel 04 — channels.
 *
 * Four verified destinations, drawn as a 2x2 register rather than a row: at
 * 890u the four handles do not fit side by side once `iamhakanduyar@gmail.com`
 * is one of them, and shrinking type to make them fit would put contact
 * details below the information floor.
 *
 * This is the one panel that cannot carry its own links. A single image can be
 * wrapped in a single anchor — which is how each system plate links to its
 * repository — but four destinations in one image cannot be. The README
 * therefore emits one compact link line beneath this panel. That line is the
 * only navigational prose on the page, and it carries the link words only; the
 * handles themselves are stated here and nowhere else.
 */

import { Canvas, type RenderedAsset } from '../shared/canvas.js';
import { TYPE, GRID, type Palette } from '../shared/tokens.js';
import { frame, head, fitted, SECTIONS } from '../shared/panel.js';

const W = GRID.width;
const H = 232;
/** Two columns, two rows. */
const COLUMN_X = [40, 460] as const;
const COLUMN_W = 390;
const ROW_LABEL = [96, 172] as const;
/** The handle sits one line under its label. */
const DETAIL_OFFSET = 30;

export interface ChannelEntry {
  label: string;
  detail: string;
}

export interface ChannelsInput {
  channels: readonly ChannelEntry[];
}

export function renderChannels(input: ChannelsInput, palette: Palette): RenderedAsset {
  const canvas = new Canvas(W, H, palette, `hdu-channels-${palette.name}`);
  const p = palette;

  const capacity = COLUMN_X.length * ROW_LABEL.length;
  if (input.channels.length !== capacity) {
    throw new Error(
      `Channels panel is laid out for ${capacity} entries but was given ${input.channels.length}. ` +
        'Re-derive the grid before adding or removing a channel.',
    );
  }

  canvas.add(frame(canvas, p), head(canvas, p, { index: SECTIONS.channels, name: 'CHANNELS' }));

  input.channels.forEach((channel, index) => {
    const x = COLUMN_X[index % COLUMN_X.length] as number;
    const y = ROW_LABEL[Math.floor(index / COLUMN_X.length)] as number;

    fitted(canvas, channel.label, TYPE.label, COLUMN_W, `channel label ${channel.label}`);
    fitted(canvas, channel.detail, TYPE.body, COLUMN_W, `channel detail ${channel.detail}`);

    canvas.add(
      canvas.text(channel.label, TYPE.label, { x, y, fill: p.text.tertiary }),
      canvas.text(channel.detail, TYPE.body, { x, y: y + DETAIL_OFFSET, fill: p.text.primary }),
    );
  });

  const spoken = input.channels.map((c) => `${c.label.toLowerCase()} ${c.detail}`).join(', ');
  return canvas.build({
    id: 'channels',
    title: 'Channels - verified public contact points',
    desc: `Verified public channels: ${spoken}.`,
  });
}
