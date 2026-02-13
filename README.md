# New Tab Dashboard

A lightweight, fully static, configurable new tab homepage built using plain HTML, CSS, and JavaScript.

Designed for GitHub Pages hosting with **no server-side dependencies**, no build tools, and no frameworks.

Currently hosted at:  
https://andypeterstanton.github.io/

---

## Overview

New Tab Dashboard provides a clean, professional start page featuring:

- Live clock and date display
- Multi-engine search (Google, Bing, DuckDuckGo, Ecosia)
- Engine toggle (dropdown selection)
- Image search toggle (engine-aware)
- Autocomplete suggestions (Google + Bing supported)
- Smart URL detection (auto-directs if input looks like a URL)
- Current weather conditions
- 6-hour hourly forecast
- Configurable bookmark folders with dropdown menus
- Fully centralised configuration blocks
- Dark-mode-first professional theme

The entire project runs as a **single static HTML file**.

No local storage.  
No cookies.  
No external frameworks.  
No API keys required.

---

## Hosting

This project is designed for static hosting platforms such as:

- GitHub Pages (recommended)
- Netlify
- Vercel (static mode)
- Any basic web server

It can also be opened locally by double-clicking `index.html`.

---

## Current Features

### 🔎 Search System

- Engine switching
- Image search toggle
- Smart URL detection
- Arrow-key navigation of suggestions
- Left/right arrow “commit suggestion” behaviour
- Configurable search engines
- Per-engine autocomplete handling

### 🌤 Weather

- Powered by Open-Meteo
- No API key required
- Configurable latitude & longitude
- Configurable number of forecast hours
- Responsive layout (no overflow issues)

### 📁 Bookmarks

- Configuration-driven folders
- Enable/disable entire folders
- Easily comment out individual links
- Expandable structure
- No HTML editing required

### 🎨 Theming

- Controlled entirely via CSS variables
- Global design tokens
- Clean, modern dark theme
- Easily adjustable colour palette

---

## Configuration

All editable settings are grouped at the top of `index.html` inside clearly marked configuration blocks.

---

### 1️⃣ Search Engines

```js
const SEARCH_ENGINES = [
  {
    name: "Google",
    enabled: true,
    searchUrl: "...",
    imageUrl: "...",
    suggestUrl: "...",
    jsonp: true
  }
];
```

- `enabled: false` hides an engine
- Image mode is handled automatically
- JSONP suggestions are supported where available

---

### 2️⃣ Bookmark Folders

```js
const BOOKMARK_FOLDERS = [
  {
    title: "Google",
    enabled: true,
    links: [
      { name: "Gmail", url: "https://mail.google.com" }
    ]
  }
];
```

- `enabled: false` hides a folder
- Order is preserved as written
- Add/remove links freely
- No HTML changes required

---

### 3️⃣ Weather Configuration

```js
const WEATHER_CONFIG = {
  lat: 52.71978,
  lon: -1.35687,
  hours: 6
};
```

- `lat` and `lon` control location
- `hours` controls forecast length (e.g. 6 or 12)

Weather powered by Open-Meteo.

---

### 4️⃣ Theme Variables

```css
:root {
  --bg: #0f1115;
  --card: #161a22;
  --text: #eaeaf0;
  --muted: #9aa0a6;
  --accent: #8ab4f8;
  --border: #232938;
  --radius: 18px;
}
```

All colours and design styling are centralised here.

---

## Project Structure

```
├── index.html
├── Icon.png
├── README.md
└── CHANGELOG.md (optional future separation)
```

Everything runs from `index.html` for maximum portability.

---

## Design Principles

- No frameworks
- No build process
- No server-side logic
- No persistent storage
- Fully configuration-driven
- Predictable, readable structure
- Professional but minimal aesthetic

---

## Future Roadmap

Potential enhancements:

- Built-in audio/podcast player
- Optional settings UI panel (static-based)
- Background animation options
- Customisable themes via config presets
- Optional proxy-based universal autocomplete

---

## License

MIT License

---

## Credits

- Weather data: Open-Meteo
- Search suggestions: Google Suggest API & Bing Suggest API
- Weather icons: OpenWeatherMap icon set
