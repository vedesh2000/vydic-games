import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Volume2,
  VolumeX,
  RotateCcw,
  Trophy,
  Eye,
  Pause,
  Play,
  BookmarkCheck,
  LayoutGrid,
  Sparkles,
  ArrowLeft,
  Home,
} from 'lucide-react';
import {
  GRID_CONFIGS,
  GridSizeKey,
  SANATANA_DEITIES,
  DeityCardData,
} from '../../data/deities';
import { MemoryTile, BoardTile } from '../../components/MemoryTile';
import { DeityPortrait } from '../../components/DeityPortrait';
import { SacredCanvas, SacredCanvasHandle } from '../../components/SacredCanvas';
import { ScoreModal } from '../../components/ScoreModal';
import { DeityGalleryModal } from '../../components/DeityGalleryModal';
import { LanguageSelector } from '../../components/LanguageSelector';
import { useI18n } from '../../i18n/I18nContext';
import { soundEngine } from '../../utils/sound';
import {
  ScoreRecord,
  loadScores,
  saveScoreRecord,
  deleteScoreRecord,
  clearAllScores,
  getBestScoreForGrid,
  loadPlayerName,
  savePlayerName,
  loadCustomDeityImages,
  saveCustomDeityImage,
} from '../../utils/storage';

type GameState = 'TITLE_MENU' | 'PLAYING' | 'PAUSED' | 'VICTORY';

function shuffleArray<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

interface DivyaSmaranaGameProps {
  onExitToHub: () => void;
}

