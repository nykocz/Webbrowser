// Definice výchozích nastavení a konstanta settings
const DEFAULT_SETTINGS = {
  startPage: 'https://www.google.com',
  searchEngine: 'google',
  autoFill: true,
  passwordSources: {
    keychain: true,
    safari: true,
    chrome: true,
    firefox: true
  },
  theme: 'system',
  useTransparency: true,
  fontSize: 100,
  saveHistory: true,
  clearHistoryPeriod: 'never',
  blockTrackers: true,
  malwareProtection: true,
  startupMode: 'homepage'
};

// Centralizovaná správa nastavení
const settings = {
  // Aktuální nastavení (bude naplněno při inicializaci)
  current: { ...DEFAULT_SETTINGS },

  // Inicializace nastavení
  async init() {
    try {
      if (window.api && window.api.getSettings) {
        const savedSettings = await window.api.getSettings();
        if (savedSettings) {
          // Sloučí uložená nastavení s výchozími (pro případ nových položek)
          Object.assign(this.current, savedSettings);
        }
      }
      return this.current;
    } catch (error) {
      console.error('Chyba při inicializaci nastavení:', error);
      return this.current;
    }
  },

  // Uložení nastavení
  async save(newSettings) {
    try {
      if (window.api && window.api.saveSettings) {
        const result = await window.api.saveSettings(newSettings);
        if (result.success) {
          // Aktualizace lokálního objektu nastavení
          Object.assign(this.current, newSettings);
          return { success: true };
        }
        return { success: false, error: 'Nepodařilo se uložit nastavení' };
      }
      return { success: false, error: 'API pro uložení nastavení není k dispozici' };
    } catch (error) {
      console.error('Chyba při ukládání nastavení:', error);
      return { success: false, error: error.message };
    }
  },

  // Resetování nastavení na výchozí hodnoty
  async reset() {
    try {
      if (window.api && window.api.saveSettings) {
        const result = await window.api.saveSettings(DEFAULT_SETTINGS);
        if (result.success) {
          // Resetuje lokální objekt nastavení
          this.current = { ...DEFAULT_SETTINGS };
          return { success: true };
        }
        return { success: false, error: 'Nepodařilo se resetovat nastavení' };
      }
      return { success: false, error: 'API pro uložení nastavení není k dispozici' };
    } catch (error) {
      console.error('Chyba při resetování nastavení:', error);
      return { success: false, error: error.message };
    }
  },

  // Získání jedné hodnoty nastavení
  get(key) {
    return this.current[key];
  },

  // Nastavení jedné hodnoty
  set(key, value) {
    this.current[key] = value;
  },

  // Aplikace motivu
  applyTheme() {
    const theme = this.current.theme;
    
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.body.classList.add('theme-dark');
      document.body.classList.remove('theme-light');
    } else {
      document.body.classList.add('theme-light');
      document.body.classList.remove('theme-dark');
    }
  },

  // Aplikace velikosti písma
  applyFontSize() {
    document.documentElement.style.fontSize = `${this.current.fontSize}%`;
  },

  // Aplikace průhlednosti
  applyTransparency() {
    document.body.classList.toggle('no-transparency', !this.current.useTransparency);
  },

  // Aplikace všech nastavení vzhledu
  applyAppearance() {
    this.applyTheme();
    this.applyFontSize();
    this.applyTransparency();
  }
};

