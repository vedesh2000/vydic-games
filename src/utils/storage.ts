import { GridSizeKey } from '../data/deities';

export interface ScoreRecord {
  id: string;
  playerName: string;
  gridSize: GridSizeKey;
  score: number;
  moves: number;
  pairsMatched: number;
  totalPairs: number;
  timeSeconds: number;
  accuracyPercent: number;
  maxCombo: number;
  dateIso: string;
  note?: string;
}

const SCORES_STORAGE_KEY = 'divya_smarana_scores_v1';
const PLAYER_NAME_KEY = 'divya_smarana_player_name_v1';
const CUSTOM_IMAGES_KEY = 'divya_smarana_custom_deity_images_v1';

const SEED_SCORES: ScoreRecord[] = [
  {
    id: 'seed-1',
    playerName: 'భక్తుడు (Devotee)',
    gridSize: '4x4',
    score: 2450,
    moves: 12,
    pairsMatched: 8,
    totalPairs: 8,
    timeSeconds: 38,
    accuracyPercent: 67,
    maxCombo: 4,
    dateIso: new Date(Date.now() - 86400000 * 2).toISOString(),
    note: 'శ్రీరామ జయం',
  },
  {
    id: 'seed-2',
    playerName: 'భక్తుడు (Devotee)',
    gridSize: '6x6',
    score: 6820,
    moves: 28,
    pairsMatched: 18,
    totalPairs: 18,
    timeSeconds: 95,
    accuracyPercent: 64,
    maxCombo: 5,
    dateIso: new Date(Date.now() - 86400000).toISOString(),
    note: 'హనుమాన్ చాలీసా స్మరణ',
  },
];

export function loadScores(): ScoreRecord[] {
  try {
    const raw = localStorage.getItem(SCORES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(SCORES_STORAGE_KEY, JSON.stringify(SEED_SCORES));
      return SEED_SCORES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : SEED_SCORES;
  } catch {
    return SEED_SCORES;
  }
}

export function saveScoreRecord(record: Omit<ScoreRecord, 'id' | 'dateIso'>): ScoreRecord {
  const existing = loadScores();
  const newRecord: ScoreRecord = {
    ...record,
    id: `score_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    dateIso: new Date().toISOString(),
  };
  const updated = [newRecord, ...existing].slice(0, 100);
  try {
    localStorage.setItem(SCORES_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore quota errors
  }
  return newRecord;
}

export function deleteScoreRecord(id: string): ScoreRecord[] {
  const existing = loadScores().filter((r) => r.id !== id);
  try {
    localStorage.setItem(SCORES_STORAGE_KEY, JSON.stringify(existing));
  } catch {
    // ignore
  }
  return existing;
}

export function clearAllScores(): ScoreRecord[] {
  try {
    localStorage.setItem(SCORES_STORAGE_KEY, JSON.stringify([]));
  } catch {
    // ignore
  }
  return [];
}

export function getBestScoreForGrid(scores: ScoreRecord[], gridSize: GridSizeKey): ScoreRecord | null {
  const filtered = scores.filter((s) => s.gridSize === gridSize);
  if (filtered.length === 0) return null;
  return filtered.reduce((best, curr) => (curr.score > best.score ? curr : best), filtered[0]);
}

const DEFAULT_DEVOTEE_NAMES = new Set([
  'భక్తుడు',
  'भक्त',
  'भक्तः',
  'பக்தர்',
  'ಭಕ್ತ',
  'ഭക്തൻ',
  'ભક્ત',
  'ভক্ত',
  'ਭਗਤ',
  'ଭକ୍ତ',
  'Devotee',
  'భక్తుడు (Devotee)',
]);

export function isDefaultDevoteeName(name: string): boolean {
  return !name || !name.trim() || DEFAULT_DEVOTEE_NAMES.has(name.trim());
}

export function loadPlayerName(langCode: string = 'te'): string {
  const langDefaults: Record<string, string> = {
    te: 'భక్తుడు',
    hi: 'भक्त',
    sa: 'भक्तः',
    ta: 'பக்தர்',
    kn: 'ಭಕ್ತ',
    ml: 'ഭക്തൻ',
    mr: 'भक्त',
    gu: 'ભક્ત',
    bn: 'ভক্ত',
    pa: 'ਭਗਤ',
    or: 'ଭକ୍ତ',
    as: 'ভক্ত',
    en: 'Devotee',
  };
  const targetDefault = langDefaults[langCode] || 'Devotee';
  try {
    const saved = localStorage.getItem(PLAYER_NAME_KEY);
    if (!saved || !saved.trim() || DEFAULT_DEVOTEE_NAMES.has(saved.trim())) {
      return targetDefault;
    }
    return saved.trim();
  } catch {
    return targetDefault;
  }
}

export function savePlayerName(name: string): void {
  try {
    localStorage.setItem(PLAYER_NAME_KEY, name.trim());
  } catch {
    // ignore
  }
}

export function loadCustomDeityImages(): Record<string, string> {
  try {
    const raw = localStorage.getItem(CUSTOM_IMAGES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveCustomDeityImage(deityId: string, dataUrl: string | null): Record<string, string> {
  const current = loadCustomDeityImages();
  if (dataUrl === null) {
    delete current[deityId];
  } else {
    current[deityId] = dataUrl;
  }
  try {
    localStorage.setItem(CUSTOM_IMAGES_KEY, JSON.stringify(current));
  } catch {
    // ignore quota exceeded
  }
  return { ...current };
}
