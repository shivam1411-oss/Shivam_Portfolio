// macOS desktop app: the built site (dist/) in its own window, opening on "Learn the Code".
// Pages are served from a private app:// scheme rather than file://, so ES modules, workers,
// localStorage and relative links behave exactly as they do on GitHub Pages.

const { app, BrowserWindow, Menu, net, protocol, shell } = require('electron');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const SITE_URL = 'https://shivam1411-oss.github.io/Shivam_Portfolio/';
// Packaged: Contents/Resources/site. Development (npm start): desktop/site, copied by copy-site.mjs.
const SITE_DIR = app.isPackaged ? path.join(process.resourcesPath, 'site') : path.join(__dirname, 'site');
const PAGES = {
  learn: 'app://site/learn.html',
  portfolio: 'app://site/index.html',
  privacy: 'app://site/privacy.html',
};

protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true } },
]);

/** app://site/<path> → the file inside SITE_DIR. Anything outside it is refused. */
function serveSite(request) {
  const { pathname } = new URL(request.url);
  const relative = decodeURIComponent(pathname) === '/' ? 'index.html' : decodeURIComponent(pathname);
  const file = path.normalize(path.join(SITE_DIR, relative));
  if (!file.startsWith(SITE_DIR + path.sep) || !fs.existsSync(file)) return new Response('Not found', { status: 404 });
  return net.fetch(pathToFileURL(file).toString());
}

// Links to other sites (LinkedIn, WhatsApp, email, phone) open in the default browser or app.
const isInternal = (url) => url.startsWith('app://site/');
const openExternally = (url) => {
  if (/^(https?|mailto|tel):/.test(url)) shell.openExternal(url);
};

// Window size and position are remembered between launches.
const boundsFile = () => path.join(app.getPath('userData'), 'window.json');
const loadBounds = () => {
  try {
    return JSON.parse(fs.readFileSync(boundsFile(), 'utf8'));
  } catch {
    return { width: 1280, height: 860 };
  }
};
const saveBounds = (win) => {
  try {
    fs.writeFileSync(boundsFile(), JSON.stringify(win.getNormalBounds()));
  } catch {
    /* not critical: the window just opens at the default size next time */
  }
};

let mainWindow = null;

function createWindow(page = PAGES.learn) {
  const win = new BrowserWindow({
    ...loadBounds(),
    minWidth: 380,
    minHeight: 500,
    show: false,
    backgroundColor: '#0a0b0e',
    webPreferences: { contextIsolation: true, sandbox: true, nodeIntegration: false },
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (isInternal(url)) return { action: 'allow' }; // e.g. the resume PDF in its own window
    openExternally(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (event, url) => {
    if (isInternal(url)) return;
    event.preventDefault();
    openExternally(url);
  });

  win.once('ready-to-show', () => win.show());
  win.on('close', () => saveBounds(win));
  win.on('closed', () => {
    if (mainWindow === win) mainWindow = null;
  });
  win.loadURL(page);
  return win;
}

/** Show a page in the main window, reopening the window if it was closed. */
function go(page) {
  if (!mainWindow) mainWindow = createWindow(page);
  else {
    mainWindow.loadURL(page);
    mainWindow.show();
  }
}

function buildMenu() {
  const current = () => BrowserWindow.getFocusedWindow()?.webContents;
  return Menu.buildFromTemplate([
    { role: 'appMenu' },
    { role: 'editMenu' },
    {
      label: 'Go',
      submenu: [
        { label: 'Learn the Code', accelerator: 'CmdOrCtrl+1', click: () => go(PAGES.learn) },
        { label: 'Portfolio', accelerator: 'CmdOrCtrl+2', click: () => go(PAGES.portfolio) },
        { label: 'Privacy Policy', accelerator: 'CmdOrCtrl+3', click: () => go(PAGES.privacy) },
        { type: 'separator' },
        { label: 'Back', accelerator: 'CmdOrCtrl+[', click: () => current()?.navigationHistory.goBack() },
        { label: 'Forward', accelerator: 'CmdOrCtrl+]', click: () => current()?.navigationHistory.goForward() },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
        ...(app.isPackaged ? [] : [{ role: 'toggleDevTools' }]),
      ],
    },
    { role: 'windowMenu' },
    {
      role: 'help',
      submenu: [{ label: 'Open the Website in Your Browser', click: () => shell.openExternal(`${SITE_URL}learn.html`) }],
    },
  ]);
}

// One copy of the app at a time: launching it again focuses the open window.
if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (!mainWindow) return go(PAGES.learn);
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  });

  app.whenReady().then(() => {
    protocol.handle('app', serveSite);
    Menu.setApplicationMenu(buildMenu());
    mainWindow = createWindow();
    // Clicking the Dock icon with no window open brings one back (standard on macOS).
    app.on('activate', () => !mainWindow && go(PAGES.learn));
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });
}
