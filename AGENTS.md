# AGENTS.md — Sanatana Games Architecture & Agent Guidelines

Welcome, autonomous agent or software engineer! This file defines the technical specifications, architectural conventions, coding standards, and operational guidelines for building, refactoring, and maintaining the **Sanatana Games** portal.

---

## 1. Project Identity & Purpose

**Sanatana Games (సనాతన క్రీడలు)** is an extensible, modular web gaming platform celebrating Sanatana Dharma, Hindu deities, and Vedic philosophical games. It provides an immersive temple-aesthetic experience with authentic Indic multilingual support, procedural Web Audio sound synthesis, particle animations, and zero server-side telemetry.

- **Type**: Single Page Application (SPA)
- **Framework**: **React 19** with **TypeScript**
- **Bundler**: **Vite 8**
- **CSS**: **Tailwind CSS v4** (`@tailwindcss/vite`)
- **Primary Languages Supported**: 13 Indic languages (`te`, `hi`, `sa`, `ta`, `kn`, `ml`, `mr`, `gu`, `bn`, `pa`, `or`, `as`) + English (`en`).

---

## 2. Technology Stack & Toolchain

| Layer | Technology | Key Details |
|:---|:---|:---|
| **Frontend Framework** | React `^19.0.1` | Functional components, hooks (`useI18n`, `useState`, `useEffect`, `useCallback`, `useRef`) |
| **Language** | TypeScript `^7.0.2` | Strict typing, interfaces for all game metadata and i18n dictionaries |
| **Build & Dev Server** | Vite `^8.3.0` | Port 3000, `@tailwindcss/vite` plugin, `@` path aliases |
| **Styling** | Tailwind CSS `^4.3.3` | Modern `@import "tailwindcss";`, dark temple theme, golden amber palette |
| **Icons** | `lucide-react` `^0.546.0` | Standardized icons for HUD, board controls, and dice |
| **Audio** | Procedural Web Audio API | Zero external audio asset dependencies; synthesized temple bells and sitar plucks |
| **Persistence** | `localStorage` | Pure browser storage for scores, personal bests, and custom uploaded deity portraits |

---

## 3. Repository Architecture & Layout

```text
├── index.html                   # HTML entry point, Google Fonts, and OpenGraph metadata
├── metadata.json                # AI Studio application metadata
├── package.json                 # Dependencies and npm scripts
├── tsconfig.json                # TypeScript compiler options (bundler resolution)
├── vite.config.ts               # Vite configuration with Tailwind CSS v4
├── README.md                    # User & developer facing documentation
├── AGENTS.md                    # Agentic guidance & architectural blueprint (this file)
└── src/
    ├── main.tsx                 # Root React entry point mounting I18nProvider
    ├── App.tsx                  # Sanatana Games Hub, parent container & game shell
    ├── index.css                # Global styles, fonts, and 3D card-flip animations
    ├── components/
    │   ├── DeityGalleryModal.tsx # 32-deity inspection, mantras, and photo customizer
    │   ├── DeityPortrait.tsx    # Pure SVG Tanjore-style deity illustration renderer
    │   ├── LanguageSelector.tsx # 13-language dropdown with responsive positioning
    │   ├── MemoryTile.tsx       # 3D interactive flip tile for Divya Smarana
    │   ├── SacredCanvas.tsx     # 60fps golden mandala & flower petal particle engine
    │   └── ScoreModal.tsx       # Local scoreboard with personal best tracking
    ├── data/
    │   └── deities.ts           # 32 deity archetypes, grid presets (3x3 to 8x8), blessing tile
    ├── games/
    │   ├── registry.ts          # Central registry for all Sanatana Games (extensible)
    │   ├── types.ts             # Game definition interfaces, categories, and status
    │   ├── divya-smarana/       # Divya Smarana: Deities Memory Game (active)
    │   │   └── DivyaSmaranaGame.tsx
    │   └── moksha-patam/        # Moksha Patam: Gyan Chauper (active)
    │       └── MokshaPatamGame.tsx
    ├── i18n/
    │   ├── I18nContext.tsx      # Language state, devotee profile & translation context
    │   ├── translations.ts      # Core memory game strings & 32 deity localized names
    │   ├── portalTranslations.ts# Hub & Moksha Patam strings across 13 languages
    │   └── deityDetailsTranslations.ts # Sacred mantras across 13 Indic scripts
    └── utils/
        ├── sound.ts             # Web Audio API procedural bell synthesizer
        └── storage.ts           # LocalStorage helpers for scores, profiles, and photos
```

---

