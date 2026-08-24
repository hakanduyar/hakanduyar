'use strict';

// tsx asks Node for a numeric user id when one exists. Windows has no getuid,
// so providing its neutral equivalent avoids a platform user-info lookup while
// preserving the native behavior on macOS and Linux.
if (typeof process.geteuid !== 'function') {
  process.geteuid = () => 0;
}
