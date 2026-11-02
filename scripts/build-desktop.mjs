import { packager } from '@electron/packager';
import { readFile, mkdir, cp, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
const platform = process.platform;
const arch = process.arch;
const stage = path.join(root, '.desktop-stage');
const output = path.join(root, 'desktop-builds');
const release = path.join(root, 'release');
await rm(stage, { recursive: true, force: true });
await mkdir(stage, { recursive: true });
for (const name of ['dist', 'desktop', 'LICENSE', 'THIRD_PARTY_NOTICES.md', 'CONTRIBUTORS.md', 'README.md']) {
  await cp(path.join(root, name), path.join(stage, name), { recursive: true });
}
await writeFile(path.join(stage, 'package.json'), JSON.stringify({ ...pkg, scripts: {}, devDependencies: {} }, null, 2));
const [appDir] = await packager({
  dir: stage, out: output, name: 'FNAF-2D', platform, arch,
  electronVersion: pkg.devDependencies.electron,
  appVersion: pkg.version, buildVersion: pkg.version,
  appBundleId: 'com.dunizzm.fnaf2d', appCategoryType: 'public.app-category.games',
  executableName: 'FNAF-2D', overwrite: true, prune: true, asar: true,
  osxSign: false, osxNotarize: false
});
const executable = platform === 'darwin' ? path.join(appDir, 'FNAF-2D.app', 'Contents', 'MacOS', 'FNAF-2D') : path.join(appDir, platform === 'win32' ? 'FNAF-2D.exe' : 'FNAF-2D');
// Run the packaged executable on its native OS before making a release artifact.
const launcher = platform === 'linux' ? 'xvfb-run' : executable;
const args = platform === 'linux' ? ['-a', executable, '--smoke-test'] : ['--smoke-test'];
const smoke = spawnSync(launcher, args, { stdio: 'inherit', timeout: 90000 });
if (smoke.error || smoke.status !== 0) throw smoke.error || new Error(`Packaged smoke test failed: ${smoke.status}`);
await mkdir(release, { recursive: true });
const label = { win32: 'windows', darwin: 'macos', linux: 'linux' }[platform];
const stem = `FNAF-2D-${pkg.version}-${label}-${arch}`;
let archive;
if (platform === 'linux') {
  archive = path.join(release, stem + '.tar.gz');
  const result = spawnSync('tar', ['-czf', archive, '-C', path.dirname(appDir), path.basename(appDir)], { stdio: 'inherit' });
  if (result.status !== 0) throw new Error('tar failed');
} else if (platform === 'darwin') {
  archive = path.join(release, stem + '.zip');
  const result = spawnSync('ditto', ['-c', '-k', '--sequesterRsrc', '--keepParent', path.join(appDir, 'FNAF-2D.app'), archive], { stdio: 'inherit' });
  if (result.status !== 0) throw new Error('ditto failed');
} else {
  archive = path.join(release, stem + '.zip');
  const result = spawnSync('7z', ['a', '-tzip', archive, path.join(appDir, '*')], { stdio: 'inherit' });
  if (result.status !== 0) throw new Error('zip failed');
}
console.log('RELEASE_ARTIFACT', archive);
