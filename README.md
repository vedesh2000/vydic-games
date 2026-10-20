# Sanatana Games (సనాతన క్రీడలు)

> **A Sacred Indic Games Portal celebrating Sanatana Dharma, divine deity forms, and ancient Vedic wisdom.**  
> Built with **React 19**, **TypeScript**, **Vite**, and **Tailwind CSS v4**.

---

## 🌟 Overview

**Sanatana Games** is an extensible web-based gaming portal designed to bring timeless Indian heritage, philosophy, and iconography into high-fidelity, interactive digital experiences.

The portal serves as a parent container for self-contained, modular Vedic games, complete with full multi-language support across **13 Indic languages and English**, responsive design, procedural sacred temple chimes (Web Audio API), and persistent browser storage.

---

## 🎮 Games in the Collection

### 1. Divya Smarana (దివ్య స్మరణ · Sacred Memory Game)
A devotional memory tile-flip game featuring **32 handcrafted Tanjore-style sacred Hindu deities and avatars**:
- **Grid Options**: Choose from **3×3, 4×4, 5×5, 6×6, and 8×8** boards.
- **Sacred Blessing Tile**: Central **Om / Kalasha** bonus tile for odd grids (3×3 and 5×5).
- **3D Tile Flips**: Smooth CSS 3D perspective flip animations with brass temple mandala backs.
- **32 Deities**: Sri Rama, Sri Krishna, Hanuman, Shiva, Ganesha, Durga, Lakshmi, Saraswati, Venkateswara, Narasimha, Murugan, Surya, Vishnu, Parvati, Brahma, Kali, Dattatreya, Nataraja, Annapurna, Hayagriva, Garuda, Nandi, Sudarshana, Gayatri, Dhanvantari, Ardhanarishwara, Matsya, Kurma, Varaha, Vamana, Parashurama, and Kalki.
- **Deity Darshan Gallery**: Inspect all 32 deity portraits, native mantras, and emblems. Upload custom photos from your device to personalize your cards.
- **Telemetry & Scoreboard**: Live score, move counter, streak combo multipliers, accuracy bonuses, and persistent top scores stored in `localStorage`.
- **Procedural Sound**: Authentic Indian classical temple synthesizer using Web Audio API (temple bells, sitar/tanpura plucks, shankha resonance).

### 2. Moksha Patam (మోక్ష పటం · Gyan Chauper)
The ancient Indian spiritual board game that originated **Snakes and Ladders**:
- **64 Vedic Squares**: Journey from square 1 (Earthly realm) to square 64 (Vaikuntha Moksha / Liberation).
- **Karmic Ladders & Snakes**:
  - **Virtues (புண்ணியம் / पुण्य)**: *Dana* (Charity), *Satya* (Truth), *Daya* (Compassion), *Dhyana* (Meditation), *Bhakti* (Devotion), and *Jnana* (Wisdom) elevate the soul upward.
  - **Vices (पाप / दुर्गुण)**: *Asatya* (Falsehood), *Krodha* (Anger), *Lobha* (Greed), *Mada* (Ego), and *Moha* (Delusion) cause karmic setbacks.
- **Rishi Bot Opponent**: Play solo against a simulated meditative Rishi.
- **Interactive Dice & History Guide**: Historical context explaining Saint Dnyaneshwar's teachings.

### 3. Pipeline Games (Coming Soon)
- **Rama Setu Construction**: Physics/logic puzzle building the sacred bridge across the ocean.
- **Dharma Vidya Quiz**: Puranas, Mahabharata, and Gita-based wisdom challenges.

---

## 🌐 Full Indic Language Support (i18n)

Every single screen, label, deity name, mantra, category tab, and instruction is fully localized into **13 Indic languages**:

| Code | Native Name | Script |
|:---:|:---|:---|
| `te` | **తెలుగు** | Telugu |
| `hi` | **हिन्दी** | Devanagari |
| `sa` | **संस्कृतम्** | Sanskrit (Devanagari) |
| `ta` | **தமிழ்** | Tamil |
| `kn` | **ಕನ್ನಡ** | Kannada |
| `ml` | **മലയാളം** | Malayalam |
| `mr` | **मराठी** | Marathi (Devanagari) |
| `gu` | **ગુજરાતી** | Gujarati |
| `bn` | **বাংলা** | Bengali |
| `pa` | **ਪੰਜਾਬੀ** | Gurmukhi |
| `or` | **ଓଡ଼ିଆ** | Odia |
| `as` | **অসমীয়া** | Assamese (Bengali-Assamese) |
| `en` | **English** | Latin |

