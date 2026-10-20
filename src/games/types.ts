import React from 'react';
import { IndicLangCode } from '../i18n/translations';

export type GameCategory = 'all' | 'memory' | 'board' | 'puzzle' | 'knowledge';

export interface GameInfo {
  id: string;
  title: Record<IndicLangCode, string>;
  tagline: Record<IndicLangCode, string>;
  description: Record<IndicLangCode, string>;
  badge: Record<IndicLangCode, string>;
  category: GameCategory;
  accentColor: string;
  gradient: [string, string];
  icon: string;
  component: React.ComponentType<{ onExitToHub: () => void }>;
  status: 'ready' | 'coming-soon';
  tags: Record<IndicLangCode, string[]>;
  difficulty: Record<IndicLangCode, string>;
  players: Record<IndicLangCode, string>;
}
