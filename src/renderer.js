// Získání reference na DOM elementy
const tabsContainer = document.getElementById('tabs-container');
const webviewContainer = document.getElementById('webview-container');
const urlInput = document.getElementById('url-input');
const urlSuggestions = document.getElementById('url-suggestions');
const newTabButton = document.getElementById('new-tab-button');
const backButton = document.getElementById('back-button');
const forwardButton = document.getElementById('forward-button');
const reloadButton = document.getElementById('reload-button');
const homeButton = document.getElementById('home-button');
const closeButton = document.getElementById('close-button');
const minimizeButton = document.getElementById('minimize-button');
const maximizeButton = document.getElementById('maximize-button');
const bookmarkButton = document.getElementById('bookmark-button');
const settingsButton = document.getElementById('settings-button');
const passwordButton = document.getElementById('password-button');
const passwordMenu = document.getElementById('password-menu');
const passwordMenuClose = document.getElementById('password-menu-close');
const keychainSuggestions = document.getElementById('keychain-suggestions');
const keychainItems = document.getElementById('keychain-items');
const recentPasswordsList = document.getElementById('recent-passwords');
const allPasswordsList = document.getElementById('all-passwords');

// Prvky pro nastavení
const settingsMenu = document.getElementById('settings-menu');
const settingsMenuClose = document.getElementById('settings-menu-close');
const homePageInput = document.getElementById('home-page-input');
const searchEngineSelect = document.getElementById('search-engine-select');
const autoFillToggle = document.getElementById('auto-fill-toggle');
const settingsKeychainSource = document.getElementById('settings-keychain-source');
const settingsSafariSource = document.getElementById('settings-safari-source');
const settingsChromeSource = document.getElementById('settings-chrome-source');
const settingsFirefoxSource = document.getElementById('settings-firefox-source');
const themeSelect = document.getElementById('theme-select');
const saveSettingsButton = document.getElementById('save-settings-button');
const resetSettingsButton = document.getElementById('reset-settings-button');

// Různé zdroje hesel (mapuje se na checkboxy ve správci hesel)
const passwordSources = {
  keychain: document.getElementById('keychain-source'),
  safari: document.getElementById('safari-source'),
  chrome: document.getElementById('chrome-source'),
  firefox: document.getElementById('firefox-source')
};

// Defaultní URL pro nové panely
let DEFAULT_URL = 'https://www.google.com';

// Správa panelů
let tabs = [];
let activeTabId = null;

// Pole pro ukládání historie návštěv
let browsingHistory = [];

// Správa hesel
let savedPasswords = [];
let focusedInput = null;
let currentDomain = '';

// Nastavení aplikace
let appSettings = null;

// Simulované hesla z různých zdrojů
const mockPasswords = [
  { 
    id: 1,
    username: 'jan.novak@gmail.com', 
    password: 'heslo123', 
    domain: 'google.com', 
    favicon: 'https://www.google.com/favicon.ico',
    source: 'keychain'
  },
  { 
    id: 2,
    username: 'jannovak', 
    password: 'bezpecneHeslo456', 
    domain: 'facebook.com', 
    favicon: 'https://www.facebook.com/favicon.ico',
    source: 'safari'
  },
  { 
    id: 3,
    username: 'jan_novak', 
    password: 'jNovak789!', 
    domain: 'twitter.com', 
    favicon: 'https://www.twitter.com/favicon.ico',
    source: 'chrome'
  },
  { 
    id: 4,
    username: 'novak.jan', 
    password: 'superTajneHeslo', 
    domain: 'apple.com', 
    favicon: 'https://www.apple.com/favicon.ico',
    source: 'keychain'
  },
  { 
    id: 5,
    username: 'jan', 
    password: 'hesloProLocal', 
    domain: 'localhost', 
    favicon: '',
    source: 'firefox'
  }
];

// Ovládání okna s kontextovou izolací
closeButton.addEventListener('click', () => {
  window.api.closeWindow();
});

minimizeButton.addEventListener('click', () => {
  window.api.minimizeWindow();
});

maximizeButton.addEventListener('click', () => {
  window.api.maximizeWindow();
});

// Vytvoření nového panelu
function createTab(url = DEFAULT_URL) {
  const tabId = `tab-${Date.now()}`;
  const webviewId = `webview-${Date.now()}`;
  
  // Vytvoření nového panelu
  const tabElement = document.createElement('div');
  tabElement.className = 'tab';
  tabElement.id = tabId;
  tabElement.innerHTML = `
    <div class="tab-icon">
      <i class="fas fa-globe"></i>
    </div>
    <div class="tab-title">Nový panel</div>
    <div class="tab-close">
      <i class="fas fa-times"></i>
    </div>
  `;
  
  // Vytvoření webview
  const webviewElement = document.createElement('webview');
  webviewElement.id = webviewId;
  webviewElement.setAttribute('src', url);
  webviewElement.setAttribute('allowpopups', 'true');
  
  // Přidání do DOM
  tabsContainer.appendChild(tabElement);
  webviewContainer.appendChild(webviewElement);
  
  // Přidání do pole panelů
  const tab = {
    id: tabId,
    webviewId: webviewId,
    url: url,
    title: 'Nový panel',
    favicon: null
  };
  
  tabs.push(tab);
  
  // Přidání eventListenerů
  webviewElement.addEventListener('did-start-loading', () => {
    const tabIconElement = tabElement.querySelector('.tab-icon i');
    tabIconElement.className = 'fas fa-spinner fa-spin';
    
    // Přidání třídy pro loading stav
    tabElement.classList.add('loading');
  });
  
  webviewElement.addEventListener('did-stop-loading', () => {
    const tabIconElement = tabElement.querySelector('.tab-icon i');
    tabIconElement.className = 'fas fa-globe';
    
    // Odstranění třídy pro loading stav
    tabElement.classList.remove('loading');
  });
  
  webviewElement.addEventListener('page-title-updated', (e) => {
    const title = e.title;
    tab.title = title;
    tabElement.querySelector('.tab-title').textContent = title;
    // Aktualizace title hlavního okna, pokud je panel aktivní
    if (tab.id === activeTabId) {
      document.title = `${title} - Electron Prohlížeč`;
    }
  });
  
  webviewElement.addEventListener('page-favicon-updated', (e) => {
    if (e.favicons && e.favicons.length > 0) {
      const favicon = e.favicons[0];
      tab.favicon = favicon;
      
      // Aktualizace ikony panelu
      const tabIconElement = tabElement.querySelector('.tab-icon');
      tabIconElement.innerHTML = `<img src="${favicon}" alt="favicon" />`;
    }
  });
  
  webviewElement.addEventListener('did-navigate', (e) => {
    const currentUrl = e.url;
    tab.url = currentUrl;
    if (tab.id === activeTabId) {
      urlInput.value = currentUrl;
      updateNavigationButtons(webviewElement);
    }
    
    // Přidat do historie pro našeptávač
    addToHistory(currentUrl, tab.title || 'Bez názvu');
    
    // Extrahovat doménu pro detekci přihlašovacích formulářů
    try {
      const domain = new URL(currentUrl).hostname;
      detectLoginForms(webviewElement, domain);
    } catch (error) {
      console.error('Neplatná URL:', error);
    }
  });
  
  webviewElement.addEventListener('did-navigate-in-page', (e) => {
    const currentUrl = e.url;
    tab.url = currentUrl;
    if (tab.id === activeTabId) {
      urlInput.value = currentUrl;
      updateNavigationButtons(webviewElement);
    }
  });
  
  // Event pro zavření panelu
  tabElement.querySelector('.tab-close').addEventListener('click', (e) => {
    e.stopPropagation();
    closeTab(tabId);
  });
  
  // Event pro aktivaci panelu
  tabElement.addEventListener('click', () => {
    activateTab(tabId);
  });
  
  // Animace pro nový panel
  setTimeout(() => {
    tabElement.classList.add('tab-animated');
  }, 10);
  
  // Aktivování vytvořeného panelu
  activateTab(tabId);
  
  return tab;
}

