# New Tab Dashboard

A lightweight, self-hosted new tab homepage built using plain HTML, CSS, and JavaScript.

This project is designed to be fast, easily configurable, and suitable for hosting on GitHub Pages without any server-side dependencies.

---

## Overview

The New Tab Dashboard provides a clean and functional start page featuring:

- A live clock and date display
- Google search with autocomplete suggestions
- Optional Google Images search toggle
- Current weather conditions with an hourly forecast
- Configurable bookmark folders with dropdown menus
- Centralised theme and layout configuration

The project does not rely on any frameworks, local storage, or build tools.

---

## Hosting

This project is intended to be hosted as a static site, for example using **GitHub Pages**.

It can also be used locally by opening the HTML file directly in a browser.

---

## Configuration

All user-editable settings are grouped at the top of `index.html` and clearly marked.

### Bookmark Folders

Bookmark folders are defined using a JavaScript configuration object:

```js
const BOOKMARK_FOLDERS = [
  {
    title: "Google",
    enabled: true,
    links: [
      { name: "Gmail", url: "https://mail.google.com" },
      { name: "YouTube", url: "https://www.youtube.com" }
    ]
  }
];

    Each object represents a dropdown menu

    enabled: false will hide a folder without removing it

    Folder order is preserved as defined

    No HTML changes are required when adding or removing folders
```
---
Weather Settings

Weather data is provided by the Open-Meteo API and requires no API key.

```js

const WEATHER_CONFIG = {
  lat: 52.71978,
  lon: -1.35687,
  hours: 6
};

    Latitude and longitude control the location

    hours controls the number of upcoming hourly forecasts displayed

```
Theme Settings

The visual appearance is controlled using CSS variables:

```js
:root {
  --bg: #0f1115;
  --card: #161a22;
  --text: #eaeaf0;
  --muted: #9aa0a6;
  --accent: #8ab4f8;
  --border: #232938;
  --radius: 18px;
}

Adjusting these values will update the theme globally.

```
---
Project Structure

/
├── index.html

├── Icon.png

└── README.md

The entire application is contained within a single HTML file for ease of maintenance and portability.
Design Principles

  No frameworks or build steps

  No cookies or persistent storage

  Fully configurable via code

  Suitable for personal use or sharing

  Predictable, readable structure

License

This project is released under the MIT License.
Credits

  Weather data: Open-Meteo

  Weather icons: OpenWeatherMap

  Search suggestions: Google Suggest API
