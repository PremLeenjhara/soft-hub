# SoftHub – All Your Digital Tools in One Place

> Premium, modern, fully responsive all-in-one software and digital tool discovery hub built with clean HTML5, modern Tailwind CSS, and modular ES6 JavaScript.

---

## 🌟 Overview

**SoftHub** is a world-class software discovery platform combining the best aspects of *Product Hunt*, *AlternativeTo*, and a premium SaaS marketplace. It allows users to discover, explore, bookmark, and launch popular web applications, tools, and services from one unified, futuristic dashboard.

### 🚀 Key Features

1. **All-in-One Catalog**: Pre-seeded with 26+ authentic platforms across 12 categories:
   - **Video & Streaming**: YouTube, Netflix, Twitch
   - **Social Media**: TikTok, Instagram, Facebook, X (Twitter), Reddit, Snapchat, LinkedIn, Pinterest
   - **AI Tools**: ChatGPT, Google Gemini, Claude AI, Canva AI
   - **Graphic Design**: Canva, Figma, Pinterest
   - **Productivity**: Google Docs, Notion, Google Drive
   - **Music & Audio**: Spotify
   - **Communication**: WhatsApp, Telegram, Discord, Slack
   - **Developer Tools**: GitHub, Vercel
   - **Cloud Storage**: Google Drive
   - **Business Tools**: LinkedIn
   - **Education**: Coursera
2. **Futuristic Glassmorphism Design**:
   - Deep space gradient dark theme (`#090D16`) with glowing ambient mesh orbs.
   - 1-click Light/Dark theme toggle.
   - Smooth CSS micro-interactions, responsive card hover effects, and accessible contrast.
3. **Real-Time Live Search & Multi-Filters**:
   - Instant search input with live autocomplete dropdown.
   - Category filtering across all 12 categories.
   - Multi-sort: Most Popular, A-Z, Z-A, Rating, Recently Added.
   - Quick filters: All Tools, Popular, Recently Added, and My Favorites.
4. **Software Details & Recommendations**:
   - High-resolution authentic SVG brand logos.
   - Full description, verified feature bullets, direct link to official portal.
   - Similar/Alternative tools recommendation carousel.
5. **User Accounts & Personal Dashboard**:
   - User Registration and Login with session persistence.
   - Personal Bookmarks / Saved Favorites.
   - Chronological visit history with timestamps.
   - User profile stats (Favorites count, tools visited).
6. **Secure Admin Dashboard**:
   - Overview metrics: Total Software, Total Users, Total Visits, Active Categories.
   - Full CRUD: Add new software with real-time preview, Edit details, Delete, Toggle Featured.
   - Category distribution breakdown.
   - User management with role promotion.
   - Website traffic analytics and click volume graphs.
7. **Automated Future Tool Ingestion ("Auto-Add Future Websites")**:
   - **Single-Click Ingestion Console**: Simply paste any URL or domain (e.g. `linear.app`, `perplexity.ai`, or `cursor.com`). SoftHub automatically extracts the brand name, retrieves high-res favicons, infers the category via heuristic keyword matching, and registers it to the database instantly!
   - **Auto-Discovery Feed**: Click "Auto-Discover Trending" to automatically detect and ingest new trending tools.
   - **Python Automation Script**: Run `python scripts/auto_fetcher.py --url <URL>` to append future websites directly via terminal.

---

## 📁 Complete Files & Folders Structure

```
App_Galaxy/
├── index.html                   # Main single-page application entrypoint
├── README.md                    # Platform documentation and architecture guide
├── css/
│   ├── style.css                # Glassmorphism design system, theme tokens & animations
│   └── responsive.css           # Breakpoints for mobile, tablet, and desktop
├── js/
│   ├── config.js                # System configuration & 12 category definitions
│   ├── db.js                    # Storage layer (IndexedDB engine with localStorage fallback)
│   ├── auth.js                  # Authentication, session manager & user profiles
│   ├── auto-importer.js         # Automated website ingestion & metadata scraper
│   ├── admin.js                 # Admin dashboard, CRUD controllers & analytics
│   └── app.js                   # Application router, live search & UI controller
├── data/
│   └── tools.json               # Seed database of 26+ authentic popular platforms
└── scripts/
    ├── auto_fetcher.py          # Python CLI tool to auto-ingest future websites
    └── server.py                # Optional local web server with scraping proxy API
```

---

## ⚡ How to Run

SoftHub is built with zero mandatory external build steps and runs instantly in any modern web browser:

### Option 1: Direct Browser Launch
Simply double-click `index.html` or open it with Google Chrome, Microsoft Edge, Firefox, or Safari.

### Option 2: Python Local Server (Recommended)
Open a terminal in the `App_Galaxy` folder and run:
```bash
python scripts/server.py
```
Then visit:
```
http://localhost:8000
```

---

## 🔑 Demo Admin Credentials

SoftHub is pre-seeded with a demonstration administrator account:
- **Email**: `admin@softhub.io`
- **Password**: `admin`

*(You can also register any new regular user account via the "Get Started" button.)*

---

## 🤖 Auto-Adding Future Websites

To add any new website:
1. Click the **⚡ Add Website** button in the header or in the Admin Dashboard.
2. Enter the URL (e.g. `perplexity.ai` or `https://linear.app`).
3. Click **Auto-Add Website**. SoftHub automatically:
   - Fetches the favicon and brand assets.
   - Derives the tool title and formatted description.
   - Infers the category (e.g. "AI Tools" or "Productivity").
   - Publishes it live into the catalog and makes it searchable immediately!