// Aktivování panelu
function activateTab(tabId) {
  // Skrytí všech webview
  document.querySelectorAll('webview').forEach(webview => {
    webview.style.display = 'none';
  });
  
  // Deaktivování všech panelů
  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.remove('active');
  });
  
  // Nalezení a aktivování vybraného panelu
  const tab = tabs.find(tab => tab.id === tabId);
  if (tab) {
    document.getElementById(tab.id).classList.add('active');
    const webview = document.getElementById(tab.webviewId);
    webview.style.display = 'flex';
    urlInput.value = tab.url;
    activeTabId = tabId;
    
    // Aktualizace titulku hlavního okna
    document.title = `${tab.title} - Electron Prohlížeč`;
    
    // Aktualizace stavu navigačních tlačítek
    updateNavigationButtons(webview);
  }
}

// Zavření panelu
function closeTab(tabId) {
  const tabIndex = tabs.findIndex(tab => tab.id === tabId);
  if (tabIndex === -1) return;
  
  // Získání elementu panelu pro animaci
  const tabElement = document.getElementById(tabs[tabIndex].id);
  
  // Animace zavření panelu
  tabElement.classList.add('tab-closing');
  
  // Vyčkání na dokončení animace
  setTimeout(() => {
    // Odstranění z DOM
    const tab = tabs[tabIndex];
    tabElement.remove();
    document.getElementById(tab.webviewId).remove();
    
    // Odstranění z pole
    tabs.splice(tabIndex, 1);
    
    // Pokud byl panel aktivní, aktivujeme jiný
    if (activeTabId === tabId) {
      if (tabs.length > 0) {
        // Aktivování nejbližšího panelu
        const newActiveTab = tabs[Math.min(tabIndex, tabs.length - 1)];
        activateTab(newActiveTab.id);
      } else {
        // Pokud nejsou žádné panely, vytvoříme nový
        createTab();
      }
    }
  }, 150); // Doba trvání animace
}

// Aktualizace navigačních tlačítek
function updateNavigationButtons(webview) {
  if (!webview) return;
  
  // Aktualizace stavu tlačítek
  backButton.classList.toggle('disabled', !webview.canGoBack());
  forwardButton.classList.toggle('disabled', !webview.canGoForward());
}

// Přepínání mezi panely pomocí klávesových zkratek
document.addEventListener('keydown', (e) => {
  // Ctrl+Tab pro přepnutí na další panel
  if (e.ctrlKey && e.key === 'Tab') {
    e.preventDefault();
    if (tabs.length > 1) {
      const activeIndex = tabs.findIndex(tab => tab.id === activeTabId);
      const nextIndex = (activeIndex + 1) % tabs.length;
      activateTab(tabs[nextIndex].id);
    }
  }
  
  // Ctrl+Shift+Tab pro přepnutí na předchozí panel
  if (e.ctrlKey && e.shiftKey && e.key === 'Tab') {
    e.preventDefault();
    if (tabs.length > 1) {
      const activeIndex = tabs.findIndex(tab => tab.id === activeTabId);
      const prevIndex = (activeIndex - 1 + tabs.length) % tabs.length;
      activateTab(tabs[prevIndex].id);
    }
  }
  
  // Ctrl+T pro nový panel
  if (e.ctrlKey && e.key === 't') {
    e.preventDefault();
    createTab();
  }
  
  // Ctrl+W pro zavření aktivního panelu
  if (e.ctrlKey && e.key === 'w') {
    e.preventDefault();
    if (activeTabId) {
      closeTab(activeTabId);
    }
  }
});

// Event pro tlačítko nového panelu
newTabButton.addEventListener('click', () => {
  createTab();
});

// Události pro navigační tlačítka
backButton.addEventListener('click', () => {
  if (activeTabId) {
    const tab = tabs.find(tab => tab.id === activeTabId);
    if (tab) {
      const webview = document.getElementById(tab.webviewId);
      if (webview.canGoBack()) {
        webview.goBack();
      }
    }
  }
});

forwardButton.addEventListener('click', () => {
  if (activeTabId) {
    const tab = tabs.find(tab => tab.id === activeTabId);
    if (tab) {
      const webview = document.getElementById(tab.webviewId);
      if (webview.canGoForward()) {
        webview.goForward();
      }
    }
  }
});

