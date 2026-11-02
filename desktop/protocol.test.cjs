const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { resolveAsset } = require('./protocol.cjs');
const root = path.resolve('dist');
test('loads index and encoded audio names from the packaged game only', () => {
  assert.equal(resolveAsset('fnaf://game/', root), path.join(root, 'index.html'));
  assert.equal(resolveAsset('fnaf://game/assets/Sounds/music%20box.mp3', root), path.join(root, 'assets/Sounds/music box.mp3'));
});
test('rejects other origins and encoded paths outside the game', () => {
  for (const url of ['https://game/index.html', 'fnaf://other/index.html', 'fnaf://user@game/index.html', 'fnaf://game/..%2fREADME.md', 'fnaf://game/%5c..%5cREADME.md', 'fnaf://game/%00']) {
    assert.throws(() => resolveAsset(url, root));
  }
});
