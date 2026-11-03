const { app, BrowserWindow, Menu, protocol, net, shell, session } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');
const { pathToFileURL } = require('node:url');
const { resolveAsset } = require('./protocol.cjs');
const smoke = process.argv.includes('--smoke-test');
const root = path.join(__dirname, '..', 'dist');
let window;

protocol.registerSchemesAsPrivileged([{ scheme: 'fnaf', privileges: {
  standard: true, secure: true, supportFetchAPI: true, corsEnabled: true
} }]);

app.setName('FNAF 2D Expanded');
if(smoke)app.setPath('userData',fs.mkdtempSync(path.join(os.tmpdir(),'fnaf-expanded-smoke-')));
const csp = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; media-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-src 'none'";
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.webp': 'image/webp', '.png': 'image/png', '.gif': 'image/gif', '.ttf': 'font/ttf', '.mp3': 'audio/mpeg' };

async function createWindow() {
  window = new BrowserWindow({
    width: 1280, height: 720, minWidth: 800, minHeight: 450,
    title: 'FNAF 2D — Expanded Edition',
    backgroundColor: '#000000', show: !smoke, autoHideMenuBar: true,
    webPreferences: { nodeIntegration: false, contextIsolation: true, sandbox: true, webSecurity: true }
  });
  window.webContents.setWindowOpenHandler(({ url }) => {
    try { const target = new URL(url); if (target.protocol === 'https:' && target.hostname === 'github.com') shell.openExternal(target.href); } catch {}
    return { action: 'deny' };
  });
  window.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith('fnaf://game/')) event.preventDefault();
  });
  await window.loadURL('fnaf://game/');
  if (smoke) {
    try {
      const result = await window.webContents.executeJavaScript(`(async () => {
        await loading;
        if (loadFailed) throw new Error('A required texture failed to load');
        await Sound.init();
        Sound.master.gain.value = 0;
        for (const name of AUDIO_NAMES) if (!Sound.buffers[name]?.length) throw new Error('Missing decoded sound: ' + name);
        Sound.walk(0, 1); Sound.walk(1, 1); Sound.play('jumpscare', 0); Sound.music(true); Sound.stopAll();
        await document.fonts.ready;
        if (!document.fonts.check('16px GameConsolas')) throw new Error('Game font did not load');
        if (document.querySelectorAll('#mapButtons button').length !== 11) throw new Error('Camera map incomplete');
        if (typeof require !== 'undefined') throw new Error('Node leaked into renderer');
        localStorage.setItem('__desktop_smoke', 'ok');
        if (localStorage.getItem('__desktop_smoke') !== 'ok') throw new Error('Save storage unavailable');
        localStorage.removeItem('__desktop_smoke');
        return { textures: Object.keys(assets).length, sounds: AUDIO_NAMES.length, cameras: 11 };
      })()`, true);
      const expanded=await window.webContents.executeJavaScript(fs.readFileSync(path.join(__dirname,'expanded-smoke.js'),'utf8'),true);
      if(process.env.FNAF_SMOKE_SCREENSHOT){
        window.show();
        await window.webContents.executeJavaScript('showShop(); new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');
        const shot=await window.webContents.capturePage();
        fs.writeFileSync(path.resolve(process.env.FNAF_SMOKE_SCREENSHOT),shot.toPNG());
      }
      console.log('DESKTOP_SMOKE_PASS', JSON.stringify({...result,expanded}));
      app.exit(0);
    } catch (error) {
      console.error('DESKTOP_SMOKE_FAIL', error);
      app.exit(1);
    }
  }
}

app.whenReady().then(async () => {
  protocol.handle('fnaf', async request => {
    if (request.method !== 'GET' && request.method !== 'HEAD') return new Response('', { status: 405 });
    try {
      const file = resolveAsset(request.url, root);
      const response = await net.fetch(pathToFileURL(file).href);
      const headers = new Headers(response.headers);
      headers.set('Content-Security-Policy', csp);
      headers.set('Content-Type', mime[path.extname(file)] || 'application/octet-stream');
      return new Response(response.body, { status: response.status, headers });
    } catch { return new Response('Not found', { status: 404 }); }
  });
  session.defaultSession.setPermissionRequestHandler((_contents, permission, callback) => callback(permission === 'fullscreen'));
  session.defaultSession.setPermissionCheckHandler((_contents, permission) => permission === 'fullscreen');
  Menu.setApplicationMenu(process.platform === 'darwin' ? Menu.buildFromTemplate([
    { label: app.name, submenu: [{ role: 'about' }, { type: 'separator' }, { role: 'quit' }] },
    { label: 'Window', submenu: [{ role: 'minimize' }, { role: 'togglefullscreen' }] }
  ]) : null);
  await createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
}).catch(error => { console.error(error); app.exit(1); });
app.on('window-all-closed', () => { if (process.platform !== 'darwin' || smoke) app.quit(); });
if (smoke) setTimeout(() => { console.error('Desktop smoke test timed out'); app.exit(1); }, 60000).unref();