reloadButton.addEventListener('click', () => {
  if (activeTabId) {
    const tab = tabs.find(tab => tab.id === activeTabId);
    if (tab) {
      const webview = document.getElementById(tab.webviewId);
      webview.reload();
    }
  }
});

homeButton.addEventListener('click', () => {
  if (activeTabId) {
    const tab = tabs.find(tab => tab.id === activeTabId);
    if (tab) {
      const webview = document.getElementById(tab.webviewId);
      webview.loadURL(DEFAULT_URL);
    }
  }
});

// Událost pro vstup a navigaci adresního řádku
urlInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    
    if (activeTabId) {
      const tab = tabs.find(tab => tab.id === activeTabId);
      if (tab) {
        let url = urlInput.value.trim();
        
        // Jednoduché doplnění protokolu
        if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('file://')) {
          // Pokud obsahuje tečku, považujeme to za doménu
          if (url.includes('.')) {
            url = 'https://' + url;
          } else {
            // Jinak považujeme za vyhledávání
            url = `https://www.google.com/search?q=${encodeURIComponent(url)}`;
          }
        }
        
        const webview = document.getElementById(tab.webviewId);
        webview.loadURL(url);
      }
    }
  }
});

// Událost pro tlačítko záložky (zatím jen ukazatel)
bookmarkButton.addEventListener('click', () => {
  // Pro budoucí implementaci záložek
  alert('Funkce záložek bude implementována v budoucí verzi.');
});

// Událost pro tlačítko nastavení (zatím jen ukazatel)
settingsButton.addEventListener('click', () => {
  // Pro budoucí implementaci nastavení
  //alert('Funkce nastavení bude implementována v budoucí verzi.');
});

// Funkce pro filtrování a zobrazení našeptávače
function showSuggestions(input) {
  // Vyčištění předchozího obsahu
  urlSuggestions.innerHTML = '';
  
  if (!input.trim()) {
    urlSuggestions.classList.remove('visible');
    return;
  }
  
  // Filtrování historie podle zadaného vstupu
  const filteredHistory = browsingHistory.filter(item => {
    return item.url.toLowerCase().includes(input.toLowerCase()) || 
           item.title.toLowerCase().includes(input.toLowerCase());
  }).slice(0, 5); // Omezíme na 5 položek z historie
  
  // Populární stránky pro určité klíčové slovo, pokud odpovídá
  const popularSites = getPopularSitesForKeyword(input.toLowerCase());
  
  // Přidání výsledků Google vyhledávání, pokud vstup neobsahuje URL formát
  let searchSuggestion = null;
  if (!input.includes('://') && !input.match(/^[\w-]+(\.[\w-]+)+/)) {
    searchSuggestion = {
      title: `Vyhledat "${input}"`,
      url: `https://www.google.com/search?q=${encodeURIComponent(input)}`,
      type: 'search'
    };
  }
  
  // Automatické doplnění aktuálního vstupu jako URL
  let autocompleteSuggestion = null;
  if (input.includes('.') && !input.includes(' ') && !input.startsWith('http')) {
    autocompleteSuggestion = {
      title: `Přejít na "${input}"`,
      url: `https://${input}`,
      type: 'autocomplete'
    };
  }
  
  // Zobrazení našeptávače pouze pokud máme výsledky
  if (filteredHistory.length > 0 || searchSuggestion || popularSites.length > 0 || autocompleteSuggestion) {
    // Nejprve přidáme automatické doplnění, pokud existuje
    if (autocompleteSuggestion) {
      addSuggestionItem(autocompleteSuggestion);
    }
    
    // Pak přidáme vyhledávání, pokud existuje
    if (searchSuggestion) {
      addSuggestionItem(searchSuggestion);
    }
    
    // Přidáme populární stránky pro tento vstup
    popularSites.forEach(site => {
      addSuggestionItem({
        title: site.title,
        url: site.url,
        type: 'popular',
        icon: site.icon
      });
    });
    
    // Poté přidáme položky z historie
    filteredHistory.forEach(item => {
      addSuggestionItem(item);
    });
    
    // Zobrazení našeptávače
    urlSuggestions.classList.add('visible');
  } else {
    urlSuggestions.classList.remove('visible');
  }
}

// Funkce pro získání populárních stránek pro klíčové slovo
function getPopularSitesForKeyword(keyword) {
  const popularSites = [
    {
      keywords: ['mail', 'email', 'pošta', 'gmail'],
      title: 'Gmail',
      url: 'https://mail.google.com',
      icon: 'fa-envelope'
    },
    {
      keywords: ['facebook', 'fb', 'sociální síť'],
      title: 'Facebook',
      url: 'https://www.facebook.com',
      icon: 'fab fa-facebook'
    },
    {
      keywords: ['youtube', 'video', 'videa'],
      title: 'YouTube',
      url: 'https://www.youtube.com',
      icon: 'fab fa-youtube'
    },
    {
      keywords: ['zprávy', 'news', 'aktu'],
      title: 'Aktuálně.cz',
      url: 'https://www.aktualne.cz',
      icon: 'fa-newspaper'
    },
    {
      keywords: ['počasí', 'weather'],
      title: 'Počasí',
      url: 'https://www.chmi.cz',
      icon: 'fa-cloud'
    },
    {
      keywords: ['mapy', 'maps', 'navigace'],
      title: 'Mapy.cz',
      url: 'https://www.mapy.cz',
      icon: 'fa-map'
    }
  ];
  
  return popularSites.filter(site => 
    site.keywords.some(k => k.includes(keyword) || keyword.includes(k))
  ).slice(0, 2); // Max 2 výsledky
}

