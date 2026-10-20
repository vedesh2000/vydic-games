import React from 'react';
import { Check } from 'lucide-react';
import { DeityCardData, GridSizeKey } from '../data/deities';
import { DeityPortrait, BlessingTileArtwork } from './DeityPortrait';
import { useI18n } from '../i18n/I18nContext';

export interface BoardTile {
  uid: string;
  positionIndex: number;
  kind: 'deity' | 'blessing';
  deity?: DeityCardData;
  isFlipped: boolean;
  isMatched: boolean;
}

interface MemoryTileProps {
  tile: BoardTile;
  gridSize: GridSizeKey;
  isPeeking: boolean;
  isFocused: boolean;
  isMismatched: boolean;
  customImageUrl?: string;
  onSelect: (tile: BoardTile, event: React.MouseEvent<HTMLButtonElement>) => void;
}

export const MemoryTile: React.FC<MemoryTileProps> = React.memo(
  ({
    tile,
    gridSize,
    isPeeking,
    isFocused,
    isMismatched,
    customImageUrl,
    onSelect,
  }) => {
    const { t, getDeityName } = useI18n();
    const revealed = tile.isFlipped || tile.isMatched || isPeeking;
    const isDenseGrid = gridSize === '8x8' || gridSize === '6x6';

    return (
      <button
        type="button"
        onClick={(e) => onSelect(tile, e)}
        disabled={tile.isMatched}
        aria-label={
          revealed
            ? tile.kind === 'blessing'
              ? t.blessingTileAria
              : tile.deity
              ? `${getDeityName(tile.deity)} (${tile.deity.nameEn})`
              : `Tile ${tile.positionIndex + 1}`
            : `Tile ${tile.positionIndex + 1}`
        }
        className={`group relative w-full h-full aspect-square perspective-1000 select-none focus:outline-none cursor-pointer ${
          tile.isMatched ? 'cursor-default' : ''
        } ${isMismatched ? 'animate-bounce' : ''}`}
      >
        <div
          className={`relative w-full h-full preserve-3d transition-transform duration-200 ease-out ${
            revealed ? 'rotate-y-180' : 'group-hover:-translate-y-0.5'
          } ${tile.isMatched ? 'animate-match-pulse' : ''}`}
        >
          {/* FACE-DOWN: Carved Temple Brass Mandala Back */}
          <div
            className={`absolute inset-0 w-full h-full backface-hidden rounded-lg sm:rounded-xl overflow-hidden flex items-center justify-center transition-colors ${
              isFocused
                ? 'ring-2 ring-amber-300 bg-[#2A150D]'
                : 'bg-gradient-to-br from-[#28140C] via-[#1C0D08] to-[#130805] border border-amber-500/35 group-hover:border-amber-400/75'
            } shadow-md`}
          >
            {/* Intricate Brass Temple Mandala SVG */}
            <svg
              viewBox="0 0 100 100"
              className="w-4/5 h-4/5 opacity-75 group-hover:opacity-95 transition-opacity"
              aria-hidden="true"
            >
              <rect
                x="6"
                y="6"
                width="88"
                height="88"
                rx="10"
                fill="none"
                stroke="#D97706"
                strokeWidth="1.5"
                strokeOpacity="0.55"
              />
              <circle
                cx="50"
                cy="50"
                r="32"
                fill="none"
                stroke="#F59E0B"
                strokeWidth="1.2"
                strokeDasharray="3 2"
                strokeOpacity="0.65"
              />
              <circle
                cx="50"
                cy="50"
                r="22"
                fill="#451A03"
                fillOpacity="0.5"
                stroke="#FBBF24"
                strokeWidth="1.2"
              />
              {/* 8 Sacred Lotus Petals */}
              {Array.from({ length: 8 }).map((_, idx) => (
                <ellipse
                  key={idx}
                  cx="50"
                  cy="24"
                  rx="4.5"
                  ry="8"
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="1"
                  strokeOpacity="0.6"
                  transform={`rotate(${idx * 45} 50 50)`}
                />
              ))}
              {/* Sacred Sankha / Om Center */}
              <text
                x="50"
                y="56"
                textAnchor="middle"
                fill="#FDE68A"
                fontSize={isDenseGrid ? '20' : '22'}
                fontWeight="bold"
                fontFamily="serif"
              >
                ॐ
              </text>
            </svg>

            {/* Subtle Corner Position Index for Spatial Memory Aid */}
            <span className="absolute bottom-1 right-1.5 text-[9px] font-mono-tabular text-amber-300/35 leading-none">
              {tile.positionIndex + 1}
            </span>
          </div>

          {/* FACE-UP: Sacred Deity Portrait or Central Om Blessing */}
          <div
            className={`absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-lg sm:rounded-xl overflow-hidden shadow-lg ${
              tile.isMatched
                ? 'ring-2 ring-amber-400 shadow-amber-500/20'
                : isMismatched
                ? 'ring-2 ring-red-400'
                : 'ring-1 ring-amber-300/70'
            }`}
          >
            {tile.kind === 'blessing' ? (
              <BlessingTileArtwork />
            ) : tile.deity ? (
              <DeityPortrait deity={tile.deity} customImageUrl={customImageUrl} />
            ) : null}

            {/* Matched Check Seal in Top-Right Corner */}
            {tile.isMatched && (
              <div className="absolute top-1 right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
            )}
          </div>
        </div>
      </button>
    );
  }
);