// Funkce pro získání HTML obsahu pro nastavení jako tab
function getSettingsContent() {
  return `
    <div class="tab-settings-container edge-style">
      <div class="tab-settings-sidebar">
        <div class="settings-sidebar-header">
          <div class="settings-sidebar-title">Nastavení</div>
          <div class="settings-search">
            <input type="text" placeholder="Hledat nastavení" class="settings-search-input">
            <i class="fas fa-search"></i>
          </div>
        </div>
        <div class="settings-sidebar-menu">
          <div class="settings-sidebar-item active" data-section="profiles">
            <i class="fas fa-user-circle fa-fw"></i> Profily
          </div>
          <div class="settings-sidebar-item" data-section="privacy">
            <i class="fas fa-shield-alt fa-fw"></i> Soukromí a zabezpečení
          </div>
          <div class="settings-sidebar-item" data-section="appearance">
            <i class="fas fa-paint-brush fa-fw"></i> Vzhled
          </div>
          <div class="settings-sidebar-item" data-section="default">
            <i class="fas fa-globe fa-fw"></i> Výchozí prohlížeč
          </div>
          <div class="settings-sidebar-item" data-section="startup">
            <i class="fas fa-home fa-fw"></i> Úvodní stránka
          </div>
          <div class="settings-sidebar-item" data-section="languages">
            <i class="fas fa-language fa-fw"></i> Jazyky
          </div>
          <div class="settings-sidebar-item" data-section="downloads">
            <i class="fas fa-download fa-fw"></i> Stahování
          </div>
          <div class="settings-sidebar-item" data-section="accessibility">
            <i class="fas fa-universal-access fa-fw"></i> Přístupnost
          </div>
          <div class="settings-sidebar-item" data-section="system">
            <i class="fas fa-cogs fa-fw"></i> Systém a výkon
          </div>
          <div class="settings-sidebar-item" data-section="reset">
            <i class="fas fa-undo fa-fw"></i> Resetovat nastavení
          </div>
          <div class="settings-sidebar-item" data-section="about">
            <i class="fas fa-info-circle fa-fw"></i> O aplikaci
          </div>
        </div>
      </div>
      
      <div class="tab-settings-content">
        <!-- Top settings -->
        <div class="top-settings-section">
          <h2>Hlavní nastavení</h2>
          <div class="top-settings-buttons">
            <button class="top-settings-button">
              <i class="fas fa-trash-alt"></i> Vymazat data prohlížení
            </button>
            <button class="top-settings-button">
              <i class="fas fa-cookie-bite"></i> Správa cookies
            </button>
            <button class="top-settings-button">
              <i class="fas fa-palette"></i> Přizpůsobit motiv
            </button>
            <button class="top-settings-button">
              <i class="fas fa-download"></i> Umístění stahování
            </button>
          </div>
        </div>

        <!-- Profiles section -->
        <div class="settings-section active" id="profiles-section">
          <div class="settings-section-title">
            <span>Profily</span>
            <button class="add-profile-button">
              <i class="fas fa-plus"></i> Přidat profil
            </button>
          </div>
          
          <div class="profile-card">
            <div class="profile-card-content">
              <div class="profile-avatar">
                <i class="fas fa-user-circle"></i>
              </div>
              <div class="profile-info">
                <div class="profile-name">Osobní</div>
                <div class="profile-email" id="tab-account-email-display">Nepřihlášen</div>
                <div class="profile-sync-status">
                  <i class="fas fa-sync"></i> Synchronizace je zapnutá
                </div>
              </div>
              <div class="profile-actions">
                <button class="profile-edit-button">
                  <i class="fas fa-pen"></i>
                </button>
                <button class="profile-delete-button">
                  <i class="fas fa-trash"></i>
                </button>
                <button id="tab-login-button" class="settings-button primary">
                  Přihlásit se
                </button>
              </div>
            </div>
            
            <button class="settings-nav-item">
              <i class="fas fa-user"></i>
              <span>Správa účtu</span>
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
          
          <div class="settings-heading">Nastavení profilu</div>
          <div class="settings-subheading">Tato nastavení prohlížeče platí pro váš profil</div>
          
          <div class="settings-nav-card">
            <button class="settings-nav-item">
              <i class="fas fa-sync"></i>
              <span>Synchronizace</span>
              <i class="fas fa-chevron-right"></i>
            </button>
            
            <button class="settings-nav-item">
              <i class="fas fa-trophy"></i>
              <span>Odměny</span>
              <i class="fas fa-chevron-right"></i>
            </button>
            
            <button class="settings-nav-item">
              <i class="fas fa-file-import"></i>
              <span>Import dat prohlížeče</span>
              <i class="fas fa-chevron-right"></i>
            </button>
            
            <button class="settings-nav-item">
              <i class="fas fa-sliders-h"></i>
              <span>Předvolby profilu</span>
              <i class="fas fa-chevron-right"></i>
            </button>
            
            <button class="settings-nav-item">
              <i class="fas fa-th-large"></i>
              <span>Pracovní prostory</span>
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
          
          <div class="settings-heading">Microsoft Wallet</div>
          <div class="settings-subheading">Wallet bezpečně ukládá všechny vaše osobní údaje a aktiva</div>
          
          <div class="settings-nav-card">
            <button class="settings-nav-item">
              <i class="fas fa-wallet"></i>
              <span>Otevřít Wallet</span>
              <i class="fas fa-external-link-alt"></i>
            </button>
            
            <button class="settings-nav-item">
              <i class="fas fa-credit-card"></i>
              <span>Platební informace</span>
              <i class="fas fa-chevron-right"></i>
            </button>
            
            <button class="settings-nav-item">
              <i class="fas fa-key"></i>
              <span>Hesla</span>
              <i class="fas fa-chevron-right"></i>
            </button>
            
            <button class="settings-nav-item">
              <i class="fas fa-id-card"></i>
              <span>Osobní údaje</span>
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
        
        <!-- Privacy section -->
        <div class="settings-section" id="privacy-section">
          <div class="settings-section-title">
            <span>Soukromí a zabezpečení</span>
          </div>
          
          <div class="settings-nav-card">
            <button class="settings-nav-item">
              <i class="fas fa-shield-alt"></i>
              <span>Ochrana před sledováním</span>
              <div class="settings-toggle">
                <label class="settings-switch">
                  <input type="checkbox" id="tab-tracking-protection-toggle" checked>
                  <span class="settings-slider"></span>
                </label>
              </div>
            </button>
            
            <button class="settings-nav-item">
              <i class="fas fa-cookie-bite"></i>
              <span>Cookies a data stránek</span>
              <i class="fas fa-chevron-right"></i>
            </button>
            
            <button class="settings-nav-item">
              <i class="fas fa-lock"></i>
              <span>Bezpečné prohlížení</span>
              <i class="fas fa-chevron-right"></i>
            </button>
            
            <button class="settings-nav-item">
              <i class="fas fa-history"></i>
              <span>Historie prohlížení</span>
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
        
        <!-- Appearance section -->
        <div class="settings-section" id="appearance-section">
          <div class="settings-section-title">
            <span>Vzhled</span>
          </div>
          
          <div class="settings-card">
            <div class="settings-option">
              <div class="settings-option-label">Motiv</div>
              <div class="theme-selector">
                <label class="theme-option">
                  <input type="radio" name="tab-theme" value="system" checked>
                  <div class="theme-preview system-theme">
                    <i class="fas fa-laptop"></i>
                    <span>Systémový</span>
                  </div>
                </label>
                <label class="theme-option">
                  <input type="radio" name="tab-theme" value="light">
                  <div class="theme-preview light-theme">
                    <i class="fas fa-sun"></i>
                    <span>Světlý</span>
                  </div>
                </label>
                <label class="theme-option">
                  <input type="radio" name="tab-theme" value="dark">
                  <div class="theme-preview dark-theme">
                    <i class="fas fa-moon"></i>
                    <span>Tmavý</span>
                  </div>
                </label>
              </div>
            </div>
            
            <div class="settings-option">
              <div class="settings-option-row">
                <div class="settings-option-label">Průhlednost</div>
                <label class="settings-switch">
                  <input type="checkbox" id="tab-transparency-toggle" checked>
                  <span class="settings-slider"></span>
                </label>
              </div>
              <div class="settings-info">Efekt rozmazání a průhlednosti</div>
            </div>
            
            <div class="settings-option">
              <div class="settings-option-label">Velikost písma</div>
              <div class="font-size-control">
                <button class="font-size-btn" data-size="smaller">A<sup>-</sup></button>
                <input type="range" id="tab-font-size-slider" min="80" max="120" value="100" class="settings-range">
                <button class="font-size-btn" data-size="larger">A<sup>+</sup></button>
              </div>
              <div class="settings-info">Upraví velikost textu v prohlížeči</div>
            </div>
          </div>
        </div>
        
        <!-- Other sections will be added when needed -->
      </div>
    </div>
  `;
}