- **Synchronized Devotee Profiles**: Switching languages automatically updates default devotee names (e.g., `భక్తుడు` in Telugu, `भक्त` in Hindi, `பக்தர்` in Tamil, `ଭକ୍ତ` in Odia) while honoring custom names entered by the player.
- **Native Script Mantras**: Universal sacred mantras render natively in each script.

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Dev Server**: [Vite 8](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with `@tailwindcss/vite`
- **Typography**: Google Fonts loaded with full fallback chains:
  - *Display*: Cinzel, Noto Sans Indic scripts
  - *Sans*: Plus Jakarta Sans, Noto Sans Indic scripts
  - *Mono*: JetBrains Mono (tabular numerals for scores/timer)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Audio**: Web Audio API (procedural oscillator sound synthesis, zero external MP3s needed)
- **Animation**: 60fps particle simulation canvas with marigold petal bursts and sacred yantra mandalas

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn or pnpm

### Installation
```bash
# Clone the repository
git clone <repo-url>
cd sanatana-games

# Install dependencies
npm install
```

### Development
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Type Check & Linting
```bash
npm run lint
```

### Production Build
```bash
npm run build
```
Generates production-ready static assets in `/dist`.

---

## 📂 Project Structure

```text
├── index.html                   # HTML entry point, Google Fonts & meta tags
├── metadata.json                # AI Studio application metadata
├── package.json                 # Dependencies and npm scripts
├── tsconfig.json                # TypeScript compiler configuration
├── vite.config.ts               # Vite configuration with Tailwind CSS v4 plugin
├── src/
│   ├── main.tsx                 # Root React entry mounting I18nProvider
│   ├── App.tsx                  # Sanatana Games Hub & Game Shell
│   ├── index.css                # Tailwind CSS v4 import, font definitions, 3D flip styles
│   ├── components/
│   │   ├── DeityGalleryModal.tsx # 32-deity inspection & custom photo uploader
│   │   ├── DeityPortrait.tsx    # Tanjore-style SVG deity illustrations
│   │   ├── LanguageSelector.tsx # Dropdown supporting 13 Indic languages
│   │   ├── MemoryTile.tsx       # 3D interactive flip tile component
│   │   ├── SacredCanvas.tsx     # 60fps mandala & petal particle background
│   │   └── ScoreModal.tsx       # Persistent scoreboard & personal records
│   ├── data/
│   │   └── deities.ts           # 32 deities data, grid configurations (3x3 to 8x8)
│   ├── games/
│   │   ├── registry.ts          # Central registry for all Sanatana Games
│   │   ├── types.ts             # Game definition interfaces & categories
│   │   ├── divya-smarana/       # Divya Smarana self-contained game
│   │   │   └── DivyaSmaranaGame.tsx
│   │   └── moksha-patam/        # Moksha Patam self-contained game
│   │       └── MokshaPatamGame.tsx
│   ├── i18n/
│   │   ├── I18nContext.tsx      # Language state, devotee profile & translation provider
│   │   ├── translations.ts      # Core game strings & 32 deity localized names
│   │   ├── portalTranslations.ts# Hub & Moksha Patam localization for 13 languages
│   │   └── deityDetailsTranslations.ts # Sacred mantras across 13 Indic scripts
│   └── utils/
│       ├── sound.ts             # Procedural temple chime & bell synthesizer
│       └── storage.ts           # LocalStorage helpers for scores, photos, & profiles
```

---

## 🧩 Extending with New Games

Every game in Sanatana Games is a standalone React component. To add a new game:
1. Create a directory in `src/games/my-new-game/MyNewGame.tsx`.
2. Accept the `{ onExitToHub: () => void }` prop to allow returning to the hub.
3. Register the game metadata in `src/games/registry.ts` with localized titles, taglines, and descriptions.
4. Set `status: 'ready'` when complete!

---

## 📜 License

Apache-2.0
