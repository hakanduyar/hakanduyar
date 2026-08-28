import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { REPO_ROOT } from '../src/emit.js';
import { profileFragment } from '../src/v5/markup.js';

const readme = `<!-- GENERATED FILE: edit src/v5/ and scripts/, then run npm run build. -->\n${profileFragment()}\n`;

writeFileSync(resolve(REPO_ROOT, 'README.md'), readme, 'utf8');
console.log('[readme] wrote README.md');