// Funkce pro přidání položky do našeptávače
function addSuggestionItem(item) {
  const suggestionItem = document.createElement('div');
  suggestionItem.className = 'suggestion-item';
  
  // Ikona
  const suggestionIcon = document.createElement('div');
  suggestionIcon.className = 'suggestion-icon';
  
  if (item.type === 'search') {
    suggestionIcon.innerHTML = '<i class="fas fa-search"></i>';
  } else if (item.type === 'autocomplete') {
    suggestionIcon.innerHTML = '<i class="fas fa-arrow-right"></i>';
  } else if (item.type === 'popular' && item.icon) {
    suggestionIcon.innerHTML = `<i class="fas ${item.icon}"></i>`;
  } else if (item.favicon) {
    suggestionIcon.innerHTML = `<img src="${item.favicon}" alt="favicon" onerror="this.onerror=null; this.src=''; this.parentNode.innerHTML='<i class=\\'fas fa-globe\\'></i>';" />`;
  } else {
    suggestionIcon.innerHTML = '<i class="fas fa-globe"></i>';
  }
  
  // Text
  const suggestionText = document.createElement('div');
  suggestionText.className = 'suggestion-text';
  
  const suggestionTitle = document.createElement('div');
  suggestionTitle.className = 'suggestion-title';
  suggestionTitle.textContent = item.title;
  
  const suggestionUrl = document.createElement('div');
  suggestionUrl.className = 'suggestion-url';
  suggestionUrl.textContent = item.url;
  
  // Přidat časovou známku, pokud jde o historii
  if (item.lastAccessed) {
    const timeAgo = getTimeAgo(item.lastAccessed);
    const visitInfo = document.createElement('div');
    visitInfo.className = 'suggestion-visit-info';
    visitInfo.textContent = timeAgo;
    suggestionText.appendChild(visitInfo);
  }
  
  suggestionText.appendChild(suggestionTitle);
  suggestionText.appendChild(suggestionUrl);
  
  // Sestavení položky
  suggestionItem.appendChild(suggestionIcon);
  suggestionItem.appendChild(suggestionText);
  
  // Událost kliknutí na položku
  suggestionItem.addEventListener('click', () => {
    if (activeTabId) {
      const activeTab = tabs.find(tab => tab.id === activeTabId);
      if (activeTab) {
        const webview = document.getElementById(activeTab.webviewId);
        webview.loadURL(item.url);
        urlInput.value = item.url;
        urlSuggestions.classList.remove('visible');
      }
    }
  });
  
  // Přidání položky do našeptávače
  urlSuggestions.appendChild(suggestionItem);
}

// Pomocná funkce pro získání časového rozdílu ve formátu "před X minutami/hodinami/dny..."
function getTimeAgo(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) {
    return 'Právě teď';
  } else if (minutes < 60) {
    return `Před ${minutes} ${getCorrectForm(minutes, 'minutou', 'minutami', 'minutami')}`;
  } else if (hours < 24) {
    return `Před ${hours} ${getCorrectForm(hours, 'hodinou', 'hodinami', 'hodinami')}`;
  } else if (days < 7) {
    return `Před ${days} ${getCorrectForm(days, 'dnem', 'dny', 'dny')}`;
  } else {
    const date = new Date(timestamp);
    return `${date.getDate()}. ${date.getMonth() + 1}. ${date.getFullYear()}`;
  }
}

// Pomocná funkce pro správné skloňování českých slov
function getCorrectForm(num, form1, form2, form5) {
  if (num === 1) {
    return form1;
  } else if (num >= 2 && num <= 4) {
    return form2;
  } else {
    return form5;
  }
}

// Přidání URL do historie pro našeptávač
function addToHistory(url, title) {
  // Ignorujeme prázdné nebo neplatné URL
  if (!url || url === 'about:blank') return;
  
  // Kontrola, zda již URL v historii existuje
  const existingIndex = browsingHistory.findIndex(item => item.url === url);
  
  if (existingIndex !== -1) {
    // Pokud již existuje, aktualizujeme čas přístupu a posuneme na začátek
    browsingHistory[existingIndex].lastAccessed = Date.now();
    browsingHistory[existingIndex].title = title;
    browsingHistory[existingIndex].visitCount = (browsingHistory[existingIndex].visitCount || 0) + 1;
    const item = browsingHistory.splice(existingIndex, 1)[0];
    browsingHistory.unshift(item);
  } else {
    // Pokud je v URL favicon, uložíme jeho URL
    let faviconUrl = null;
    try {
      const urlObj = new URL(url);
      faviconUrl = `${urlObj.protocol}//${urlObj.hostname}/favicon.ico`;
    } catch (e) {
      // Ignorujeme neplatné URL
    }
    
    // Jinak přidáme novou položku
    browsingHistory.unshift({
      url: url,
      title: title,
      lastAccessed: Date.now(),
      visitCount: 1,
      favicon: faviconUrl
    });
  }
  
  // Omezení velikosti historie
  if (browsingHistory.length > 100) {
    browsingHistory.pop();
  }
  
  // Uložení historie do localStorage
  localStorage.setItem('browsingHistory', JSON.stringify(browsingHistory));
}

