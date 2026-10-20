import React, { useState } from 'react';
import { Trophy, Trash2, X, Check } from 'lucide-react';
import { GridSizeKey, GRID_CONFIGS } from '../data/deities';
import { ScoreRecord } from '../utils/storage';
import { useI18n } from '../i18n/I18nContext';

interface ScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  scores: ScoreRecord[];
  playerName: string;
  onUpdatePlayerName: (name: string) => void;
  onDeleteScore: (id: string) => void;
  onClearAllScores: () => void;
  initialFilter?: GridSizeKey | 'ALL';
}

export const ScoreModal: React.FC<ScoreModalProps> = ({
  isOpen,
  onClose,
  scores,
  playerName,
  onUpdatePlayerName,
  onDeleteScore,
  onClearAllScores,
  initialFilter = 'ALL',
}) => {
  const { lang, t } = useI18n();
  const [filterGrid, setFilterGrid] = useState<GridSizeKey | 'ALL'>(initialFilter);
  const [editingName, setEditingName] = useState(playerName);
  const [nameSaved, setNameSaved] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  React.useEffect(() => {
    setEditingName(playerName);
  }, [playerName]);

  if (!isOpen) return null;

  const filteredScores = scores
    .filter((s) => (filterGrid === 'ALL' ? true : s.gridSize === filterGrid))
    .sort((a, b) => b.score - a.score);

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdatePlayerName(editingName);
    setNameSaved(true);
    setTimeout(() => setNameSaved(false), 1800);
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString(`${lang}-IN`, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return iso.slice(0, 10);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[88vh] flex flex-col rounded-2xl bg-[#1A0E0A] border border-amber-500/30 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-amber-500/20 bg-[#120906]">
          <div className="flex items-center gap-3">
            <Trophy className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <h2 className="text-lg font-bold text-amber-100 font-display">
                {t.scoreModalTitle}
              </h2>
              <p className="text-xs text-amber-200/60">
                {t.scoreModalSubtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-amber-200/70 hover:text-amber-100 hover:bg-amber-500/10 transition-colors cursor-pointer"
            aria-label={t.closeBtn}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Player Profile & Filter Bar */}
        <div className="px-6 py-4 border-b border-amber-500/15 bg-[#160B08] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <form onSubmit={handleSaveName} className="flex items-center gap-2">
            <label htmlFor="player-name-input" className="text-xs text-amber-200/70 whitespace-nowrap">
              {t.playerLabel}
            </label>
            <input
              id="player-name-input"
              type="text"
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              maxLength={24}
              className="px-3 py-1.5 text-sm rounded-lg bg-[#120906] border border-amber-500/30 text-amber-100 focus:outline-none focus:border-amber-400 w-44"
            />
            <button
              type="submit"
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 transition-colors flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
            >
              {nameSaved ? <Check className="w-3.5 h-3.5" /> : null}
              {nameSaved ? t.nameSavedBtn : t.saveNameBtn}
            </button>
          </form>

          {/* Interactive Filter Controls */}
          <div className="flex items-center gap-1 p-1 bg-[#120906] rounded-lg border border-amber-500/20 overflow-x-auto">
            {(['ALL', '3x3', '4x4', '5x5', '6x6', '8x8'] as const).map((key) => (
              <button
                key={key}
                onClick={() => setFilterGrid(key)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  filterGrid === key
                    ? 'bg-amber-500 text-slate-950 font-semibold'
                    : 'text-amber-200/70 hover:text-amber-100'
                }`}
              >
                {key === 'ALL' ? t.allFilter : key}
              </button>
            ))}
          </div>
        </div>

        {/* Best Scores Summary Strip per Grid */}
        <div className="grid grid-cols-5 gap-2 px-6 py-3 bg-[#140A07] border-b border-amber-500/15">
          {(['3x3', '4x4', '5x5', '6x6', '8x8'] as GridSizeKey[]).map((gKey) => {
            const best = scores
              .filter((s) => s.gridSize === gKey)
              .reduce<ScoreRecord | null>((acc, cur) => (!acc || cur.score > acc.score ? cur : acc), null);
            return (
              <div
                key={gKey}
                className="px-3 py-2 rounded-lg bg-[#1C100B] border border-amber-500/15 text-center"
              >
                <div className="text-xs text-amber-300/70 font-medium">
                  {GRID_CONFIGS[gKey].key} {t.bestPrefix}
                </div>
                <div className="text-base font-bold text-amber-400 font-mono-tabular mt-0.5">
                  {best ? best.score.toLocaleString() : '—'}
                </div>
                <div className="text-[11px] text-amber-200/50 font-mono-tabular">
                  {best ? `${best.moves} · ${formatTime(best.timeSeconds)}` : t.notPlayedYet}
                </div>
              </div>
            );
          })}
        </div>

        {/* Scores Table */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {filteredScores.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-base text-amber-200/70">{t.emptyScoresMsg}</p>
              <p className="text-xs text-amber-200/50 mt-1">{t.emptyScoresSubMsg}</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-amber-500/20 text-xs text-amber-200/60">
                  <th className="py-2.5 pr-3 font-medium">{t.colRank}</th>
                  <th className="py-2.5 px-3 font-medium">{t.colPlayer}</th>
                  <th className="py-2.5 px-3 font-medium">{t.colGrid}</th>
                  <th className="py-2.5 px-3 font-medium text-right">{t.colScore}</th>
                  <th className="py-2.5 px-3 font-medium text-right">{t.colPairs}</th>
                  <th className="py-2.5 px-3 font-medium text-right">{t.colMoves}</th>
                  <th className="py-2.5 px-3 font-medium text-right">{t.colTime}</th>
                  <th className="py-2.5 px-3 font-medium">{t.colDate}</th>
                  <th className="py-2.5 pl-3 text-right font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-500/10 text-sm">
                {filteredScores.map((rec, idx) => (
                  <tr key={rec.id} className="hover:bg-amber-500/5 transition-colors">
                    <td className="py-3 pr-3 font-mono-tabular text-amber-400 font-semibold">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-medium text-amber-100">{rec.playerName}</div>
                      {rec.note && (
                        <div className="text-xs text-amber-200/55">{rec.note}</div>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono-tabular text-amber-200">
                      {rec.gridSize}
                    </td>
                    <td className="py-3 px-3 text-right font-mono-tabular font-bold text-amber-400">
                      {rec.score.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right font-mono-tabular text-amber-200/80">
                      {rec.pairsMatched}/{rec.totalPairs}
                    </td>
                    <td className="py-3 px-3 text-right font-mono-tabular text-amber-200/80">
                      {rec.moves}
                    </td>
                    <td className="py-3 px-3 text-right font-mono-tabular text-amber-200/80">
                      {formatTime(rec.timeSeconds)}
                    </td>
                    <td className="py-3 px-3 text-xs text-amber-200/60 whitespace-nowrap">
                      {formatDate(rec.dateIso)}
                    </td>
                    <td className="py-3 pl-3 text-right">
                      <button
                        onClick={() => onDeleteScore(rec.id)}
                        className="p-1.5 rounded text-amber-200/40 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                        title="Delete Score"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-amber-500/20 bg-[#120906]">
          <div className="text-xs text-amber-200/60 font-mono-tabular">
            {t.totalSavedGames(scores.length)}
          </div>
          <div className="flex items-center gap-3">
            {scores.length > 0 && (
              confirmClear ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-red-300">{t.confirmClearPrompt}</span>
                  <button
                    onClick={() => {
                      onClearAllScores();
                      setConfirmClear(false);
                    }}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-600 text-white hover:bg-red-500 transition-colors cursor-pointer"
                  >
                    {t.yesDeleteBtn}
                  </button>
                  <button
                    onClick={() => setConfirmClear(false)}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-amber-500/15 text-amber-200 hover:bg-amber-500/25 transition-colors cursor-pointer"
                  >
                    {t.noCancelBtn}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmClear(true)}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg border border-red-500/30 text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer"
                >
                  {t.clearAllBtn}
                </button>
              )
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors cursor-pointer"
            >
              {t.closeBtn}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
