# Electron Web Browser

A modern web browser built with Electron, featuring a custom macOS-style title bar and tab support.

## Features

- Custom macOS-style title bar
- Multi-tab support
- Modern clean design
- Navigation controls (back, forward, refresh, home)
- Address bar with search functionality
- Password manager
  - Save and manage website credentials
  - Auto-fill login forms
  - Edit and delete saved passwords
  - Support for multiple password sources (local, keychain, browsers)
- Theme support (light/dark/system)
- URL suggestions and history

## Technologies

- Electron
- HTML/CSS/JavaScript
- Font Awesome icons
- System Keychain integration

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd electron-browser

# Install dependencies
npm install
```

## Usage

```bash
# Start the application
npm start

# Build the application
npm run build
```

## Controls

- Click + to create a new tab
- Click on a tab to activate it
- Click X on a tab to close it
- Use the address bar to enter URLs or search
- Click the key icon to open password manager
- Click the gear icon to open settings

## Password Manager

- Click the key icon in the toolbar to open the password manager
- Click "Add Password" to save new credentials
- Click edit icon on a password item to modify it
- Click delete icon to remove saved credentials
- Click on a password item to auto-fill it in the active tab

## Project Structure

```
electron-browser/
├── src/                      # Source files
│   ├── main.js               # Electron main process
│   ├── preload.js            # Preload script
│   ├── renderer.js           # Renderer process
│   ├── index.html            # Main HTML file
│   ├── styles/               # CSS styles
│   │   └── styles.css        # Main CSS file
│   └── assets/               # Additional resources (images etc.)
├── package.json              # Project configuration
└── README.md                 # Documentation