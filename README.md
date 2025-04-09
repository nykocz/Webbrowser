# Electron Webový Prohlížeč

Moderní webový prohlížeč vytvořený s pomocí Electronu s vlastní titulní lištou ve stylu macOS a podporou panelů.

## Funkce

- Vlastní titulní lišta ve stylu macOS
- Podpora více panelů
- Moderní čistý design
- Navigační tlačítka (zpět, vpřed, obnovit, domů)
- Adresní řádek s vyhledáváním

## Technologie

- Electron
- HTML/CSS/JavaScript
- Font Awesome pro ikony

## Instalace

```bash
# Naklonování repozitáře
git clone <repository-url>
cd electron-browser

# Instalace závislostí
npm install
```

## Použití

```bash
# Spuštění aplikace
npm start

# Sestavení aplikace
npm run build
```

## Ovládání

- Kliknutí na + vytvoří nový panel
- Kliknutí na panel ho aktivuje
- Kliknutí na X u panelu ho zavře
- Adresní řádek slouží k zadávání URL nebo vyhledávání

## Struktura projektu

```
electron-browser/
├── src/                      # Zdrojové soubory
│   ├── main.js               # Hlavní proces Electron
│   ├── preload.js            # Preload skript
│   ├── renderer.js           # Renderer proces
│   ├── index.html            # Hlavní HTML soubor
│   ├── styles/               # CSS styly
│   │   └── styles.css        # Hlavní CSS soubor
│   └── assets/               # Další zdroje (obrázky atd.)
├── package.json              # Konfigurace projektu
└── README.md                 # Dokumentace
``` 