## 4. Architectural Rules for Agents

### Rule 1: Extensible Game Component Pattern
Every game added to this portal must be a **self-contained React component**:
- Games live in `src/games/<game-id>/<GameName>.tsx`.
- Every game component MUST accept `{ onExitToHub: () => void }` as its exit prop.
- Every game MUST be registered in `src/games/registry.ts` with metadata for all 13 supported languages.
- Setting `status: 'ready'` in `registry.ts` enables the "Play Now" button and allows the game to launch from the hub.
- Setting `status: 'in-development'` renders the card as a teaser with the "Coming Soon" badge.

### Rule 2: Complete Indic i18n Discipline
- **No hardcoded text** in UI components: Never hardcode English, Hindi, or Telugu text directly in JSX.
- When adding a new string, add it to `portalTranslations.ts` or `translations.ts` and ensure values exist for **all 13 language codes**:
  `te` (Telugu), `hi` (Hindi), `sa` (Sanskrit), `ta` (Tamil), `kn` (Kannada), `ml` (Malayalam), `mr` (Marathi), `gu` (Gujarati), `bn` (Bengali), `pa` (Punjabi), `or` (Odia), `as` (Assamese), `en` (English).
- Fallback logic: Always fallback to `en` if a key is missing, but make every effort to provide native script equivalents.

### Rule 3: Visual & Aesthetic Consistency
- Palette: Dark obsidian temple backgrounds (`#180C07`, `#100704`, `#080302`), warm saffron/gold accents (`amber-400`, `amber-500`), and emerald accents for virtues.
- Fonts:
  - Display: `Cinzel` for classical English headings.
  - Indic Scripts: `Noto Sans Devanagari`, `Noto Sans Telugu`, `Noto Sans Tamil`, etc., loaded via Google Fonts in `index.html`.
  - Tabular Numbers: `JetBrains Mono` for timers, score numbers, and move counts (`font-mono-tabular`).

### Rule 4: Procedural Audio (Web Audio API)
- Do **not** link external `.mp3` files or large sound libraries.
- Use `soundEngine` from `src/utils/sound.ts`, which synthesizes sound waves procedurally using browser native oscillators (bell strikes, tanpura harmonics, match chimes).
- Respect the global mute state: check `soundEngine.getMuted()`.

### Rule 5: Pure Browser Persistence
- User state is stored locally in `localStorage` under keys `sanatana_memory_scores_v2`, `sanatana_player_name`, `sanatana_sound_muted`, and `sanatana_custom_deities`.
- Custom deity photos are stored as base64 strings in `localStorage` so they persist across page refreshes without needing a backend.

---

## 5. Standard Development Commands

```bash
# Install dependencies
npm install

# Start local Vite development server (port 3000)
npm run dev

# Run TypeScript type check / lint
npm run lint

# Compile production bundle into /dist
npm run build
```

---

## 6. How to Add a New Game (Step-by-Step)

When an agent or developer adds a new game (e.g. `rama-setu`):

1. **Create Component**:
   Create `src/games/rama-setu/RamaSetuGame.tsx`:
   ```tsx
   import React from 'react';
   import { useI18n } from '../../i18n/I18nContext';

   interface Props {
     onExitToHub: () => void;
   }

   export default function RamaSetuGame({ onExitToHub }: Props) {
     const { lang, t, portal } = useI18n();
     return (
       <div className="min-h-screen bg-[#180C07] text-amber-100 p-6">
         <button onClick={onExitToHub} className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl">
           ← Return to Sanatana Games Hub
         </button>
         {/* Game UI */}
       </div>
     );
   }
   ```

2. **Register in `src/games/registry.ts`**:
   Import `RamaSetuGame` and update the registry entry:
   ```ts
   {
     id: 'rama-setu',
     title: { en: 'Rama Setu', te: 'రామ సేతు', ... },
     status: 'ready',
     component: RamaSetuGame,
     // ...
   }
   ```

3. **Verify Build**:
   Run `npm run build` to confirm TypeScript validation and zero bundling errors.

---

## 7. Verification Checklist for Agents

Before completing any task, verify:
- [ ] `npm run build` succeeds without TypeScript or bundling errors.
- [ ] Home page scrolls smoothly on both desktop and mobile viewports.
- [ ] Game cards and "Play Now" action buttons are responsive and trigger the game view.
- [ ] Language switching retains consistency across all UI elements (no unintended language mixing).
- [ ] Player profile name syncs properly with localized defaults or persists custom user input.
- [ ] Mute toggle silences all Web Audio procedural sound effects.
