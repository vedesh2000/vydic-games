import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  Trophy,
  Dices,
  BookOpen,
} from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';
import { soundEngine } from '../../utils/sound';
import { LanguageSelector } from '../../components/LanguageSelector';

interface MokshaPatamGameProps {
  onExitToHub: () => void;
}

interface TileEffect {
  start: number;
  end: number;
  type: 'virtue' | 'vice';
  nameTe: string;
  nameEn: string;
  meaningTe: string;
  meaningEn: string;
}

// Sacred 64-Square Moksha Patam (Gyan Chauper) Ladders & Snakes
const MOKSHA_TILES: Record<number, TileEffect> = {
  // Ladders (Virtues)
  4: {
    start: 4,
    end: 14,
    type: 'virtue',
    nameTe: 'దాన ధర్మం (Dana)',
    nameEn: 'Selfless Charity (Dana)',
    meaningTe: 'నిస్వార్థ దానం ఆత్మకు సద్గతిని కలిగిస్తుంది.',
    meaningEn: 'Generosity and selfless giving elevate the soul.',
  },
  9: {
    start: 9,
    end: 31,
    type: 'virtue',
    nameTe: 'సత్యం (Satya)',
    nameEn: 'Truthfulness (Satya)',
    meaningTe: 'సత్యమేవ జయతే — సత్యం పరమ ధర్మం.',
    meaningEn: 'Truthfulness pierces illusion and uplifts life.',
  },
  20: {
    start: 20,
    end: 38,
    type: 'virtue',
    nameTe: 'దయా గుణం (Daya)',
    nameEn: 'Compassion (Daya)',
    meaningTe: 'సర్వ భూతముల పట్ల కరుణ మోక్ష మార్గం.',
    meaningEn: 'Compassion to all living beings opens higher realms.',
  },
  28: {
    start: 28,
    end: 51,
    type: 'virtue',
    nameTe: 'ధ్యానం & జపం (Dhyana)',
    nameEn: 'Meditation (Dhyana)',
    meaningTe: 'ఏకాగ్ర ధ్యానం మనస్సును పవిత్రం చేస్తుంది.',
    meaningEn: 'One-pointed meditation leads to inner tranquility.',
  },
  40: {
    start: 40,
    end: 59,
    type: 'virtue',
    nameTe: 'భక్తి మార్గం (Bhakti)',
    nameEn: 'Pure Devotion (Bhakti)',
    meaningTe: 'భగవద్భక్తి భవసాగరాన్ని సులభంగా దాటిస్తుంది.',
    meaningEn: 'Devotion bridges the ocean of worldly existence.',
  },
  52: {
    start: 52,
    end: 63,
    type: 'virtue',
    nameTe: 'ఆత్మ జ్ఞానం (Jnana)',
    nameEn: 'Spiritual Wisdom (Jnana)',
    meaningTe: 'జ్ఞానాగ్ని సమస్త కర్మ బంధాలను దహిస్తుంది.',
    meaningEn: 'Divine knowledge dissolves karma and leads to liberation.',
  },

  // Snakes (Karmic Vices)
  17: {
    start: 17,
    end: 7,
    type: 'vice',
    nameTe: 'అసత్యం (Asatya)',
    nameEn: 'Falsehood (Asatya)',
    meaningTe: 'అబద్ధం విశ్వాసాన్ని, ఆత్మ తేజస్సును నాశనం చేస్తుంది.',
    meaningEn: 'Deceit causes the soul to fall from grace.',
  },
  34: {
    start: 34,
    end: 12,
    type: 'vice',
    nameTe: 'క్రోధం (Krodha)',
    nameEn: 'Anger (Krodha)',
    meaningTe: 'కోపం బుద్ధిని నాశనం చేసి పతనానికి దారితీస్తుంది.',
    meaningEn: 'Anger destroys intellect and brings heavy downfall.',
  },
  47: {
    start: 47,
    end: 26,
    type: 'vice',
    nameTe: 'లోభం & దురాశ (Lobha)',
    nameEn: 'Greed (Lobha)',
    meaningTe: 'అత్యాశ మనిషిని బంధాలలో చిక్కుకునేలా చేస్తుంది.',
    meaningEn: 'Insatiable greed traps the mind in endless entanglement.',
  },
  54: {
    start: 54,
    end: 36,
    type: 'vice',
    nameTe: 'అహంకారం (Mada / Ego)',
    nameEn: 'Arrogance (Mada / Ego)',
    meaningTe: 'అహంకారం పతనానికి మూల కారణం.',
    meaningEn: 'Pride blindfolds the wisdom eye, leading downward.',
  },
  62: {
    start: 62,
    end: 19,
    type: 'vice',
    nameTe: 'మాయ & మోహం (Moha)',
    nameEn: 'Delusion & Attachment (Moha)',
    meaningTe: 'లక్ష్యం చేరువలో ఉన్నప్పుడు కలిగే మోహం తీవ్ర పతనానికి దారితీస్తుంది.',
    meaningEn: 'Attachment at the threshold of liberation causes rebirth.',
  },
};