// Funkce pro zobrazení historie prohlížení
function showHistoryView() {
  // Zde by byla implementace zobrazení historie v novém panelu
  if (activeTabId) {
    const tab = tabs.find(tab => tab.id === activeTabId);
    if (tab) {
      const webview = document.getElementById(tab.webviewId);
      const historyHtml = generateHistoryHTML();
      
      webview.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(historyHtml)}`);
      urlInput.value = 'electron://historie';
    }
  }
}

// Generování HTML pro stránku historie
function generateHistoryHTML() {
  // Seřazení historie podle času, seskupení podle dnů
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);
  
  // Seskupení položek
  const todayItems = [];
  const yesterdayItems = [];
  const lastWeekItems = [];
  const olderItems = [];
  
  browsingHistory.forEach(item => {
    const date = new Date(item.lastAccessed);
    if (date >= today) {
      todayItems.push(item);
    } else if (date >= yesterday) {
      yesterdayItems.push(item);
    } else if (date >= lastWeek) {
      lastWeekItems.push(item);
    } else {
      olderItems.push(item);
    }
  });
  
  // Generování HTML
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Historie prohlížení</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, sans-serif;
          margin: 0;
          padding: 20px;
          background-color: #f8f8f8;
          color: #333;
        }
        h1 {
          font-size: 24px;
          margin-bottom: 20px;
          color: #444;
        }
        h2 {
          font-size: 18px;
          margin: 30px 0 15px;
          padding-bottom: 8px;
          border-bottom: 1px solid #eaeaea;
          color: #666;
        }
        .history-item {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          margin-bottom: 8px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          transition: background-color 0.2s;
        }
        .history-item:hover {
          background-color: #f0f4ff;
        }
        .history-icon {
          width: 20px;
          height: 20px;
          margin-right: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .history-icon img {
          width: 16px;
          height: 16px;
          object-fit: contain;
        }
        .history-content {
          flex: 1;
        }
        .history-title {
          font-size: 14px;
          margin-bottom: 4px;
          color: #333;
        }
        .history-url {
          font-size: 12px;
          color: #888;
        }
        .history-time {
          font-size: 12px;
          color: #aaa;
          margin-left: 12px;
          white-space: nowrap;
        }
        .no-history {
          padding: 20px;
          text-align: center;
          color: #888;
          font-style: italic;
        }
      </style>
    </head>
    <body>
      <h1>Historie prohlížení</h1>
      
      <h2>Dnes</h2>
      ${generateHistoryItemsHTML(todayItems)}
      
      <h2>Včera</h2>
      ${generateHistoryItemsHTML(yesterdayItems)}
      
      <h2>Posledních 7 dní</h2>
      ${generateHistoryItemsHTML(lastWeekItems)}
      
      <h2>Starší</h2>
      ${generateHistoryItemsHTML(olderItems)}
    </body>
    </html>
  `;
}

// Generování HTML pro položky historie
function generateHistoryItemsHTML(items) {
  if (items.length === 0) {
    return '<div class="no-history">Žádná historie</div>';
  }
  
  return items.map(item => {
    const date = new Date(item.lastAccessed);
    const timeStr = `${padZero(date.getHours())}:${padZero(date.getMinutes())}`;
    const favicon = item.favicon || '';
    
    return `
      <div class="history-item" data-url="${escapeHtml(item.url)}">
        <div class="history-icon">
          ${favicon ? `<img src="${escapeHtml(favicon)}" alt="" onerror="this.style.display='none'">` : ''}
        </div>
        <div class="history-content">
          <div class="history-title">${escapeHtml(item.title)}</div>
          <div class="history-url">${escapeHtml(item.url)}</div>
        </div>
        <div class="history-time">${timeStr}</div>
      </div>
    `;
  }).join('');
}

// Pomocná funkce pro doplnění nuly u jednociferných čísel
function padZero(num) {
  return num.toString().padStart(2, '0');
}

// Pomocná funkce pro escapování HTML
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Obsluha speciálních URL protokolů
urlInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const inputValue = urlInput.value.trim().toLowerCase();
    
    // Protokol electron:// pro interní stránky
    if (inputValue === 'electron://historie' || inputValue === 'electron://history') {
      e.preventDefault();
      showHistoryView();
      return;
    }
  }
});

// Inicializace nastavení
async function initSettings() {
  try {
    // Načtení nastavení z main procesu
    appSettings = await window.api.getSettings();
    
    // Nastavení hodnot v UI podle načteného nastavení
    homePageInput.value = appSettings.startPage;
    searchEngineSelect.value = appSettings.searchEngine;
    autoFillToggle.checked = appSettings.autoFill;
    
    // Nastavení zdrojů hesel
    settingsKeychainSource.checked = appSettings.passwordSources.keychain;
    settingsSafariSource.checked = appSettings.passwordSources.safari;
    settingsChromeSource.checked = appSettings.passwordSources.chrome;
    settingsFirefoxSource.checked = appSettings.passwordSources.firefox;
    
    // Nastavení také ve správci hesel
    passwordSources.keychain.checked = appSettings.passwordSources.keychain;
    passwordSources.safari.checked = appSettings.passwordSources.safari;
    passwordSources.chrome.checked = appSettings.passwordSources.chrome;
    passwordSources.firefox.checked = appSettings.passwordSources.firefox;
    
    // Nastavení motivu
    themeSelect.value = appSettings.theme;
    applyTheme(appSettings.theme);
    
    // Nastavení výchozí URL pro nové panely
    DEFAULT_URL = appSettings.startPage;
  } catch (error) {
    console.error('Chyba při načítání nastavení:', error);
  }
}

// Uložení nastavení
async function saveSettings() {
  try {
    const newSettings = {
      startPage: homePageInput.value,
      searchEngine: searchEngineSelect.value,
      autoFill: autoFillToggle.checked,
      passwordSources: {
        keychain: settingsKeychainSource.checked,
        safari: settingsSafariSource.checked,
        chrome: settingsChromeSource.checked,
        firefox: settingsFirefoxSource.checked
      },
      theme: themeSelect.value
    };
    
    // Aktualizace nastavení v main procesu
    const result = await window.api.saveSettings(newSettings);
    
    if (result.success) {
      // Aktualizace lokálního objektu nastavení
      appSettings = newSettings;
      
      // Aktualizace zdrojů hesel ve správci hesel
      passwordSources.keychain.checked = newSettings.passwordSources.keychain;
      passwordSources.safari.checked = newSettings.passwordSources.safari;
      passwordSources.chrome.checked = newSettings.passwordSources.chrome;
      passwordSources.firefox.checked = newSettings.passwordSources.firefox;
      
      // Aktualizace výchozí URL pro nové panely
      DEFAULT_URL = newSettings.startPage;
      
      // Aplikace motivu
      applyTheme(newSettings.theme);
      
      // Skrytí menu nastavení
      hideSettingsMenu();
      
      // Aktualizace seznamu hesel
      updatePasswordLists();
    }
  } catch (error) {
    console.error('Chyba při ukládání nastavení:', error);
  }
}

// Obnovení výchozích nastavení
function resetSettings() {
  // Resetování hodnot v UI
  homePageInput.value = 'https://www.google.com';
  searchEngineSelect.value = 'google';
  autoFillToggle.checked = true;
  settingsKeychainSource.checked = true;
  settingsSafariSource.checked = true;
  settingsChromeSource.checked = true;
  settingsFirefoxSource.checked = true;
  themeSelect.value = 'system';
}

// Aplikace tématu
function applyTheme(theme) {
  document.body.classList.remove('theme-light', 'theme-dark');
  
  if (theme === 'system') {
    // Detekce systémového tématu
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.body.classList.add('theme-dark');
    } else {
      document.body.classList.add('theme-light');
    }
  } else {
    document.body.classList.add(`theme-${theme}`);
  }
  
  // Okamžitě aplikovat změnu tématu při změně v nastavení
  if (themeSelect && themeSelect.value === 'dark') {
    document.body.classList.add('theme-dark');
    document.body.classList.remove('theme-light');
  } else if (themeSelect && themeSelect.value === 'light') {
    document.body.classList.add('theme-light');
    document.body.classList.remove('theme-dark');
  }
}

