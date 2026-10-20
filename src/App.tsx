import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  Sparkles,
  Dices,
  Hammer,
  BookOpen,
  Play,
  Users,
  ArrowRight,
  Compass,
} from 'lucide-react';
import { SANATANA_GAMES_REGISTRY } from './games/registry';
import { GameCategory, GameInfo } from './games/types';
import { LanguageSelector } from './components/LanguageSelector';
import { SacredCanvas } from './components/SacredCanvas';
import { useI18n } from './i18n/I18nContext';
import { soundEngine } from './utils/sound';

export default function App() {
  const { lang, t, portal, playerName, setPlayerName } = useI18n();
  const [activeGameId, setActiveGameId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<GameCategory>('all');
  const [isMuted, setIsMuted] = useState<boolean>(() => soundEngine.getMuted());

  // Find active game definition
  const activeGame = SANATANA_GAMES_REGISTRY.find((g) => g.id === activeGameId);

  // If an active game is selected, render its self-contained component!
  if (activeGame && activeGame.status === 'ready') {
    const GameComponent = activeGame.component;
    return <GameComponent onExitToHub={() => setActiveGameId(null)} />;
  }

  // Filter games based on selected category
  const filteredGames = SANATANA_GAMES_REGISTRY.filter((game) => {
    if (selectedCategory === 'all') return true;
    return game.category === selectedCategory;
  });

  const getGameIcon = (iconName: string) => {
    switch (iconName) {
      case 'Dices':
        return <Dices className="w-6 h-6 text-emerald-400 shrink-0" />;
      case 'Hammer':
        return <Hammer className="w-6 h-6 text-sky-400 shrink-0" />;
      case 'BookOpen':
        return <BookOpen className="w-6 h-6 text-purple-400 shrink-0" />;
      case 'Sparkles':
      default:
        return <Sparkles className="w-6 h-6 text-amber-400 shrink-0" />;
    }
  };

  const handleLaunchGame = (game: GameInfo) => {
    if (game.status !== 'ready') return;
    soundEngine.playMatch(1);
    setActiveGameId(game.id);
  };

  const categoryTabs: { id: GameCategory; label: string }[] = [
    { id: 'all', label: portal.categoryAll },
    { id: 'memory', label: portal.categoryMemory },
    { id: 'board', label: portal.categoryBoard },
    { id: 'puzzle', label: portal.categoryPuzzle },
    { id: 'knowledge', label: portal.categoryKnowledge },
  ];

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-gradient-to-b from-[#180C07] via-[#100704] to-[#080302] text-[#FEF3C7] flex flex-col">
      {/* 60fps Sacred Mandala Simulation Canvas in Hub */}
      <SacredCanvas isTitleScreen={true} />

      {/* =====================================================================
          GLOBAL SANATANA GAMES PARENT HEADER (Sticky so always reachable)
         ===================================================================== */}
      <header className="sticky top-0 z-30 w-full flex flex-wrap items-center justify-between gap-3 px-4 sm:px-8 py-3 bg-[#1C0E08]/95 border-b border-amber-500/25 shadow-lg backdrop-blur-md">
        {/* Brand / Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 font-bold text-lg shadow-md border border-amber-300">
            ॐ
          </div>
          <div>
            <div className="font-display font-extrabold text-base sm:text-lg text-amber-100 tracking-wide flex items-center gap-2">
              <span>Sanatana Games</span>
              <span className="text-[11px] font-sans font-normal text-amber-300/80 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30">
                {portal.portalPill}
              </span>
            </div>
            <div className="text-[11px] text-amber-200/60 hidden sm:block">
              {portal.portalSubtitle}
            </div>
          </div>
        </div>

        {/* Global Controls: Player Profile + Language Selector + Audio Mute */}
        <div className="flex items-center gap-2.5">
          <div className="hidden md:flex items-center gap-2 bg-[#140804] border border-amber-500/25 rounded-xl px-3 py-1.5 text-xs text-amber-200/70">
            <span>{t.playerLabel}</span>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              maxLength={20}
              className="bg-transparent font-semibold text-amber-100 focus:outline-none w-24 border-b border-transparent focus:border-amber-400"
            />
          </div>

          <LanguageSelector />

          <button
            onClick={() => {
              const muted = soundEngine.toggleMute();
              setIsMuted(muted);
            }}
            className="p-2 rounded-xl bg-[#1C100B] hover:bg-amber-500/20 border border-amber-500/30 text-amber-200 transition-colors cursor-pointer"
            aria-label="Toggle Sound"
            title="Mute / Unmute"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* =====================================================================
          SANATANA GAMES HUB HERO & SELECTION (Scrolls naturally)
         ===================================================================== */}
      <main className="relative z-10 flex-1 flex flex-col items-center max-w-6xl mx-auto w-full px-4 sm:px-6 pt-5 pb-16">
        {/* Sacred Gopuram Hero Lockup */}
        <div className="text-center max-w-3xl flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{portal.heroPill}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-amber-100 font-display tracking-tight leading-tight">
            {portal.hubTitle}
          </h1>
          <p className="mt-2 text-xs sm:text-sm md:text-base text-amber-200/75 max-w-2xl px-2">
            {portal.hubDescription}
          </p>

          {/* Category Filter Tabs */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-1.5 p-1 bg-[#160B06] rounded-xl border border-amber-500/25 max-w-full overflow-x-auto">
            {categoryTabs.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  soundEngine.playTileFlip();
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'text-amber-200/70 hover:text-amber-100 hover:bg-amber-500/10'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Games Grid Container - Entire Tile is Clickable & Launches Game */}
        <div className="w-full mt-6 sm:mt-8 grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredGames.map((game) => {
            const isReady = game.status === 'ready';
            const title = game.title[lang] || game.title.en;
            const tagline = game.tagline[lang] || game.tagline.en;
            const description = game.description[lang] || game.description.en;
            const badge = game.badge[lang] || game.badge.en;
            const tags = game.tags[lang] || game.tags.en;
            const difficulty = game.difficulty[lang] || game.difficulty.en;
            const players = game.players[lang] || game.players.en;

            return (
              <div
                key={game.id}
                onClick={() => handleLaunchGame(game)}
                role={isReady ? 'button' : undefined}
                tabIndex={isReady ? 0 : undefined}
                aria-label={`${title} - ${isReady ? portal.playNowBtn : portal.comingSoonBtn}`}
                onKeyDown={(e) => {
                  if (isReady && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    handleLaunchGame(game);
                  }
                }}
                className={`group relative flex flex-col justify-between rounded-2xl border transition-all duration-200 overflow-hidden shadow-xl select-none ${
                  isReady
                    ? 'bg-gradient-to-br from-[#1F100A] via-[#160B06] to-[#0E0604] border-amber-500/35 hover:border-amber-400 hover:shadow-2xl hover:shadow-amber-500/25 hover:-translate-y-1 cursor-pointer ring-1 ring-transparent hover:ring-amber-400/40'
                    : 'bg-[#150A06]/70 border-amber-500/20 opacity-80 cursor-default'
                }`}
              >
                {/* Card Top Strip */}
                <div className="p-5 sm:p-6 flex flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center shadow-inner border border-amber-500/30 group-hover:scale-105 transition-transform"
                        style={{
                          background: `radial-gradient(circle, ${game.gradient[0]}, ${game.gradient[1]})`,
                        }}
                      >
                        {getGameIcon(game.icon)}
                      </div>
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-amber-100 font-display group-hover:text-amber-300 transition-colors">
                          {title}
                        </h2>
                        <span className="text-xs font-semibold text-amber-400/90">
                          {badge}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border flex items-center gap-1 shrink-0 ${
                        isReady
                          ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 group-hover:bg-amber-400 group-hover:text-slate-950 transition-colors'
                          : 'bg-amber-500/10 border-amber-500/25 text-amber-300'
                      }`}
                    >
                      {isReady && <Play className="w-3 h-3 fill-current" />}
                      {isReady ? portal.activeGameBadge : portal.comingSoonBadge}
                    </span>
                  </div>

                  <p className="mt-3 text-xs sm:text-sm font-medium text-amber-300/90">
                    {tagline}
                  </p>
                  <p className="mt-1.5 text-xs text-amber-200/70 line-clamp-2 leading-relaxed">
                    {description}
                  </p>

                  {/* Metadata Chips: Players & Difficulty */}
                  <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] text-amber-200/60 font-mono-tabular">
                    <div className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-amber-400" />
                      <span>{players}</span>
                    </div>
                    <span>·</span>
                    <div className="flex items-center gap-1">
                      <Compass className="w-3.5 h-3.5 text-amber-400" />
                      <span>{difficulty}</span>
                    </div>
                  </div>

                  {/* Tag cluster */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-[#120804] border border-amber-500/15 text-amber-200/70"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Action Button */}
                <div className="p-4 sm:p-5 pt-0 mt-auto">
                  {isReady ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLaunchGame(game);
                      }}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-transform cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-slate-950" />
                      <span>{portal.playNowBtn}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      disabled
                      type="button"
                      className="w-full py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200/40 text-xs font-semibold cursor-not-allowed"
                    >
                      {portal.comingSoonBtn}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Sacred Vedic Stat Strip */}
        <div className="mt-10 w-full grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-[#160B06]/80 border border-amber-500/25 text-center">
          <div>
            <div className="text-xl sm:text-2xl font-black font-mono-tabular text-amber-400">
              32
            </div>
            <div className="text-[11px] text-amber-200/60 mt-0.5">{portal.statDeities}</div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black font-mono-tabular text-amber-400">
              3×3 - 8×8
            </div>
            <div className="text-[11px] text-amber-200/60 mt-0.5">{portal.statGrids}</div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black font-mono-tabular text-amber-400">
              13
            </div>
            <div className="text-[11px] text-amber-200/60 mt-0.5">{portal.statLanguages}</div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black font-mono-tabular text-emerald-400">
              100%
            </div>
            <div className="text-[11px] text-amber-200/60 mt-0.5">{portal.statWisdom}</div>
          </div>
        </div>

        {/* Footer Peace Shloka */}
        <footer className="mt-8 pb-4 text-center text-xs text-amber-200/50">
          {portal.portalFooter}
        </footer>
      </main>
    </div>
  );
}
