const path = require('node:path');

function resolveAsset(requestURL, root) {
  const url = new URL(requestURL);
  if (url.protocol !== 'fnaf:' || url.hostname !== 'game' || url.port || url.username || url.password) {
    throw new Error('Invalid app origin');
  }
  const pathname = decodeURIComponent(url.pathname);
  if (pathname.includes('\0') || pathname.includes('\\')) throw new Error('Invalid asset path');
  const target = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
  const relative = path.relative(root, target);
  if (relative === '..' || relative.startsWith('..' + path.sep) || path.isAbsolute(relative)) {
    throw new Error('Asset outside game directory');
  }
  return target;
}
module.exports = { resolveAsset };