// Přepínání menu nastavení
function toggleSettingsMenu() {
  settingsMenu.classList.toggle('visible');
  
  // Aplikovat aktuální téma při otevření nastavení
  if (settingsMenu.classList.contains('visible') && themeSelect) {
    const currentTheme = themeSelect.value;
    applyTheme(currentTheme);
  }
}

// Skrytí menu nastavení
function hideSettingsMenu() {
  settingsMenu.classList.remove('visible');
}

// Inicializace hesel
async function initPasswords() {
  try {
    // Načtení hesel z localStorage (mock data a historie použitých hesel)
    const savedPasswordsJson = localStorage.getItem('savedPasswords');
    if (savedPasswordsJson) {
      try {
        savedPasswords = JSON.parse(savedPasswordsJson);
      } catch (e) {
        console.error('Chyba při načítání hesel:', e);
        savedPasswords = [];
      }
    } else {
      savedPasswords = [];
    }
    
    // Inicializace seznamu hesel v menu
    updatePasswordLists();
  } catch (error) {
    console.error('Chyba při inicializaci hesel:', error);
  }
}

// Aktualizace seznamů hesel v menu
async function updatePasswordLists() {
  // Vyčištění seznamů
  recentPasswordsList.innerHTML = '';
  allPasswordsList.innerHTML = '';
  
  try {
    // Získání aktuálních zdrojů hesel z nastavení
    const sources = appSettings ? appSettings.passwordSources : {
      keychain: true,
      safari: true,
      chrome: true,
      firefox: true
    };
    
    // Poslední použitá hesla (historická data z localStorage)
    const recentPasswords = [...savedPasswords].sort((a, b) => 
      (b.lastUsed || 0) - (a.lastUsed || 0)).slice(0, 3);
    
    if (recentPasswords.length === 0) {
      recentPasswordsList.innerHTML = '<div class="no-passwords">Žádná nedávno použitá hesla</div>';
    } else {
      recentPasswords.forEach(password => {
        if (sources[password.source]) {
          recentPasswordsList.appendChild(createPasswordItem(password));
        }
      });
    }
    
    // Všechna hesla kombinovaná ze všech zdrojů
    let allPasswords = [...savedPasswords];
    
    // Přidání hesel z keytaru, pokud je zdroj povolen
    if (sources.keychain) {
      try {
        // Získání seznamu všech domén s hesly
        const domains = new Set(allPasswords.map(p => p.domain));
        
        // Pro každou doménu načíst přihlašovací údaje z keytaru
        for (const domain of domains) {
          const result = await window.api.findCredentials(domain);
          if (result.success && result.credentials) {
            // Přidání do seznamu, pokud již neexistují
            result.credentials.forEach(cred => {
              if (!allPasswords.some(p => p.domain === cred.domain && p.username === cred.username)) {
                allPasswords.push({
                  id: `keytar-${cred.domain}-${cred.username}`,
                  username: cred.username,
                  password: cred.password,
                  domain: cred.domain,
                  source: 'keychain'
                });
              }
            });
          }
        }
      } catch (error) {
        console.error('Chyba při načítání hesel z keytaru:', error);
      }
    }
    
    // Filtrování podle povolených zdrojů
    allPasswords = allPasswords.filter(p => sources[p.source]);
    
    if (allPasswords.length === 0) {
      allPasswordsList.innerHTML = '<div class="no-passwords">Žádná uložená hesla</div>';
    } else {
      // Seřazení podle domény
      const sortedPasswords = [...allPasswords].sort((a, b) => 
        a.domain.localeCompare(b.domain));
        
      sortedPasswords.forEach(password => {
        allPasswordsList.appendChild(createPasswordItem(password));
      });
    }
  } catch (error) {
    console.error('Chyba při aktualizaci seznamu hesel:', error);
    allPasswordsList.innerHTML = '<div class="no-passwords">Chyba při načítání hesel</div>';
  }
}

// Vytvoření položky hesla pro zobrazení v menu
function createPasswordItem(password) {
  const item = document.createElement('div');
  item.className = 'password-item';
  
  const favicon = document.createElement('div');
  favicon.className = 'password-favicon';
  
  if (password.favicon) {
    favicon.innerHTML = `<img src="${password.favicon}" alt="${password.domain}" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>${password.domain.charAt(0)}</text></svg>'">`;
  } else {
    favicon.innerHTML = `<i class="fas fa-globe"></i>`;
  }
  
  const info = document.createElement('div');
  info.className = 'password-info';
  
  const domain = document.createElement('div');
  domain.className = 'password-domain';
  domain.textContent = password.domain;
  
  const username = document.createElement('div');
  username.className = 'password-username';
  username.textContent = password.username;
  
  const source = document.createElement('div');
  source.className = 'password-source';
  
  let sourceIcon = '';
  switch (password.source) {
    case 'keychain':
      sourceIcon = 'key';
      break;
    case 'safari':
      sourceIcon = 'safari';
      break;
    case 'chrome':
      sourceIcon = 'chrome';
      break;
    case 'firefox':
      sourceIcon = 'firefox';
      break;
    default:
      sourceIcon = 'lock';
  }
  
  info.appendChild(domain);
  info.appendChild(username);
  
  item.appendChild(favicon);
  item.appendChild(info);
  
  // Událost kliknutí pro automatické vyplnění
  item.addEventListener('click', () => {
    fillCredentials(password);
    passwordMenu.classList.remove('visible');
  });
  
  return item;
}

