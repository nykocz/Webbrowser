const { ipcRenderer, contextBridge } = require('electron');

// Vystavení chráněných metod pro preload
contextBridge.exposeInMainWorld('api', {
  // Ovládání okna
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  maximizeWindow: () => ipcRenderer.send('window-maximize'),
  closeWindow: () => ipcRenderer.send('window-close'),
  
  // Navigace
  navigateTo: (url) => ipcRenderer.send('navigate', url),
  
  // Funkce pro správu hesel
  savePassword: (domain, username, password) => ipcRenderer.invoke('save-password', domain, username, password),
  findPassword: (domain) => ipcRenderer.invoke('find-password', domain),
  findCredentials: (domain) => ipcRenderer.invoke('find-credentials', domain),
  deletePassword: (domain, username) => ipcRenderer.invoke('delete-password', domain, username),
  
  // Nastavení
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  getSettings: () => ipcRenderer.invoke('get-settings'),
  
  // Hot reload
  onHotReload: (callback) => {
    ipcRenderer.on('hot-reload', (_, data) => callback(data));
  },
  
  // Webview pomocné funkce
  validateUrl: (url) => {
    // Kontrola formátu URL (pokud neobsahuje protokol, předpokládáme http/https)
    let formattedUrl = url;
    if (!/^https?:\/\//i.test(url)) {
      // Kontrola, zda je to doména nebo vyhledávání
      if (/\.[a-z]{2,}$/i.test(url) || url.includes('.')) {
        formattedUrl = `https://${url}`;
      } else {
        formattedUrl = `https://www.google.com/search?q=${encodeURIComponent(url)}`;
      }
    }
    return formattedUrl;
  },
  
  // Posluchači událostí
  on: (channel, callback) => {
    ipcRenderer.on(channel, (_, ...args) => callback(...args));
  }
}); 