// Vytvoření tabu pro nastavení
function createSettingsTab(tabs, tabsContainer, webviewContainer, activateTab, toggleUrlInput, urlInput, closeTab, DEFAULT_URL, appSettings, passwordSources, updatePasswordLists, applyTheme, settingsKeychainSource, settingsSafariSource, settingsChromeSource, settingsFirefoxSource) {
  // Zkontrolovat, zda nastavení tab již existuje
  const existingSettingsTab = tabs.find(tab => tab.isSettings);
  
  if (existingSettingsTab) {
    // Aktivovat existující tab s nastavením
    activateTab(existingSettingsTab.id);
    return;
  }
  
  const tabId = `tab-${Date.now()}`;
  const webviewId = `webview-${Date.now()}`;
  
  // Vytvoření nového panelu
  const tabElement = document.createElement('div');
  tabElement.className = 'tab';
  tabElement.id = tabId;
  tabElement.innerHTML = `
    <div class="tab-icon">
      <i class="fas fa-cog"></i>
    </div>
    <div class="tab-title">Nastavení</div>
    <div class="tab-close">
      <i class="fas fa-times"></i>
    </div>
  `;
  
  // Vytvoření kontejneru pro obsah nastavení místo webview
  const settingsContainer = document.createElement('div');
  settingsContainer.id = webviewId;
  settingsContainer.className = 'settings-webview-container';
  settingsContainer.innerHTML = getSettingsContent();
  
  // Přidání do DOM
  tabsContainer.appendChild(tabElement);
  webviewContainer.appendChild(settingsContainer);
  
  // Přidání do pole panelů
  const tab = {
    id: tabId,
    webviewId: webviewId,
    url: 'about:settings',
    title: 'Nastavení',
    favicon: null,
    isSettings: true
  };
  
  tabs.push(tab);
  
  // Kliknutí na panel pro jeho aktivaci
  tabElement.addEventListener('click', (e) => {
    // Pokud je kliknuto na zavírací tlačítko, nezpracovávat aktivaci
    if (e.target.closest('.tab-close')) {
      return;
    }
    
    // Pokud je tab již aktivní a má třídu selected, zobrazit URL input
    if (tabElement.classList.contains('active') && tabElement.classList.contains('selected')) {
      toggleUrlInput(true);
      urlInput.focus();
      urlInput.select();
      return;
    }
    
    // Pokud je tab již aktivní, ale nemá třídu selected, přidat mu třídu selected
    if (tabElement.classList.contains('active')) {
      tabElement.classList.add('selected');
      return;
    }
    
    // Odstranění třídy selected ze všech tabů
    document.querySelectorAll('.tab').forEach(tab => {
      tab.classList.remove('selected');
    });
    
    // Jinak aktivovat panel
    activateTab(tabId);
  });
  
  // Kliknutí na zavírací tlačítko
  const tabCloseButton = tabElement.querySelector('.tab-close');
  tabCloseButton.addEventListener('click', (e) => {
    e.stopPropagation();
    closeTab(tabId);
  });
  
  // Aktivace nového panelu
  activateTab(tabId);
  
  // Animace pro nový panel
  setTimeout(() => {
    tabElement.classList.add('tab-animated');
  }, 10);
  
  // Inicializace hodnot formuláře nastavení
  setTimeout(() => {
    initTabSettingsValues(appSettings, DEFAULT_URL);
    setupTabSettingsHandlers(appSettings, passwordSources, DEFAULT_URL, updatePasswordLists, applyTheme, settingsKeychainSource, settingsSafariSource, settingsChromeSource, settingsFirefoxSource);
  }, 100);
  
  return tab;
}