// Automatické vyplnění přihlašovacích údajů
async function fillCredentials(credentials) {
  if (!activeTabId) return;
  
  const tab = tabs.find(tab => tab.id === activeTabId);
  if (!tab) return;
  
  const webview = document.getElementById(tab.webviewId);
  
  // Aktualizovat čas posledního použití a uložit do localStorage
  if (credentials.id) {
    const passwordIndex = savedPasswords.findIndex(p => p.id === credentials.id);
    if (passwordIndex !== -1) {
      savedPasswords[passwordIndex].lastUsed = Date.now();
    } else {
      // Přidat do seznamu naposledy použitých, pokud tam ještě není
      const newPassword = {
        id: credentials.id || `keytar-${credentials.domain}-${credentials.username}`,
        username: credentials.username,
        password: credentials.password,
        domain: credentials.domain,
        favicon: tab.favicon || '',
        source: credentials.source || 'keychain',
        lastUsed: Date.now()
      };
      savedPasswords.push(newPassword);
    }
    localStorage.setItem('savedPasswords', JSON.stringify(savedPasswords));
  }
  
  // Kód pro vyplnění přihlašovacích údajů ve webview
  const fillScript = `
    (function() {
      // Najít formuláře a vstupní pole
      const forms = document.forms;
      const usernameFields = document.querySelectorAll('input[type="email"], input[type="text"][name*="email"], input[type="text"][name*="user"], input[type="text"][name*="login"]');
      const passwordFields = document.querySelectorAll('input[type="password"]');
      
      // Pokud máme přihlašovací formulář
      if (usernameFields.length > 0 && passwordFields.length > 0) {
        // Vyplnit uživatelské jméno
        const usernameField = usernameFields[0];
        usernameField.value = "${credentials.username}";
        
        // Vyplnit heslo
        const passwordField = passwordFields[0];
        passwordField.value = "${credentials.password}";
        
        // Vyvolat události pro detekci změn
        const event = new Event('input', { bubbles: true });
        usernameField.dispatchEvent(event);
        passwordField.dispatchEvent(event);
        
        // Pokud existuje jeden formulář, najdeme tlačítko odeslání
        if (forms.length === 1) {
          const submitButtons = forms[0].querySelectorAll('button[type="submit"], input[type="submit"]');
          if (submitButtons.length > 0) {
            // Automatické odeslání formuláře není implementováno, 
            // ale mohlo by být v budoucnu volitelné podle nastavení
          }
        }
      }
    })();
  `;
  
  webview.executeJavaScript(fillScript);
  hideKeychainSuggestions();
}

// Detekce přihlašovacích formulářů
function detectLoginForms(webview, domain) {
  if (!webview) return;
  
  const detectionScript = `
    (function() {
      function detectForms() {
        const forms = document.forms;
        const usernameFields = document.querySelectorAll('input[type="email"], input[type="text"][name*="email"], input[type="text"][name*="user"], input[type="text"][name*="login"]');
        const passwordFields = document.querySelectorAll('input[type="password"]');
        
        // Pokud máme přihlašovací formulář
        if (usernameFields.length > 0 && passwordFields.length > 0) {
          // Sledovat zaměření vstupních polí
          usernameFields.forEach(field => {
            field.addEventListener('focus', () => {
              window.electronAPI.focusInput('username');
            });
          });
          
          passwordFields.forEach(field => {
            field.addEventListener('focus', () => {
              window.electronAPI.focusInput('password');
            });
          });
          
          return true;
        }
        
        return false;
      }
      
      // Sledujeme změny DOM pro dynamicky načtené formuláře
      const observer = new MutationObserver(mutations => {
        if (detectForms()) {
          observer.disconnect();
        }
      });
      
      observer.observe(document.body, { childList: true, subtree: true });
      
      // Okamžitá detekce pro již načtené formuláře
      detectForms();
      
      // Přidání API pro komunikaci s renderer procesem
      window.electronAPI = {
        focusInput: (type) => {
          window.postMessage({ type: 'input-focus', inputType: type }, '*');
        }
      };
    })();
  `;
  
  webview.executeJavaScript(detectionScript);
  
  // Naslouchání na zprávy z webview
  webview.addEventListener('ipc-message', event => {
    if (event.channel === 'input-focus') {
      const inputType = event.args[0].inputType;
      focusedInput = inputType;
      showKeychainSuggestions(domain);
    }
  });
  
  // Alternativní způsob komunikace (pro Electron verze, které nepodporují ipc-message)
  webview.addEventListener('console-message', event => {
    try {
      const data = JSON.parse(event.message);
      if (data.type === 'input-focus') {
        focusedInput = data.inputType;
        showKeychainSuggestions(domain);
      }
    } catch (e) {
      // Ignorovat neplatné JSON zprávy
    }
  });
}

// Zobrazení našeptávání z Keychain
function showKeychainSuggestions(domain) {
  if (!domain) return;
  currentDomain = domain;
  
  // Najít odpovídající hesla
  const matchingPasswords = savedPasswords.filter(password => {
    // Porovnání domén (včetně subdomén)
    const passwordDomain = password.domain;
    return domain.includes(passwordDomain) || passwordDomain.includes(domain);
  });
  
  if (matchingPasswords.length === 0) {
    hideKeychainSuggestions();
    return;
  }
  
  // Vyčištění seznamu
  keychainItems.innerHTML = '';
  
  // Přidání nalezených přihlašovacích údajů
  matchingPasswords.forEach(password => {
    const item = document.createElement('div');
    item.className = 'keychain-item';
    
    const icon = document.createElement('div');
    icon.className = 'keychain-icon';
    
    let sourceIconClass = '';
    switch (password.source) {
      case 'keychain':
        sourceIconClass = 'fas fa-key';
        break;
      case 'safari':
        sourceIconClass = 'fab fa-safari';
        break;
      case 'chrome':
        sourceIconClass = 'fab fa-chrome';
        break;
      case 'firefox':
        sourceIconClass = 'fab fa-firefox';
        break;
      default:
        sourceIconClass = 'fas fa-lock';
    }
    
    icon.innerHTML = `<i class="${sourceIconClass}"></i>`;
    
    const info = document.createElement('div');
    info.className = 'keychain-info';
    
    const username = document.createElement('div');
    username.className = 'keychain-username';
    username.textContent = password.username;
    
    const domainElement = document.createElement('div');
    domainElement.className = 'keychain-domain';
    domainElement.textContent = password.domain;
    
    info.appendChild(username);
    info.appendChild(domainElement);
    
    item.appendChild(icon);
    item.appendChild(info);
    
    // Událost kliknutí pro automatické vyplnění
    item.addEventListener('click', () => {
      fillCredentials(password);
    });
    
    keychainItems.appendChild(item);
  });
  
  // Zobrazení našeptávače
  const rect = webviewContainer.getBoundingClientRect();
  keychainSuggestions.style.top = `${rect.top + 10}px`;
  keychainSuggestions.style.left = `${rect.left + 10}px`;
  keychainSuggestions.classList.add('visible');
}