export const DivyaSmaranaGame: React.FC<DivyaSmaranaGameProps> = ({ onExitToHub }) => {
  const { lang, t, portal, getDeityName, getDeityMantra, playerName, setPlayerName } = useI18n();
  const [gameState, setGameState] = useState<GameState>('TITLE_MENU');
  const [gridSize, setGridSize] = useState<GridSizeKey>('4x4');
  const [tiles, setTiles] = useState<BoardTile[]>([]);
  const [flippedIds, setFlippedIds] = useState<string[]>([]);
  const [mismatchedIds, setMismatchedIds] = useState<string[]>([]);
  const [isPeeking, setIsPeeking] = useState<boolean>(false);
  const [hintsLeft, setHintsLeft] = useState<number>(2);
  const [focusedIndex, setFocusedIndex] = useState<number>(0);

  // Score & Gameplay Telemetry
  const [score, setScore] = useState<number>(0);
  const [moves, setMoves] = useState<number>(0);
  const [pairsMatched, setPairsMatched] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [lastMatchedDeity, setLastMatchedDeity] = useState<{
    deity: DeityCardData;
    pointsEarned: number;
  } | null>(null);
  const [manualSaveBanner, setManualSaveBanner] = useState<boolean>(false);

  // Persistent Storage & Modals
  const [scores, setScores] = useState<ScoreRecord[]>(() => loadScores());
  const [customImages, setCustomImages] = useState<Record<string, string>>(() =>
    loadCustomDeityImages()
  );
  const [isMuted, setIsMuted] = useState<boolean>(() => soundEngine.getMuted());
  const [isScoreModalOpen, setIsScoreModalOpen] = useState<boolean>(false);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState<boolean>(false);

  // Refs for timers & canvas bursts
  const canvasRef = useRef<SacredCanvasHandle | null>(null);
  const lockBoardRef = useRef<boolean>(false);
  const flipTimeoutRef = useRef<number | null>(null);
  const peekTimeoutRef = useRef<number | null>(null);

  const currentConfig = GRID_CONFIGS[gridSize];

  const clearTimers = useCallback(() => {
    if (flipTimeoutRef.current !== null) {
      window.clearTimeout(flipTimeoutRef.current);
      flipTimeoutRef.current = null;
    }
    if (peekTimeoutRef.current !== null) {
      window.clearTimeout(peekTimeoutRef.current);
      peekTimeoutRef.current = null;
    }
    lockBoardRef.current = false;
  }, []);

  // Build & Shuffle Board for Selected Grid Size
  const startNewGame = useCallback(
    (targetGrid: GridSizeKey = gridSize) => {
      clearTimers();
      const cfg = GRID_CONFIGS[targetGrid];
      setGridSize(targetGrid);

      const coreDeities = SANATANA_DEITIES.slice(0, 8);
      const restDeities = shuffleArray(SANATANA_DEITIES.slice(8));
      const pool =
        cfg.pairCount <= 8
          ? shuffleArray(coreDeities).slice(0, cfg.pairCount)
          : [...coreDeities, ...restDeities].slice(0, cfg.pairCount);

      const pairedDeities = shuffleArray([...pool, ...pool]);

      const generatedTiles: BoardTile[] = [];
      const centerIdx = cfg.hasCenterBlessingTile ? Math.floor(cfg.totalTiles / 2) : -1;
      let pairCursor = 0;

      for (let i = 0; i < cfg.totalTiles; i++) {
        if (i === centerIdx) {
          generatedTiles.push({
            uid: `blessing_${i}`,
            positionIndex: i,
            kind: 'blessing',
            isFlipped: false,
            isMatched: false,
          });
        } else {
          const deity = pairedDeities[pairCursor++];
          generatedTiles.push({
            uid: `tile_${i}_${deity.id}`,
            positionIndex: i,
            kind: 'deity',
            deity,
            isFlipped: false,
            isMatched: false,
          });
        }
      }

      setTiles(generatedTiles);
      setFlippedIds([]);
      setMismatchedIds([]);
      setScore(0);
      setMoves(0);
      setPairsMatched(0);
      setCombo(0);
      setMaxCombo(0);
      setElapsedSeconds(0);
      setHintsLeft(targetGrid === '8x8' ? 3 : 2);
      setFocusedIndex(0);
      setLastMatchedDeity(null);
      setManualSaveBanner(false);
      setGameState('PLAYING');

      setIsPeeking(true);
      soundEngine.playTileFlip();
      peekTimeoutRef.current = window.setTimeout(() => {
        setIsPeeking(false);
      }, cfg.peekSeconds * 1000);
    },
    [gridSize, clearTimers]
  );

  // Elapsed timer during active play
  useEffect(() => {
    if (gameState !== 'PLAYING' || isPeeking) return;
    const interval = window.setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(interval);
  }, [gameState, isPeeking]);

  // Handle Tile Click / Selection
  const handleSelectTile = useCallback(
    (tile: BoardTile, event?: React.MouseEvent<HTMLButtonElement>) => {
      if (
        gameState !== 'PLAYING' ||
        isPeeking ||
        lockBoardRef.current ||
        tile.isMatched ||
        tile.isFlipped
      ) {
        return;
      }

      const rect = event?.currentTarget?.getBoundingClientRect();
      const burstX = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
      const burstY = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;

      if (tile.kind === 'blessing') {
        soundEngine.playBlessingTile();
        canvasRef.current?.triggerBurst(burstX, burstY, '#FEF08A', 'match');
        setTiles((prev) =>
          prev.map((t) =>
            t.uid === tile.uid ? { ...t, isFlipped: true, isMatched: true } : t
          )
        );
        setScore((prev) => prev + 250);
        return;
      }

      soundEngine.playTileFlip();
      canvasRef.current?.triggerBurst(
        burstX,
        burstY,
        tile.deity?.auraColor || '#F59E0B',
        'flip'
      );

      const nextTiles = tiles.map((t) =>
        t.uid === tile.uid ? { ...t, isFlipped: true } : t
      );
      setTiles(nextTiles);

      const nextFlipped = [...flippedIds, tile.uid];
      setFlippedIds(nextFlipped);

      if (nextFlipped.length === 2) {
        lockBoardRef.current = true;
        const nextMoves = moves + 1;
        setMoves(nextMoves);

        const firstTile = nextTiles.find((t) => t.uid === nextFlipped[0]);
        const secondTile = nextTiles.find((t) => t.uid === nextFlipped[1]);

        if (
          firstTile &&
          secondTile &&
          firstTile.deity &&
          secondTile.deity &&
          firstTile.deity.id === secondTile.deity.id
        ) {
          const nextCombo = combo + 1;
          const nextMaxCombo = Math.max(maxCombo, nextCombo);
          const nextPairs = pairsMatched + 1;

          const pointsEarned =
            currentConfig.baseMatchPoints +
            (nextCombo - 1) * 75 +
            Math.max(0, (currentConfig.timeBonusThresholdSec - elapsedSeconds) * 2);

          const nextScore = score + pointsEarned;

          soundEngine.playMatch(nextCombo);
          canvasRef.current?.triggerBurst(
            burstX,
            burstY,
            secondTile.deity.auraColor,
            'match'
          );

          setCombo(nextCombo);
          setMaxCombo(nextMaxCombo);
          setPairsMatched(nextPairs);
          setScore(nextScore);
          setLastMatchedDeity({ deity: secondTile.deity, pointsEarned });

          setTiles((prev) =>
            prev.map((t) =>
              t.uid === firstTile.uid || t.uid === secondTile.uid
                ? { ...t, isFlipped: true, isMatched: true }
                : t
            )
          );
          setFlippedIds([]);
          lockBoardRef.current = false;

          if (nextPairs >= currentConfig.pairCount) {
            const accuracy = Math.min(
              100,
              Math.round((currentConfig.pairCount / Math.max(1, nextMoves)) * 100)
            );
            const completionBonus = accuracy * 10;
            const finalTotalScore = nextScore + completionBonus;
            setScore(finalTotalScore);

            window.setTimeout(() => {
              soundEngine.playVictory();
              canvasRef.current?.triggerBurst(
                window.innerWidth / 2,
                window.innerHeight / 2,
                '#FEF08A',
                'victory'
              );
              const saved = saveScoreRecord({
                playerName,
                gridSize,
                score: finalTotalScore,
                moves: nextMoves,
                pairsMatched: nextPairs,
                totalPairs: currentConfig.pairCount,
                timeSeconds: elapsedSeconds,
                accuracyPercent: accuracy,
                maxCombo: nextMaxCombo,
                note: t.gridLabels[gridSize].title,
              });
              setScores((prev) => [saved, ...prev]);
              setGameState('VICTORY');
            }, 420);
          }
        } else {
          setCombo(0);
          setMismatchedIds(nextFlipped);
          soundEngine.playMismatch();

          flipTimeoutRef.current = window.setTimeout(() => {
            setTiles((prev) =>
              prev.map((t) =>
                nextFlipped.includes(t.uid) ? { ...t, isFlipped: false } : t
              )
            );
            setFlippedIds([]);
            setMismatchedIds([]);
            lockBoardRef.current = false;
          }, 720);
        }
      }
    },
    [
      gameState,
      isPeeking,
      tiles,
      flippedIds,
      moves,
      combo,
      maxCombo,
      pairsMatched,
      currentConfig,
      elapsedSeconds,
      score,
      playerName,
      gridSize,
      t,
    ]
  );

  const handleUseHint = useCallback(() => {
    if (
      gameState !== 'PLAYING' ||
      isPeeking ||
      hintsLeft <= 0 ||
      lockBoardRef.current
    ) {
      return;
    }
    setHintsLeft((prev) => prev - 1);
    setIsPeeking(true);
    soundEngine.playBlessingTile();
    peekTimeoutRef.current = window.setTimeout(() => {
      setIsPeeking(false);
    }, 1600);
  }, [gameState, isPeeking, hintsLeft]);

  const handleManualSaveScore = useCallback(() => {
    if (score <= 0 && moves <= 0) return;
    const accuracy =
      moves > 0 ? Math.min(100, Math.round((pairsMatched / moves) * 100)) : 0;
    const saved = saveScoreRecord({
      playerName,
      gridSize,
      score,
      moves,
      pairsMatched,
      totalPairs: currentConfig.pairCount,
      timeSeconds: elapsedSeconds,
      accuracyPercent: accuracy,
      maxCombo,
      note: `${t.gridLabels[gridSize].title} (${pairsMatched}/${currentConfig.pairCount})`,
    });
    setScores((prev) => [saved, ...prev]);
    setManualSaveBanner(true);
    soundEngine.playBlessingTile();
    window.setTimeout(() => setManualSaveBanner(false), 2200);
  }, [
    score,
    moves,
    pairsMatched,
    playerName,
    gridSize,
    currentConfig.pairCount,
    elapsedSeconds,
    maxCombo,
    t,
  ]);

  // Keyboard Navigation & Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isScoreModalOpen || isGalleryModalOpen) return;
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if (gameState === 'TITLE_MENU') {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          startNewGame(gridSize);
        }
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        setGameState((prev) => (prev === 'PLAYING' ? 'PAUSED' : 'PLAYING'));
        return;
      }

      if (e.key.toLowerCase() === 'm') {
        e.preventDefault();
        const muted = soundEngine.toggleMute();
        setIsMuted(muted);
        return;
      }

      if (gameState !== 'PLAYING') return;

      if (e.key.toLowerCase() === 'h') {
        e.preventDefault();
        handleUseHint();
        return;
      }

      const cols = currentConfig.cols;
      const total = currentConfig.totalTiles;

      if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
        e.preventDefault();
        setFocusedIndex((prev) => (prev + 1) % total);
      } else if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setFocusedIndex((prev) => (prev - 1 + total) % total);
      } else if (e.key === 'ArrowDown' || e.key.toLowerCase() === 's') {
        e.preventDefault();
        setFocusedIndex((prev) => (prev + cols) % total);
      } else if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') {
        e.preventDefault();
        setFocusedIndex((prev) => (prev - cols + total) % total);
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const targetTile = tiles[focusedIndex];
        if (targetTile) {
          handleSelectTile(targetTile);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    gameState,
    gridSize,
    currentConfig,
    tiles,
    focusedIndex,
    isScoreModalOpen,
    isGalleryModalOpen,
    startNewGame,
    handleSelectTile,
    handleUseHint,
  ]);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const bestForCurrentGrid = getBestScoreForGrid(scores, gridSize);

  const getGridColumnClass = (g: GridSizeKey) => {
    switch (g) {
      case '3x3':
        return 'grid-cols-3 gap-2.5 sm:gap-3.5 max-w-[380px]';
      case '4x4':
        return 'grid-cols-4 gap-2 sm:gap-3 max-w-[460px]';
      case '5x5':
        return 'grid-cols-5 gap-1.5 sm:gap-2.5 max-w-[520px]';
      case '6x6':
        return 'grid-cols-6 gap-1.5 sm:gap-2 max-w-[580px]';
      case '8x8':
        return 'grid-cols-8 gap-1 sm:gap-1.5 max-w-[660px]';
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gradient-to-b from-[#1A0D08] via-[#120906] to-[#0B0503] text-[#FEF3C7] flex flex-col select-none">
      {/* 60fps Sacred Mandala & Particle Simulation Canvas */}
      <SacredCanvas ref={canvasRef} isTitleScreen={gameState === 'TITLE_MENU'} />

      {/* =====================================================================
          STATE 1: TITLE MENU (Full-Viewport Game Shell)
         ===================================================================== */}
      {gameState === 'TITLE_MENU' && (
        <main className="relative z-10 flex-1 flex flex-col items-center justify-between px-3 sm:px-6 py-4 sm:py-8 max-w-6xl mx-auto w-full overflow-y-auto overflow-x-hidden">
          {/* Top Perimeter Bar: Back to Sanatana Games Hub + Player Name + Language + Utilities */}
          <div className="w-full flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <button
                onClick={onExitToHub}
                className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-[#1C100B]/90 hover:bg-amber-500/20 border border-amber-500/35 text-amber-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Return to Sanatana Games Portal"
              >
                <ArrowLeft className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">{portal.backToHubBtn}</span>
                <span className="sm:hidden">Hub</span>
              </button>

              <div className="flex items-center gap-2 bg-[#1C100B]/90 border border-amber-500/25 rounded-xl px-3 py-1.5 sm:px-3.5 sm:py-2 max-w-full">
                <span className="text-xs text-amber-200/70 shrink-0">{t.playerLabel}</span>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  maxLength={20}
                  className="bg-transparent text-sm font-semibold text-amber-100 focus:outline-none w-28 sm:w-36 border-b border-transparent focus:border-amber-400 min-w-0"
                  aria-label="Player Name"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 max-w-full">
              <LanguageSelector />

              <button
                onClick={() => setIsGalleryModalOpen(true)}
                className="px-3 py-2 rounded-xl bg-[#1C100B]/90 hover:bg-amber-500/15 border border-amber-500/30 text-xs font-medium text-amber-100 flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{t.deitiesBtn}</span>
              </button>
              <button
                onClick={() => setIsScoreModalOpen(true)}
                className="px-3 py-2 rounded-xl bg-[#1C100B]/90 hover:bg-amber-500/15 border border-amber-500/30 text-xs font-medium text-amber-100 flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  {t.scoreboardBtn} ({scores.length})
                </span>
              </button>
              <button
                onClick={() => {
                  const muted = soundEngine.toggleMute();
                  setIsMuted(muted);
                }}
                className="p-2 rounded-xl bg-[#1C100B]/90 hover:bg-amber-500/15 border border-amber-500/30 text-amber-200 transition-colors cursor-pointer shrink-0"
                aria-label="Toggle Sound"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Center Hero Lockup & Sacred Portrait Showcase */}
          <div className="my-auto flex flex-col items-center text-center max-w-3xl w-full py-2 px-1">
            {/* Bespoke Inline SVG Sacred Gopuram & Sudarshana Title Crest */}
            <svg
              viewBox="0 0 360 72"
              className="w-48 sm:w-80 max-w-full h-auto mb-1"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="titleGold" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#B45309" />
                  <stop offset="50%" stopColor="#FEF08A" />
                  <stop offset="100%" stopColor="#B45309" />
                </linearGradient>
              </defs>
              <line x1="20" y1="36" x2="130" y2="36" stroke="url(#titleGold)" strokeWidth="1.5" />
              <line x1="230" y1="36" x2="340" y2="36" stroke="url(#titleGold)" strokeWidth="1.5" />
              <circle cx="180" cy="36" r="26" fill="#2A1208" stroke="url(#titleGold)" strokeWidth="2" />
              <circle cx="180" cy="36" r="20" fill="none" stroke="#F59E0B" strokeWidth="1" strokeDasharray="3 2" />
              <text
                x="180"
                y="45"
                textAnchor="middle"
                fill="#FEF08A"
                fontSize="26"
                fontWeight="bold"
                fontFamily="serif"
              >
                ॐ
              </text>
            </svg>

            <h1
              className="text-2xl sm:text-5xl font-extrabold tracking-tight text-amber-100 font-display w-full break-words px-1"
              style={{ textWrap: 'balance' }}
            >
              {t.appTitle}
            </h1>
            <p className="mt-1.5 text-xs sm:text-base text-amber-200/80 max-w-xl w-full break-words px-1">
              {t.appSubtitle}
            </p>

            {/* 6 Iconic Featured Deity Cards Showcase Row */}
            <div className="mt-4 sm:mt-5 grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3 w-full max-w-2xl">
              {SANATANA_DEITIES.slice(0, 6).map((deity) => (
                <button
                  key={deity.id}
                  onClick={() => {
                    soundEngine.playMatch(2);
                    setIsGalleryModalOpen(true);
                  }}
                  className="group flex flex-col items-center p-1.5 rounded-xl bg-[#1C100B]/90 border border-amber-500/30 hover:border-amber-400 transition-transform hover:-translate-y-1 shadow-lg cursor-pointer"
                >
                  <div className="w-full aspect-square rounded-lg overflow-hidden">
                    <DeityPortrait
                      deity={deity}
                      customImageUrl={customImages[deity.id]}
                    />
                  </div>
                </button>
              ))}
            </div>

            {/* Grid Size Selector (3x3, 4x4, 5x5, 6x6, 8x8) */}
            <div className="mt-6 w-full">
              <div className="text-xs font-medium text-amber-300/80 mb-2.5">
                {t.selectGridLabel}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 w-full">
                {(['3x3', '4x4', '5x5', '6x6', '8x8'] as GridSizeKey[]).map((gKey) => {
                  const cfg = GRID_CONFIGS[gKey];
                  const best = getBestScoreForGrid(scores, gKey);
                  const isSelected = gridSize === gKey;
                  const localizedGrid = t.gridLabels[gKey];
                  return (
                    <button
                      key={gKey}
                      onClick={() => {
                        setGridSize(gKey);
                        soundEngine.playTileFlip();
                      }}
                      className={`p-3 rounded-xl text-left transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/50 shadow-lg'
                          : 'bg-[#180C08]/90 border-amber-500/20 hover:border-amber-500/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-extrabold font-mono-tabular text-amber-300">
                          {cfg.key}
                        </span>
                        <span className="text-[11px] font-mono-tabular text-amber-200/60">
                          {cfg.totalTiles} {t.tilesUnit}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-amber-100 mt-1 truncate">
                        {localizedGrid.title}
                      </div>
                      <div className="text-[11px] text-amber-200/65 mt-0.5 truncate">
                        {localizedGrid.desc}
                      </div>
                      <div className="mt-2 pt-1.5 border-t border-amber-500/15 text-[11px] font-mono-tabular text-amber-300/80">
                        {best
                          ? `${t.bestLabel}: ${best.score.toLocaleString()}`
                          : `${t.bestLabel}: —`}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Primary Start Game CTA */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => startNewGame(gridSize)}
                className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-base shadow-xl shadow-amber-500/20 transition-transform active:scale-95 flex items-center gap-2.5 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Play className="w-5 h-5 fill-slate-950" />
                {t.startGameBtn(gridSize)}
              </button>
            </div>
          </div>

          {/* Single Flat Control-Hint Line */}
          <div className="w-full text-center text-xs text-amber-200/50 font-mono-tabular pt-2">
            {t.controlHintLine}
          </div>
        </main>
      )}

      {/* =====================================================================
          STATE 2: PLAYING VIEW (Low-Occlusion HUD + Responsive Memory Board)
         ===================================================================== */}
      {(gameState === 'PLAYING' || gameState === 'PAUSED' || gameState === 'VICTORY') && (
        <div className="relative z-10 flex-1 flex flex-col justify-between h-full max-w-7xl mx-auto w-full px-3 sm:px-6 py-2.5 sm:py-3 overflow-hidden">
          {/* Top Perimeter HUD */}
          <header className="w-full flex flex-wrap items-center justify-between gap-2 sm:gap-4 px-3.5 py-2 rounded-xl bg-[#180C08]/95 border border-amber-500/25 shadow-md shrink-0">
            {/* Left: Home & Sanatana Hub & Instant Grid Switcher */}
            <div className="flex items-center gap-2">
              <button
                onClick={onExitToHub}
                className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-200 transition-colors cursor-pointer flex items-center gap-1 text-xs"
                title="Exit to Sanatana Games Hub"
              >
                <ArrowLeft className="w-4 h-4 text-amber-400" />
                <span className="hidden xl:inline text-[11px] font-semibold text-amber-300">Hub</span>
              </button>

              <button
                onClick={() => {
                  clearTimers();
                  setGameState('TITLE_MENU');
                }}
                className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-200 transition-colors cursor-pointer"
                title={t.backToTitleBtn}
              >
                <Home className="w-4 h-4" />
              </button>

              {/* Quick Grid Switcher Tabs (3x3, 4x4, 5x5, 6x6, 8x8) */}
              <div className="flex items-center gap-1 p-0.5 bg-[#110704] rounded-lg border border-amber-500/20">
                {(['3x3', '4x4', '5x5', '6x6', '8x8'] as GridSizeKey[]).map((gKey) => (
                  <button
                    key={gKey}
                    onClick={() => startNewGame(gKey)}
                    className={`px-2 py-1 text-xs font-mono-tabular font-semibold rounded-md transition-colors cursor-pointer ${
                      gridSize === gKey
                        ? 'bg-amber-500 text-slate-950'
                        : 'text-amber-200/70 hover:text-amber-100'
                    }`}
                  >
                    {gKey}
                  </button>
                ))}
              </div>
            </div>

            {/* Center: Tabular-Nums Score, Pairs, Moves, Combo, Timer */}
            <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm font-mono-tabular">
              <div>
                <span className="text-amber-200/60 mr-1">{t.scoreLabel}:</span>
                <span className="font-bold text-amber-400">{score.toLocaleString()}</span>
              </div>
              <span aria-hidden="true" className="text-amber-500/30">·</span>
              <div>
                <span className="text-amber-200/60 mr-1">{t.pairsLabel}:</span>
                <span className="font-bold text-amber-100">
                  {pairsMatched}/{currentConfig.pairCount}
                </span>
              </div>
              <span aria-hidden="true" className="text-amber-500/30 hidden md:inline">·</span>
              <div className="hidden md:block">
                <span className="text-amber-200/60 mr-1">{t.movesLabel}:</span>
                <span className="font-bold text-amber-100">{moves}</span>
              </div>
              {combo > 1 && (
                <>
                  <span aria-hidden="true" className="text-amber-500/30">·</span>
                  <div className="text-emerald-400 font-bold">
                    {combo}× {t.comboLabel}
                  </div>
                </>
              )}
              <span aria-hidden="true" className="text-amber-500/30">·</span>
              <div>
                <span className="text-amber-200/60 mr-1">{t.timeLabel}:</span>
                <span className="font-bold text-amber-200">{formatTimer(elapsedSeconds)}</span>
              </div>
            </div>

            {/* Right: Game Controls (Language, Hint, Save Score, Scoreboard, Gallery, Mute, Restart, Pause) */}
            <div className="flex items-center gap-1.5">
              <LanguageSelector compact />

              <button
                onClick={handleUseHint}
                disabled={hintsLeft <= 0 || isPeeking}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  hintsLeft > 0 && !isPeeking
                    ? 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-200 border border-amber-500/30'
                    : 'bg-amber-500/5 text-amber-200/30 border border-amber-500/10 cursor-not-allowed'
                }`}
                title="Darshan Hint (H)"
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">{t.darshanHintBtn}</span>
                <span className="font-mono-tabular">({hintsLeft})</span>
              </button>

              <button
                onClick={handleManualSaveScore}
                disabled={score <= 0 && moves <= 0}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  score > 0 || moves > 0
                    ? 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-200 border border-emerald-500/30'
                    : 'bg-amber-500/5 text-amber-200/30 border border-amber-500/10 cursor-not-allowed'
                }`}
                title={t.saveScoreBtn}
              >
                <BookmarkCheck className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">{t.saveScoreBtn}</span>
              </button>

              <button
                onClick={() => setIsScoreModalOpen(true)}
                className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 transition-colors cursor-pointer"
                title={t.scoreboardBtn}
              >
                <Trophy className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsGalleryModalOpen(true)}
                className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 transition-colors cursor-pointer"
                title={t.deitiesBtn}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  const muted = soundEngine.toggleMute();
                  setIsMuted(muted);
                }}
                className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-200 transition-colors cursor-pointer"
                title="Mute / Unmute (M)"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              <button
                onClick={() => startNewGame(gridSize)}
                className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-200 transition-colors cursor-pointer"
                title="Restart Board"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() =>
                  setGameState((prev) => (prev === 'PLAYING' ? 'PAUSED' : 'PLAYING'))
                }
                className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-200 transition-colors cursor-pointer"
                title="Pause Game (Esc)"
              >
                <Pause className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* Center Memory Playfield Container */}
          <main className="flex-1 flex items-center justify-center w-full overflow-hidden py-1.5">
            <div
              className={`w-full max-h-full aspect-square grid ${getGridColumnClass(
                gridSize
              )} mx-auto p-2 sm:p-3 rounded-2xl bg-[#180C08]/85 border border-amber-500/30 shadow-2xl`}
              style={{
                maxHeight: 'calc(100vh - 132px)',
                maxWidth: 'min(100%, calc(100vh - 132px))',
              }}
            >
              {tiles.map((tile, idx) => (
                <MemoryTile
                  key={tile.uid}
                  tile={tile}
                  gridSize={gridSize}
                  isPeeking={isPeeking}
                  isFocused={focusedIndex === idx}
                  isMismatched={mismatchedIds.includes(tile.uid)}
                  customImageUrl={
                    tile.deity ? customImages[tile.deity.id] : undefined
                  }
                  onSelect={handleSelectTile}
                />
              ))}
            </div>
          </main>

          {/* Bottom Status & Divine Mantra Feedback Strip */}
          <footer className="w-full flex items-center justify-between px-4 py-1.5 rounded-xl bg-[#160B07]/90 border border-amber-500/20 text-xs shrink-0">
            <div className="flex items-center gap-2 truncate">
              {manualSaveBanner ? (
                <span className="text-emerald-300 font-semibold">
                  {t.scoreSavedToast(score.toLocaleString())}
                </span>
              ) : isPeeking ? (
                <span className="text-amber-300 font-semibold">
                  {t.peekingBanner}
                </span>
              ) : lastMatchedDeity ? (
                <div className="flex items-center gap-2 truncate">
                  <span className="font-bold text-amber-300">
                    {getDeityName(lastMatchedDeity.deity)} ({lastMatchedDeity.deity.nameEn})
                  </span>
                  <span aria-hidden="true" className="text-amber-500/40">·</span>
                  <span className="text-amber-100/85 truncate">
                    {getDeityMantra(lastMatchedDeity.deity)}
                  </span>
                  <span aria-hidden="true" className="text-amber-500/40">·</span>
                  <span className="font-mono-tabular font-bold text-emerald-400">
                    +{lastMatchedDeity.pointsEarned} pts
                  </span>
                </div>
              ) : (
                <span className="text-amber-200/60">{t.idlePlayPrompt}</span>
              )}
            </div>

            <div className="text-amber-200/60 font-mono-tabular whitespace-nowrap ml-3 hidden sm:block">
              {t.bestGridScoreFooter(gridSize)}{' '}
              <span className="text-amber-300 font-bold">
                {bestForCurrentGrid ? bestForCurrentGrid.score.toLocaleString() : '—'}
              </span>
            </div>
          </footer>
        </div>
      )}

      {/* =====================================================================
          STATE 3: PAUSE MODAL
         ===================================================================== */}
      {gameState === 'PAUSED' && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/80">
          <div className="w-full max-w-md rounded-2xl bg-[#1A0E0A] border border-amber-500/35 p-6 text-center shadow-2xl">
            <h2 className="text-2xl font-bold text-amber-100 font-display">
              {t.pauseTitle}
            </h2>
            <p className="text-xs text-amber-200/70 mt-1">
              {t.pauseSubtitle(
                t.gridLabels[gridSize].title,
                pairsMatched,
                currentConfig.pairCount
              )}
            </p>

            <div className="mt-6 flex flex-col gap-2.5">
              <button
                onClick={() => setGameState('PLAYING')}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-colors cursor-pointer"
              >
                {t.resumeBtn}
              </button>
              <button
                onClick={() => startNewGame(gridSize)}
                className="w-full py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-100 font-medium text-sm transition-colors cursor-pointer"
              >
                {t.restartBtn(gridSize)}
              </button>
              <button
                onClick={() => setIsScoreModalOpen(true)}
                className="w-full py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-200 font-medium text-sm transition-colors cursor-pointer"
              >
                {t.viewScoresBtn}
              </button>
              <button
                onClick={() => {
                  clearTimers();
                  setGameState('TITLE_MENU');
                }}
                className="w-full py-2.5 rounded-xl bg-amber-500/5 hover:bg-amber-500/15 text-amber-300 text-xs font-medium transition-colors cursor-pointer"
              >
                {t.backToTitleBtn}
              </button>
              <button
                onClick={() => {
                  clearTimers();
                  onExitToHub();
                }}
                className="w-full py-2.5 rounded-xl border border-amber-500/30 text-amber-200 hover:bg-amber-500/20 text-xs font-medium transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Sanatana Games Hub
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          STATE 4: VICTORY / ROUND SUMMARY MODAL
         ===================================================================== */}
      {gameState === 'VICTORY' && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/80">
          <div className="w-full max-w-lg rounded-2xl bg-[#1A0E0A] border border-amber-400/50 p-6 sm:p-8 text-center shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center mx-auto mb-3">
              <Trophy className="w-7 h-7 text-amber-400" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-amber-100 font-display">
              {t.victoryTitle}
            </h2>
            <p className="text-xs sm:text-sm text-amber-200/80 mt-1">
              {t.victorySubtitle(gridSize, currentConfig.pairCount)}
            </p>

            {/* Final Score & Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-5">
              <div className="p-3 rounded-xl bg-[#120906] border border-amber-500/25">
                <div className="text-[11px] text-amber-200/60">{t.totalScoreStat}</div>
                <div className="text-lg font-extrabold text-amber-400 font-mono-tabular mt-0.5">
                  {score.toLocaleString()}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#120906] border border-amber-500/25">
                <div className="text-[11px] text-amber-200/60">{t.totalMovesStat}</div>
                <div className="text-lg font-bold text-amber-100 font-mono-tabular mt-0.5">
                  {moves}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#120906] border border-amber-500/25">
                <div className="text-[11px] text-amber-200/60">{t.timeTakenStat}</div>
                <div className="text-lg font-bold text-amber-100 font-mono-tabular mt-0.5">
                  {formatTimer(elapsedSeconds)}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#120906] border border-amber-500/25">
                <div className="text-[11px] text-amber-200/60">{t.maxComboStat}</div>
                <div className="text-lg font-bold text-emerald-400 font-mono-tabular mt-0.5">
                  {maxCombo}×
                </div>
              </div>
            </div>

            <div className="text-xs text-emerald-300/90 mb-5">
              {t.autoSavedNote}
            </div>

            {/* Next Grid Progression or Replay */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
              <button
                onClick={() => startNewGame(gridSize)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {t.playAgainBtn(gridSize)}
              </button>
              <button
                onClick={() => setIsScoreModalOpen(true)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-100 font-semibold text-xs sm:text-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {t.viewScoresBtn}
              </button>
              <button
                onClick={() => {
                  clearTimers();
                  setGameState('TITLE_MENU');
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-amber-200/80 hover:text-amber-100 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {t.changeGridBtn}
              </button>
              <button
                onClick={() => {
                  clearTimers();
                  onExitToHub();
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#120906] border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center justify-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                {portal.backToHubBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODALS: SAVED SCORES & 32 DEITIES GALLERY
         ===================================================================== */}
      <ScoreModal
        isOpen={isScoreModalOpen}
        onClose={() => setIsScoreModalOpen(false)}
        scores={scores}
        playerName={playerName}
        onUpdatePlayerName={(name) => {
          setPlayerName(name);
          savePlayerName(name);
        }}
        onDeleteScore={(id) => setScores(deleteScoreRecord(id))}
        onClearAllScores={() => setScores(clearAllScores())}
        initialFilter="ALL"
      />

      <DeityGalleryModal
        isOpen={isGalleryModalOpen}
        onClose={() => setIsGalleryModalOpen(false)}
        customImages={customImages}
        onUpdateCustomImage={(deityId, dataUrl) => {
          const updated = saveCustomDeityImage(deityId, dataUrl);
          setCustomImages(updated);
        }}
      />
    </div>
  );
};