// Inicializace hodnot v nastavení
function initTabSettingsValues(appSettings, DEFAULT_URL) {
  if (!appSettings) return;
  
  const homePageInput = document.getElementById('tab-home-page-input');
  const searchEngineSelect = document.getElementById('tab-search-engine-select');
  const autoFillToggle = document.getElementById('tab-auto-fill-toggle');
  const keychainSource = document.getElementById('tab-settings-keychain-source');
  const safariSource = document.getElementById('tab-settings-safari-source');
  const chromeSource = document.getElementById('tab-settings-chrome-source');
  const firefoxSource = document.getElementById('tab-settings-firefox-source');
  const themeRadios = document.querySelectorAll('input[name="tab-theme"]');
  const transparencyToggle = document.getElementById('tab-transparency-toggle');
  const fontSizeSlider = document.getElementById('tab-font-size-slider');
  const saveHistoryToggle = document.getElementById('tab-save-history-toggle');
  const clearHistorySelect = document.getElementById('tab-clear-history-select');
  const blockTrackersToggle = document.getElementById('tab-block-trackers-toggle');
  const malwareProtectionToggle = document.getElementById('tab-malware-protection-toggle');
  const startupRadios = document.querySelectorAll('input[name="tab-startup"]');
  
  if (homePageInput) homePageInput.value = appSettings.startPage || DEFAULT_URL;
  if (searchEngineSelect) searchEngineSelect.value = appSettings.searchEngine || 'google';
  if (autoFillToggle) autoFillToggle.checked = appSettings.autoFill !== false;
  
  if (keychainSource) keychainSource.checked = appSettings.passwordSources?.keychain !== false;
  if (safariSource) safariSource.checked = appSettings.passwordSources?.safari !== false;
  if (chromeSource) chromeSource.checked = appSettings.passwordSources?.chrome !== false;
  if (firefoxSource) firefoxSource.checked = appSettings.passwordSources?.firefox !== false;
  
  // Nastavení téma radio buttonů
  if (themeRadios && themeRadios.length > 0) {
    const currentTheme = appSettings.theme || 'system';
    themeRadios.forEach(radio => {
      if (radio.value === currentTheme) {
        radio.checked = true;
      }
    });
  }
  
  // Nastavení startup radiobuttonů
  if (startupRadios && startupRadios.length > 0) {
    const startupMode = appSettings.startupMode || 'homepage';
    startupRadios.forEach(radio => {
      if (radio.value === startupMode) {
        radio.checked = true;
      }
    });
  }
  
  if (transparencyToggle) transparencyToggle.checked = appSettings.useTransparency !== false;
  
  // Nastavení velikosti písma
  if (fontSizeSlider) {
    fontSizeSlider.value = appSettings.fontSize || 100;
  }
  
  // Nastavení historie
  if (saveHistoryToggle) saveHistoryToggle.checked = appSettings.saveHistory !== false;
  if (clearHistorySelect) clearHistorySelect.value = appSettings.clearHistoryPeriod || 'never';
  
  // Nastavení soukromí a zabezpečení
  if (blockTrackersToggle) blockTrackersToggle.checked = appSettings.blockTrackers !== false;
  if (malwareProtectionToggle) malwareProtectionToggle.checked = appSettings.malwareProtection !== false;
  
  // Informace o účtu
  const accountEmailDisplay = document.getElementById('tab-account-email-display');
  const accountOptions = document.getElementById('account-options');
  const loginButton = document.getElementById('tab-login-button');
  
  if (accountEmailDisplay && appSettings.account && appSettings.account.email) {
    accountEmailDisplay.textContent = appSettings.account.email;
    if (accountOptions) accountOptions.classList.remove('hidden');
    if (loginButton) loginButton.innerHTML = '<i class="fas fa-sign-out-alt"></i> Odhlásit se';
  }
}