// Skrytí našeptávání z Keychain
function hideKeychainSuggestions() {
  keychainSuggestions.classList.remove('visible');
  focusedInput = null;
}

// Zobrazení menu správce hesel
function togglePasswordMenu() {
  passwordMenu.classList.toggle('visible');
  
  // Při otevření menu aktualizovat seznamy
  if (passwordMenu.classList.contains('visible')) {
    updatePasswordLists();
  }
}

// Skrytí menu správce hesel
function hidePasswordMenu() {
  passwordMenu.classList.remove('visible');
}

// Událost pro tlačítko nastavení
settingsButton.addEventListener('click', toggleSettingsMenu);

// Zavření menu nastavení
settingsMenuClose.addEventListener('click', hideSettingsMenu);

// Uložení nastavení
saveSettingsButton.addEventListener('click', saveSettings);

// Obnovení výchozích nastavení
resetSettingsButton.addEventListener('click', resetSettings);

// Inicializace aplikace
window.addEventListener('DOMContentLoaded', async () => {
  // Načtení nastavení
  await initSettings();
  
  // Inicializace hesel
  await initPasswords();
  
  // Vytvoření prvního panelu
  createTab(DEFAULT_URL);
  
  // Načtení historie
  loadHistory();
  
  // Nastavení hot reload listeneru
  setupHotReload();
});

// Hot reload listener
function setupHotReload() {
  window.api.onHotReload((data) => {
    console.log('🔥 Hot reload aktivován:', data);
    
    // Tady můžeme přidat speciální logiku pro různé typy souborů
    // např. CSS soubory lze načíst bez reloadu stránky
    const filePath = data.file;
    
    if (filePath.endsWith('.css')) {
      reloadCSS();
    }
    
    // Pro ostatní typy souborů se stránka automaticky obnoví z main procesu
  });
}

// Funkce pro přenačtení CSS bez reloadu stránky
function reloadCSS() {
  console.log('🎨 Přenačítání CSS...');
  
  // Najít všechny CSS odkazy
  const links = document.querySelectorAll('link[rel="stylesheet"]');
  
  // Přidat timestamp jako query parametr pro každý CSS soubor
  links.forEach(link => {
    const href = link.getAttribute('href');
    if (href) {
      const newHref = href.split('?')[0] + '?v=' + Date.now();
      link.setAttribute('href', newHref);
    }
  });
}

// Aktualizace průhlednosti okna pro akrylový efekt
function updateAcrylicEffect() {
  // Pro budoucí implementaci s Electron API pro nastavení vibrancy/opacity okna
  // V tomto příkladu používáme CSS pro simulaci efektu
}

// Událost pro tlačítko hesel
passwordButton.addEventListener('click', togglePasswordMenu);

// Zavření menu hesel
passwordMenuClose.addEventListener('click', hidePasswordMenu);

// Načtení historie z localStorage
function loadHistory() {
  const savedHistory = localStorage.getItem('browsingHistory');
  if (savedHistory) {
    try {
      browsingHistory = JSON.parse(savedHistory);
    } catch (e) {
      console.error('Chyba při načítání historie:', e);
      browsingHistory = [];
    }
  }
}

// Obsluha událostí pro našeptávač
urlInput.addEventListener('input', () => {
  showSuggestions(urlInput.value);
});

urlInput.addEventListener('focus', () => {
  if (urlInput.value.trim()) {
    showSuggestions(urlInput.value);
  }
});

// Skrytí našeptávače při kliknutí mimo
document.addEventListener('click', (event) => {
  if (!urlInput.contains(event.target) && !urlSuggestions.contains(event.target)) {
    urlSuggestions.classList.remove('visible');
  }
  
  // Přidáváme obsluhu pro keychainSuggestions
  if (!keychainSuggestions.contains(event.target)) {
    hideKeychainSuggestions();
  }
});

// Obsluha klávesových událostí pro navigaci v našeptávači
urlInput.addEventListener('keydown', (e) => {
  const suggestions = urlSuggestions.querySelectorAll('.suggestion-item');
  const selectedSuggestion = urlSuggestions.querySelector('.suggestion-item.selected');
  let selectedIndex = -1;
  
  if (selectedSuggestion) {
    selectedIndex = Array.from(suggestions).indexOf(selectedSuggestion);
  }
  
  // Šipka dolů
  if (e.key === 'ArrowDown' && urlSuggestions.classList.contains('visible')) {
    e.preventDefault();
    
    if (selectedIndex < suggestions.length - 1) {
      if (selectedSuggestion) selectedSuggestion.classList.remove('selected');
      suggestions[selectedIndex + 1].classList.add('selected');
    } else {
      if (selectedSuggestion) selectedSuggestion.classList.remove('selected');
      suggestions[0].classList.add('selected');
    }
  }
  
  // Šipka nahoru
  if (e.key === 'ArrowUp' && urlSuggestions.classList.contains('visible')) {
    e.preventDefault();
    
    if (selectedIndex > 0) {
      if (selectedSuggestion) selectedSuggestion.classList.remove('selected');
      suggestions[selectedIndex - 1].classList.add('selected');
    } else {
      if (selectedSuggestion) selectedSuggestion.classList.remove('selected');
      suggestions[suggestions.length - 1].classList.add('selected');
    }
  }
  
  // Enter
  if (e.key === 'Enter') {
    if (selectedSuggestion && urlSuggestions.classList.contains('visible')) {
      e.preventDefault();
      selectedSuggestion.click();
    } else {
      // Standardní chování - navigace na zadanou URL
    }
  }
  
  // Escape
  if (e.key === 'Escape' && urlSuggestions.classList.contains('visible')) {
    e.preventDefault();
    urlSuggestions.classList.remove('visible');
  }
}); 