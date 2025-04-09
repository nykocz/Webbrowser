const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const keytar = require('keytar');
const fs = require('fs');
const chokidar = require('chokidar');

// Konstanta pro identifikaci aplikace při ukládání do keychain
const SERVICE = 'ElectronBrowser';

// Cesta k souboru s nastavením
const settingsPath = path.join(app.getPath('userData'), 'settings.json');

// Výchozí nastavení
const defaultSettings = {
  startPage: 'https://www.google.com',
  searchEngine: 'google',
  passwordSources: {
    keychain: true,
    safari: true,
    chrome: true,
    firefox: true
  },
  autoFill: true,
  theme: 'system'
};

// Globální objekt s nastavením
let settings = defaultSettings;

// Uchování globální reference na objekt okna
let mainWindow;

// Hot reload pro vývojové prostředí
function setupHotReload() {
  if (process.env.NODE_ENV !== 'production') {
    console.log('🔥 Nastavuji hot reload sledování souborů...');
    
    // Sledování zdrojových souborů
    const watcher = chokidar.watch([
      path.join(__dirname, '**/*.js'),
      path.join(__dirname, '**/*.html'),
      path.join(__dirname, '**/*.css')
    ], {
      ignored: /node_modules/,
      persistent: true
    });
    
    watcher.on('change', (filePath) => {
      console.log(`🔄 Soubor změněn: ${filePath}`);
      
      if (mainWindow) {
        // Informování rendereru o změně
        mainWindow.webContents.send('hot-reload', { file: filePath });
        
        // Automatický reload stránky
        mainWindow.webContents.reloadIgnoringCache();
        console.log('🔁 Aplikace byla automaticky obnovena');
      }
    });
  }
}

function createWindow() {
  // Vytvoření okna aplikace
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    frame: false, // Odstranění nativního záhlaví
    titleBarStyle: 'hidden',
    titleBarOverlay: false,
    trafficLightPosition: { x: -100, y: -100 }, // Skrytí semaforu posunutím mimo okno
    transparent: true, // Umožní transparentnost pro vibrancy efekt
    vibrancy: 'under-window', // Aktivuje vibrancy efekt na macOS
    visualEffectState: 'active', // Zajistí, že vibrancy efekt je aktivní
    backgroundColor: '#00000000', // Transparentní pozadí
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true, // Povolení kontextové izolace
      webviewTag: true, // Explicitní povolení webview
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Načtení hlavního HTML souboru
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Otevření DevTools v režimu vývoje
  if (process.env.NODE_ENV !== 'production') {
    mainWindow.webContents.openDevTools();
  }

  // Událost zavření okna
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Načtení nastavení
function loadSettings() {
  try {
    if (fs.existsSync(settingsPath)) {
      const data = fs.readFileSync(settingsPath, 'utf8');
      settings = { ...defaultSettings, ...JSON.parse(data) };
    } else {
      // Pokud soubor neexistuje, uložíme výchozí nastavení
      saveSettings(defaultSettings);
    }
  } catch (error) {
    console.error('Chyba při načítání nastavení:', error);
  }
}

// Uložení nastavení
function saveSettings(newSettings) {
  try {
    settings = { ...settings, ...newSettings };
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Chyba při ukládání nastavení:', error);
    return false;
  }
}

// Vytvoření okna, když je aplikace připravena
app.whenReady().then(() => {
  loadSettings();
  createWindow();
  setupHotReload();
});

// Ukončení aplikace, když jsou zavřena všechna okna (kromě macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
  app.quit();
});

app.on('activate', () => {
  // Na macOS je běžné znovu vytvořit okno v aplikaci,
  // když je kliknuto na ikonu v doku a nejsou otevřena žádná jiná okna
  if (mainWindow === null) {
    createWindow();
  }
});

// Zpracování IPC zpráv od rendereru
ipcMain.on('window-minimize', () => {
  mainWindow.minimize();
});

ipcMain.on('window-maximize', () => {
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow.maximize();
  }
});

ipcMain.on('window-close', () => {
  mainWindow.close();
});

ipcMain.on('navigate', (event, url) => {
  mainWindow.webContents.loadURL(url);
});

// Implementace funkcí pro keytar
ipcMain.handle('save-password', async (event, domain, username, password) => {
  try {
    await keytar.setPassword(SERVICE, `${domain}:${username}`, password);
    return { success: true };
  } catch (error) {
    console.error('Chyba při ukládání hesla:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('find-password', async (event, domain) => {
  try {
    // Najde první heslo pro danou doménu
    const credentials = await keytar.findCredentials(SERVICE);
    const domainCredentials = credentials.filter(cred => 
      cred.account.startsWith(`${domain}:`)
    );
    
    if (domainCredentials.length > 0) {
      const account = domainCredentials[0].account;
      const username = account.substring(domain.length + 1);
      return { success: true, username, password: domainCredentials[0].password };
    }
    
    return { success: false, message: 'Žádné heslo nenalezeno' };
  } catch (error) {
    console.error('Chyba při hledání hesla:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('find-credentials', async (event, domain) => {
  try {
    const credentials = await keytar.findCredentials(SERVICE);
    const domainCredentials = credentials.filter(cred => 
      cred.account.startsWith(`${domain}:`)
    ).map(cred => {
      const account = cred.account;
      const username = account.substring(domain.length + 1);
      return { domain, username, password: cred.password, source: 'keychain' };
    });
    
    return { success: true, credentials: domainCredentials };
  } catch (error) {
    console.error('Chyba při hledání přihlašovacích údajů:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('delete-password', async (event, domain, username) => {
  try {
    const result = await keytar.deletePassword(SERVICE, `${domain}:${username}`);
    return { success: result };
  } catch (error) {
    console.error('Chyba při mazání hesla:', error);
    return { success: false, error: error.message };
  }
});

// Funkce pro nastavení
ipcMain.handle('save-settings', async (event, newSettings) => {
  const result = saveSettings(newSettings);
  return { success: result };
});

ipcMain.handle('get-settings', async () => {
  return settings;
}); 