// Nastavení event handlerů pro tab nastavení
function setupTabSettingsHandlers(appSettings, passwordSources, DEFAULT_URL, updatePasswordLists, applyTheme, settingsKeychainSource, settingsSafariSource, settingsChromeSource, settingsFirefoxSource) {
  const saveButton = document.getElementById('tab-save-settings-button');
  const resetButton = document.getElementById('tab-reset-settings-button');
  
  if (saveButton) {
    saveButton.addEventListener('click', () => {
      saveTabSettings(appSettings, passwordSources, DEFAULT_URL, updatePasswordLists, applyTheme, settingsKeychainSource, settingsSafariSource, settingsChromeSource, settingsFirefoxSource);
    });
  }
  
  if (resetButton) {
    resetButton.addEventListener('click', resetTabSettings);
  }
  
  // Přidání handleru pro kliknutí na položky v menu
  const sidebarItems = document.querySelectorAll('.settings-sidebar-item');
  sidebarItems.forEach(item => {
    item.addEventListener('click', () => {
      // Odstranění aktivní třídy ze všech položek
      sidebarItems.forEach(i => i.classList.remove('active'));
      
      // Přidání aktivní třídy na kliknutou položku
      item.classList.add('active');
      
      // Získání sekce, kterou chceme zobrazit
      const sectionId = item.getAttribute('data-section');
      
      // Skrytí všech sekcí
      const sections = document.querySelectorAll('.settings-section');
      sections.forEach(section => section.classList.remove('active'));
      
      // Zobrazení vybrané sekce
      const targetSection = document.getElementById(`${sectionId}-section`);
      if (targetSection) {
        targetSection.classList.add('active');
      }
    });
  });
  
  // Nastavení ovládání velikosti písma
  const fontSizeSlider = document.getElementById('tab-font-size-slider');
  const fontSizeBtnSmaller = document.querySelector('.font-size-btn[data-size="smaller"]');
  const fontSizeBtnLarger = document.querySelector('.font-size-btn[data-size="larger"]');
  
  if (fontSizeSlider) {
    fontSizeSlider.addEventListener('input', () => {
      document.documentElement.style.fontSize = `${fontSizeSlider.value}%`;
    });
    
    if (fontSizeBtnSmaller) {
      fontSizeBtnSmaller.addEventListener('click', () => {
        if (fontSizeSlider.value > parseInt(fontSizeSlider.min)) {
          fontSizeSlider.value = parseInt(fontSizeSlider.value) - 5;
          document.documentElement.style.fontSize = `${fontSizeSlider.value}%`;
        }
      });
    }
    
    if (fontSizeBtnLarger) {
      fontSizeBtnLarger.addEventListener('click', () => {
        if (fontSizeSlider.value < parseInt(fontSizeSlider.max)) {
          fontSizeSlider.value = parseInt(fontSizeSlider.value) + 5;
          document.documentElement.style.fontSize = `${fontSizeSlider.value}%`;
        }
      });
    }
  }
  
  // Nastavení tlačítek pro vymazání dat
  const clearCacheButton = document.getElementById('tab-clear-cache-button');
  const clearCookiesButton = document.getElementById('tab-clear-cookies-button');
  const clearAllButton = document.getElementById('tab-clear-all-button');
  
  if (clearCacheButton) {
    clearCacheButton.addEventListener('click', () => {
      if (window.api && window.api.clearCache) {
        window.api.clearCache().then(() => {
          showNotification('Mezipaměť byla vymazána', 'success');
        });
      }
    });
  }
  
  if (clearCookiesButton) {
    clearCookiesButton.addEventListener('click', () => {
      if (window.api && window.api.clearCookies) {
        window.api.clearCookies().then(() => {
          showNotification('Cookies byly vymazány', 'success');
        });
      }
    });
  }
  
  if (clearAllButton) {
    clearAllButton.addEventListener('click', () => {
      if (window.api && window.api.clearBrowsingData) {
        window.api.clearBrowsingData().then(() => {
          showNotification('Všechna data prohlížení byla vymazána', 'success');
        });
      }
    });
  }
  
  // Událost přihlášení
  const loginButton = document.getElementById('tab-login-button');
  if (loginButton) {
    loginButton.addEventListener('click', () => {
      const accountEmailDisplay = document.getElementById('tab-account-email-display');
      const accountOptions = document.getElementById('account-options');
      
      if (accountEmailDisplay && accountEmailDisplay.textContent !== 'Nepřihlášen') {
        // Odhlásit se
        if (window.api && window.api.logout) {
          window.api.logout().then(() => {
            accountEmailDisplay.textContent = 'Nepřihlášen';
            loginButton.innerHTML = '<i class="fas fa-sign-in-alt"></i> Přihlásit se';
            if (accountOptions) accountOptions.classList.add('hidden');
            showNotification('Byli jste odhlášeni', 'info');
          });
        }
      } else {
        // Přihlásit se - zobrazit dialog pro přihlášení
        if (window.api && window.api.showLoginDialog) {
          window.api.showLoginDialog().then((result) => {
            if (result.success && result.email) {
              accountEmailDisplay.textContent = result.email;
              loginButton.innerHTML = '<i class="fas fa-sign-out-alt"></i> Odhlásit se';
              if (accountOptions) accountOptions.classList.remove('hidden');
              showNotification('Byli jste přihlášeni', 'success');
            }
          });
        }
      }
    });
  }
}