export const MokshaPatamGame: React.FC<MokshaPatamGameProps> = ({ onExitToHub }) => {
  const { lang, t, portal } = useI18n();
  const [playerPos, setPlayerPos] = useState<number>(1);
  const [botPos, setBotPos] = useState<number>(1);
  const [turn, setTurn] = useState<'player' | 'bot'>('player');
  const [diceVal, setDiceVal] = useState<number>(1);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [activeMessage, setActiveMessage] = useState<TileEffect | null>(null);
  const [winner, setWinner] = useState<'player' | 'bot' | null>(null);
  const [movesCount, setMovesCount] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(() => soundEngine.getMuted());
  const [showGuide, setShowGuide] = useState<boolean>(false);

  const resetGame = () => {
    setPlayerPos(1);
    setBotPos(1);
    setTurn('player');
    setDiceVal(1);
    setWinner(null);
    setMovesCount(0);
    setActiveMessage(null);
    soundEngine.playTileFlip();
  };

  const executeMove = (current: number, roll: number): number => {
    let next = current + roll;
    if (next > 64) {
      next = current;
    }
    return next;
  };

  const handleRoll = () => {
    if (isRolling || winner || turn !== 'player') return;

    setIsRolling(true);
    soundEngine.playTileFlip();

    let rolls = 0;
    const interval = setInterval(() => {
      setDiceVal(Math.floor(Math.random() * 6) + 1);
      rolls++;
      if (rolls > 7) {
        clearInterval(interval);
        const finalRoll = Math.floor(Math.random() * 6) + 1;
        setDiceVal(finalRoll);
        setIsRolling(false);
        setMovesCount((m) => m + 1);

        const movedTo = executeMove(playerPos, finalRoll);
        setPlayerPos(movedTo);

        const effect = MOKSHA_TILES[movedTo];
        if (effect) {
          setTimeout(() => {
            if (effect.type === 'virtue') {
              soundEngine.playMatch(2);
            } else {
              soundEngine.playMismatch();
            }
            setActiveMessage(effect);
            setPlayerPos(effect.end);
          }, 350);
        }

        const finalPos = effect ? effect.end : movedTo;

        if (finalPos === 64) {
          soundEngine.playVictory();
          setWinner('player');
          return;
        }

        // Switch to Rishi Bot turn
        setTurn('bot');
      }
    }, 60);
  };

  // Bot Turn Simulation
  useEffect(() => {
    if (turn !== 'bot' || winner) return;

    const timer = setTimeout(() => {
      soundEngine.playTileFlip();
      const botRoll = Math.floor(Math.random() * 6) + 1;
      setDiceVal(botRoll);

      const movedTo = executeMove(botPos, botRoll);
      setBotPos(movedTo);

      const effect = MOKSHA_TILES[movedTo];
      if (effect) {
        setTimeout(() => {
          setBotPos(effect.end);
        }, 350);
      }

      const finalPos = effect ? effect.end : movedTo;
      if (finalPos === 64) {
        setWinner('bot');
        return;
      }

      setTurn('player');
    }, 1200);

    return () => clearTimeout(timer);
  }, [turn, botPos, winner]);

  // Construct 8x8 Boustrophedon Board (64 down to 1)
  const rows: number[][] = [];
  for (let r = 7; r >= 0; r--) {
    const rowNums: number[] = [];
    const isEvenFromBottom = r % 2 === 0;
    for (let c = 0; c < 8; c++) {
      const num = isEvenFromBottom ? r * 8 + (c + 1) : r * 8 + (8 - c);
      rowNums.push(num);
    }
    rows.push(rowNums);
  }

  const getTileName = (effect: TileEffect) => {
    if (lang === 'te') return effect.nameTe;
    return effect.nameEn;
  };

  const getTileMeaning = (effect: TileEffect) => {
    if (lang === 'te') return effect.meaningTe;
    return effect.meaningEn;
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gradient-to-b from-[#180C07] via-[#100704] to-[#0A0402] text-[#FEF3C7] flex flex-col select-none">
      {/* Top Bar Header */}
      <header className="relative z-20 w-full flex items-center justify-between px-3 sm:px-6 py-2.5 bg-[#1C0E08]/95 border-b border-amber-500/25 shadow-md">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onExitToHub}
            className="px-2.5 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/35 text-amber-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">{portal.backToHubBtn}</span>
            <span className="sm:hidden">Hub</span>
          </button>
          <span className="font-display font-bold text-sm sm:text-base text-amber-100 hidden md:inline">
            {portal.mokshaTitle}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowGuide(true)}
            className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs flex items-center gap-1 border border-amber-500/25 cursor-pointer"
            title="Spiritual Meaning of Moksha Patam"
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">{portal.mokshaGuideBtn}</span>
          </button>
          <LanguageSelector compact />
          <button
            onClick={() => {
              const muted = soundEngine.toggleMute();
              setIsMuted(muted);
            }}
            className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-200 cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <button
            onClick={resetGame}
            className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-200 cursor-pointer"
            title="Reset Board"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Game Shell */}
      <main className="flex-1 flex flex-col md:flex-row items-center justify-between p-2 sm:p-4 gap-3 overflow-hidden">
        {/* Left/Center: 8x8 Vedic Board (Squares 1 to 64) */}
        <div className="flex-1 flex items-center justify-center w-full max-h-[calc(100vh-130px)] overflow-hidden">
          <div
            className="w-full max-h-full aspect-square grid grid-cols-8 gap-1 p-2 sm:p-3 rounded-2xl bg-[#1C0E08]/90 border border-amber-500/35 shadow-2xl"
            style={{ maxWidth: 'min(100%, calc(100vh - 130px))' }}
          >
            {rows.flat().map((sqNum) => {
              const isStartTile = sqNum === 1;
              const isGoalTile = sqNum === 64;
              const effect = MOKSHA_TILES[sqNum];
              const hasPlayer = playerPos === sqNum;
              const hasBot = botPos === sqNum;

              return (
                <div
                  key={sqNum}
                  className={`relative flex flex-col items-center justify-between p-1 rounded-md sm:rounded-lg border transition-all text-center overflow-hidden ${
                    isGoalTile
                      ? 'bg-gradient-to-br from-amber-600 via-amber-400 to-amber-700 border-amber-200 text-slate-950 font-bold shadow-lg animate-pulse'
                      : isStartTile
                      ? 'bg-[#2A160D] border-amber-500/40'
                      : effect?.type === 'virtue'
                      ? 'bg-emerald-950/40 border-emerald-500/45 text-emerald-200'
                      : effect?.type === 'vice'
                      ? 'bg-rose-950/40 border-rose-500/45 text-rose-200'
                      : 'bg-[#150A06] border-amber-500/15 text-amber-200/80'
                  }`}
                >
                  {/* Square Index Number */}
                  <span className="text-[9px] sm:text-[10px] font-mono-tabular opacity-75 self-start leading-none">
                    {sqNum}
                  </span>

                  {/* Center Symbol or Goal Title */}
                  <div className="my-auto flex flex-col items-center leading-none">
                    {isGoalTile ? (
                      <span className="text-[10px] sm:text-xs font-black uppercase text-slate-950">
                        {portal.mokshaTileGoal}
                      </span>
                    ) : effect?.type === 'virtue' ? (
                      <span className="text-[10px] sm:text-xs font-bold text-emerald-300">
                        ▲ {effect.end}
                      </span>
                    ) : effect?.type === 'vice' ? (
                      <span className="text-[10px] sm:text-xs font-bold text-rose-300">
                        ▼ {effect.end}
                      </span>
                    ) : null}
                  </div>

                  {/* Player & Bot Pawns */}
                  <div className="flex items-center gap-0.5 justify-center z-10">
                    {hasPlayer && (
                      <div
                        className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-amber-400 border border-slate-950 flex items-center justify-center text-[8px] font-bold text-slate-950 shadow-md"
                        title={portal.mokshaYouLabel}
                      >
                        P
                      </div>
                    )}
                    {hasBot && (
                      <div
                        className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-sky-400 border border-slate-950 flex items-center justify-center text-[8px] font-bold text-slate-950 shadow-md"
                        title={portal.mokshaRishiLabel}
                      >
                        R
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Player Controls & Status Panel */}
        <div className="w-full md:w-72 flex md:flex-col items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl bg-[#180C07]/90 border border-amber-500/25 shrink-0">
          {/* Status cluster */}
          <div className="w-full flex md:flex-col justify-between items-center gap-2">
            <div className="text-left w-full">
              <div className="text-[11px] text-amber-200/60 uppercase tracking-wide">
                {portal.mokshaPositionsLabel}
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs sm:text-sm font-mono-tabular font-bold">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
                  <span>{portal.mokshaYouLabel}: {playerPos} / 64</span>
                </div>
                <div className="flex items-center gap-1.5 text-sky-300">
                  <span className="w-3 h-3 rounded-full bg-sky-400 inline-block" />
                  <span>{portal.mokshaRishiLabel}: {botPos} / 64</span>
                </div>
              </div>
            </div>

            <div className="text-left w-full mt-1 sm:mt-2">
              <span className="text-[11px] text-amber-200/60">
                {portal.mokshaTurnLabel}:{' '}
                <strong className={turn === 'player' ? 'text-amber-400' : 'text-sky-300'}>
                  {turn === 'player' ? portal.mokshaYourTurn : portal.mokshaRishiTurn}
                </strong>
              </span>
            </div>
          </div>

          {/* Dice & Roll Button */}
          <div className="flex flex-col items-center justify-center my-auto py-2">
            <div
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#FEF08A] to-[#D97706] text-slate-950 font-black text-2xl sm:text-3xl flex items-center justify-center shadow-xl border-2 border-amber-200 transition-transform ${
                isRolling ? 'rotate-180 scale-110' : ''
              }`}
            >
              {diceVal}
            </div>

            <button
              onClick={handleRoll}
              disabled={isRolling || turn !== 'player' || !!winner}
              className={`mt-3 px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-all cursor-pointer ${
                turn === 'player' && !winner && !isRolling
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 active:scale-95'
                  : 'bg-amber-500/20 text-amber-200/40 border border-amber-500/15 cursor-not-allowed'
              }`}
            >
              <Dices className="w-4 h-4" />
              {portal.mokshaRollBtn}
            </button>
          </div>

          {/* Bottom quick tip */}
          <div className="w-full text-center text-[10px] text-amber-200/50 hidden md:block">
            {portal.mokshaTip}
          </div>
        </div>
      </main>

      {/* Message Modal for Ladder / Snake */}
      {activeMessage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
          onClick={() => setActiveMessage(null)}
        >
          <div
            className={`w-full max-w-md rounded-2xl p-6 border shadow-2xl text-center ${
              activeMessage.type === 'virtue'
                ? 'bg-[#0B1A12] border-emerald-500/50'
                : 'bg-[#1C0A0A] border-rose-500/50'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center text-xl font-bold mb-3 ${
                activeMessage.type === 'virtue'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-rose-500/20 text-rose-400'
              }`}
            >
              {activeMessage.type === 'virtue' ? '▲' : '▼'}
            </div>
            <h3
              className={`text-lg font-bold ${
                activeMessage.type === 'virtue' ? 'text-emerald-300' : 'text-rose-300'
              }`}
            >
              {getTileName(activeMessage)}
            </h3>
            {lang !== 'en' && (
              <p className="text-xs text-amber-200/70 mt-0.5">{activeMessage.nameEn}</p>
            )}
            <p className="text-sm text-amber-100 my-4 px-2">{getTileMeaning(activeMessage)}</p>
            {lang !== 'en' && (
              <p className="text-xs text-amber-200/60 italic mb-5">{activeMessage.meaningEn}</p>
            )}
            <button
              onClick={() => setActiveMessage(null)}
              className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs cursor-pointer"
            >
              {portal.mokshaGotItBtn}
            </button>
          </div>
        </div>
      )}

      {/* Victory Modal */}
      {winner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85">
          <div className="w-full max-w-md rounded-2xl bg-[#1A0E08] border border-amber-400/60 p-6 text-center shadow-2xl">
            <Trophy className="w-12 h-12 text-amber-400 mx-auto mb-3" />
            <h2 className="text-2xl font-bold text-amber-100 font-display">
              {winner === 'player'
                ? portal.mokshaVictoryTitle
                : portal.mokshaLossTitle}
            </h2>
            <p className="text-xs text-amber-200/80 mt-1">
              {winner === 'player'
                ? portal.mokshaVictorySubtitle(movesCount)
                : portal.mokshaLossSubtitle}
            </p>

            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={resetGame}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer"
              >
                {t.playAgainBtn ? t.playAgainBtn('8×8') : 'Play Again'}
              </button>
              <button
                onClick={onExitToHub}
                className="px-5 py-2.5 rounded-xl border border-amber-500/35 text-amber-200 hover:bg-amber-500/15 font-semibold text-xs cursor-pointer"
              >
                {portal.backToHubBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Guide Modal */}
      {showGuide && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
          onClick={() => setShowGuide(false)}
        >
          <div
            className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl bg-[#1A0E08] border border-amber-500/40 p-6 text-left shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-amber-500/25 pb-3">
              <h3 className="text-base font-bold text-amber-100 font-display">
                {portal.mokshaGuideTitle}
              </h3>
              <button
                onClick={() => setShowGuide(false)}
                className="text-amber-200/60 hover:text-amber-100 text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3 mt-4 text-xs text-amber-200/80 leading-relaxed">
              <p>{portal.mokshaGuideP1}</p>
              <p>{portal.mokshaGuideP2}</p>
              <div className="pt-2">
                <strong className="text-amber-300">{portal.mokshaGuideGoal}</strong>
              </div>
            </div>
            <button
              onClick={() => setShowGuide(false)}
              className="mt-5 w-full py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs cursor-pointer"
            >
              {portal.mokshaGotItBtn}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