// Pomocná funkce pro zobrazení notifikace
function showNotification(message, type = 'info') {
  // Pokud existuje API pro notifikace, použít ho
  if (window.api && window.api.showNotification) {
    window.api.showNotification(message, type);
    return;
  }
  
  // Jinak vytvořit vlastní notifikaci
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
      <span>${message}</span>
    </div>
    <button class="notification-close"><i class="fas fa-times"></i></button>
  `;
  
  document.body.appendChild(notification);
  
  // Zobrazení notifikace s animací
  setTimeout(() => {
    notification.classList.add('notification-visible');
  }, 10);
  
  // Automatické zavření po 3 sekundách
  setTimeout(() => {
    notification.classList.remove('notification-visible');
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
  
  // Tlačítko pro zavření
  const closeButton = notification.querySelector('.notification-close');
  if (closeButton) {
    closeButton.addEventListener('click', () => {
      notification.classList.remove('notification-visible');
      setTimeout(() => {
        notification.remove();
      }, 300);
    });
  }
}

// Uložení nastavení z tabu
async function saveTabSettings(appSettings, passwordSources, DEFAULT_URL, updatePasswordLists, applyTheme, settingsKeychainSource, settingsSafariSource, settingsChromeSource, settingsFirefoxSource) {
  try {
    const homePageInput = document.getElementById('tab-home-page-input');
    const searchEngineSelect = document.getElementById('tab-search-engine-select');
    const autoFillToggle = document.getElementById('tab-auto-fill-toggle');
    const keychainSource = document.getElementById('tab-settings-keychain-source');
    const safariSource = document.getElementById('tab-settings-safari-source');
    const chromeSource = document.getElementById('tab-settings-chrome-source');
    const firefoxSource = document.getElementById('tab-settings-firefox-source');
    const selectedThemeRadio = document.querySelector('input[name="tab-theme"]:checked');
    const transparencyToggle = document.getElementById('tab-transparency-toggle');
    const fontSizeSlider = document.getElementById('tab-font-size-slider');
    const saveHistoryToggle = document.getElementById('tab-save-history-toggle');
    const clearHistorySelect = document.getElementById('tab-clear-history-select');
    const blockTrackersToggle = document.getElementById('tab-block-trackers-toggle');
    const malwareProtectionToggle = document.getElementById('tab-malware-protection-toggle');
    const selectedStartupRadio = document.querySelector('input[name="tab-startup"]:checked');
    
    if (!homePageInput || !searchEngineSelect || !autoFillToggle || 
        !keychainSource || !safariSource || !chromeSource || !firefoxSource) {
      console.error('Některé elementy nastavení nebyly nalezeny');
      return;
    }
    
    const newSettings = {
      startPage: homePageInput.value,
      searchEngine: searchEngineSelect.value,
      autoFill: autoFillToggle.checked,
      passwordSources: {
        keychain: keychainSource.checked,
        safari: safariSource.checked,
        chrome: chromeSource.checked,
        firefox: firefoxSource.checked
      },
      theme: selectedThemeRadio ? selectedThemeRadio.value : 'system',
      useTransparency: transparencyToggle ? transparencyToggle.checked : true,
      fontSize: fontSizeSlider ? parseInt(fontSizeSlider.value) : 100,
      saveHistory: saveHistoryToggle ? saveHistoryToggle.checked : true,
      clearHistoryPeriod: clearHistorySelect ? clearHistorySelect.value : 'never',
      blockTrackers: blockTrackersToggle ? blockTrackersToggle.checked : true,
      malwareProtection: malwareProtectionToggle ? malwareProtectionToggle.checked : true,
      startupMode: selectedStartupRadio ? selectedStartupRadio.value : 'homepage'
    };
    
    // Aktualizace nastavení v main procesu
    const result = await window.api.saveSettings(newSettings);
    
    if (result.success) {
      // Aktualizace lokálního objektu nastavení
      Object.assign(appSettings, newSettings);
      
      // Aktualizace zdrojů hesel ve správci hesel
      passwordSources.keychain.checked = newSettings.passwordSources.keychain;
      passwordSources.safari.checked = newSettings.passwordSources.safari;
      passwordSources.chrome.checked = newSettings.passwordSources.chrome;
      passwordSources.firefox.checked = newSettings.passwordSources.firefox;
      
      // Aktualizace výchozí URL pro nové panely
      DEFAULT_URL = newSettings.startPage;
      
      // Aplikace motivu
      applyTheme(newSettings.theme);
      
      // Aplikace nastavení průhlednosti
      document.body.classList.toggle('no-transparency', !newSettings.useTransparency);
      
      // Aplikace velikosti písma
      document.documentElement.style.fontSize = `${newSettings.fontSize}%`;
      
      // Také aktualizovat hodnoty v původním menu nastavení
      homePageInput.value = newSettings.startPage;
      searchEngineSelect.value = newSettings.searchEngine;
      autoFillToggle.checked = newSettings.autoFill;
      settingsKeychainSource.checked = newSettings.passwordSources.keychain;
      settingsSafariSource.checked = newSettings.passwordSources.safari;
      settingsChromeSource.checked = newSettings.passwordSources.chrome;
      settingsFirefoxSource.checked = newSettings.passwordSources.firefox;
      
      // Aktualizace seznamu hesel
      updatePasswordLists();
      
      // Zobrazit notifikaci o úspěchu
      showNotification('Nastavení bylo úspěšně uloženo', 'success');
    }
  } catch (error) {
    console.error('Chyba při ukládání nastavení:', error);
    showNotification('Chyba při ukládání nastavení', 'error');
  }
}

// Obnovení výchozích nastavení v tabu
function resetTabSettings() {
  // Použití výchozích hodnot z konstanty DEFAULT_SETTINGS
  const defaultSettings = DEFAULT_SETTINGS;
  
  // Nastavení hodnot formuláře
  const homePageInput = document.getElementById('tab-home-page-input');
  const searchEngineSelect = document.getElementById('tab-search-engine-select');
  const autoFillToggle = document.getElementById('tab-auto-fill-toggle');
  const keychainSource = document.getElementById('tab-settings-keychain-source');
  const safariSource = document.getElementById('tab-settings-safari-source');
  const chromeSource = document.getElementById('tab-settings-chrome-source');
  const firefoxSource = document.getElementById('tab-settings-firefox-source');
  const themeRadios = document.querySelectorAll('input[name="tab-theme"]');
  const transparencyToggle = document.getElementById('tab-transparency-toggle');
  const fontSizeSlider = document.getElementById('tab-font-size-slider');
  const saveHistoryToggle = document.getElementById('tab-save-history-toggle');
  const clearHistorySelect = document.getElementById('tab-clear-history-select');
  const blockTrackersToggle = document.getElementById('tab-block-trackers-toggle');
  const malwareProtectionToggle = document.getElementById('tab-malware-protection-toggle');
  const startupRadios = document.querySelectorAll('input[name="tab-startup"]');
  
  if (homePageInput) homePageInput.value = defaultSettings.startPage;
  if (searchEngineSelect) searchEngineSelect.value = defaultSettings.searchEngine;
  if (autoFillToggle) autoFillToggle.checked = defaultSettings.autoFill;
  
  if (keychainSource) keychainSource.checked = defaultSettings.passwordSources.keychain;
  if (safariSource) safariSource.checked = defaultSettings.passwordSources.safari;
  if (chromeSource) chromeSource.checked = defaultSettings.passwordSources.chrome;
  if (firefoxSource) firefoxSource.checked = defaultSettings.passwordSources.firefox;
  
  // Nastavení téma radio buttonů
  if (themeRadios && themeRadios.length > 0) {
    themeRadios.forEach(radio => {
      radio.checked = radio.value === defaultSettings.theme;
    });
  }
  
  // Nastavení startup radiobuttonů
  if (startupRadios && startupRadios.length > 0) {
    startupRadios.forEach(radio => {
      radio.checked = radio.value === defaultSettings.startupMode;
    });
  }
  
  if (transparencyToggle) transparencyToggle.checked = defaultSettings.useTransparency;
  
  // Nastavení velikosti písma
  if (fontSizeSlider) {
    fontSizeSlider.value = defaultSettings.fontSize;
    document.documentElement.style.fontSize = `${defaultSettings.fontSize}%`;
  }
  
  // Nastavení historie
  if (saveHistoryToggle) saveHistoryToggle.checked = defaultSettings.saveHistory;
  if (clearHistorySelect) clearHistorySelect.value = defaultSettings.clearHistoryPeriod;
  
  // Nastavení soukromí a zabezpečení
  if (blockTrackersToggle) blockTrackersToggle.checked = defaultSettings.blockTrackers;
  if (malwareProtectionToggle) malwareProtectionToggle.checked = defaultSettings.malwareProtection;
  
  // Zobrazit notifikaci
  showNotification('Nastavení bylo obnoveno na výchozí hodnoty', 'info');
}

// Exportuji funkce a konstanty pro použití v renderer.js
module.exports = {
  getSettingsContent,
  createSettingsTab,
  initTabSettingsValues,
  setupTabSettingsHandlers,
  saveTabSettings,
  resetTabSettings,
  settings,
  DEFAULT_SETTINGS
};
