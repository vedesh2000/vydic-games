import React, { useState, useRef } from 'react';
import { X, Upload, RotateCcw, Volume2 } from 'lucide-react';
import { SANATANA_DEITIES, DeityCardData } from '../data/deities';
import { DeityPortrait } from './DeityPortrait';
import { soundEngine } from '../utils/sound';
import { useI18n } from '../i18n/I18nContext';

interface DeityGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  customImages: Record<string, string>;
  onUpdateCustomImage: (deityId: string, dataUrl: string | null) => void;
}

export const DeityGalleryModal: React.FC<DeityGalleryModalProps> = ({
  isOpen,
  onClose,
  customImages,
  onUpdateCustomImage,
}) => {
  const { lang, t, getDeityName } = useI18n();
  const [selectedDeity, setSelectedDeity] = useState<DeityCardData>(SANATANA_DEITIES[0]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onUpdateCustomImage(selectedDeity.id, reader.result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl max-h-[88vh] flex flex-col rounded-2xl bg-[#1A0E0A] border border-amber-500/30 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-amber-500/20 bg-[#120906]">
          <div>
            <h2 className="text-lg font-bold text-amber-100 font-display">
              {t.galleryTitle}
            </h2>
            <p className="text-xs text-amber-200/60">
              {t.gallerySubtitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-amber-200/70 hover:text-amber-100 hover:bg-amber-500/10 transition-colors cursor-pointer"
            aria-label={t.closeBtn}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Split Body */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Left: Selected Deity Spotlight */}
          <div className="w-full md:w-80 p-6 border-b md:border-b-0 md:border-r border-amber-500/15 bg-[#150A07] flex flex-col items-center justify-between shrink-0">
            <div className="w-full flex flex-col items-center text-center">
              <div className="w-44 h-44 rounded-xl overflow-hidden shadow-lg border border-amber-500/40">
                <DeityPortrait
                  deity={selectedDeity}
                  customImageUrl={customImages[selectedDeity.id]}
                />
              </div>
              <div className="mt-4 text-xs text-amber-400/80 font-mono-tabular">
                {t.cardNumberLabel(selectedDeity.index)}
              </div>
              <h3 className="text-xl font-bold text-amber-100 mt-1">
                {getDeityName(selectedDeity)}
              </h3>
              {lang !== 'en' && (
                <div className="text-sm font-medium text-amber-300/90">
                  {selectedDeity.nameEn}
                </div>
              )}
              <p className="text-xs text-amber-200/70 mt-1.5">
                {lang === 'te' ? selectedDeity.epithetTe : selectedDeity.epithetEn}
              </p>

              <div className="w-full mt-4 pt-4 border-t border-amber-500/15 text-left space-y-2 text-xs">
                <div>
                  <span className="text-amber-200/50">{t.mantraLabel} </span>
                  <span className="text-amber-100 font-medium">
                    {lang === 'te' ? selectedDeity.mantraTe : selectedDeity.mantraEn}
                  </span>
                </div>
                <div>
                  <span className="text-amber-200/50">{t.attributeLabel} </span>
                  <span className="text-amber-200/90">
                    {lang === 'te' ? selectedDeity.attributeTe : selectedDeity.attributeEn}
                  </span>
                </div>
              </div>
            </div>

            {/* Custom Photo Upload / Reset Actions */}
            <div className="w-full mt-5 pt-4 border-t border-amber-500/15 flex flex-col gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 px-3 py-2 text-xs font-medium rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-100 transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  {t.uploadCustomPhotoBtn}
                </button>
                <button
                  onClick={() => soundEngine.playMatch(2)}
                  className="px-3 py-2 text-xs font-medium rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-200 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  title="Play Temple Bell"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  {t.bellChimeBtn}
                </button>
              </div>
              {customImages[selectedDeity.id] && (
                <button
                  onClick={() => onUpdateCustomImage(selectedDeity.id, null)}
                  className="w-full px-3 py-1.5 text-xs font-medium rounded-lg text-amber-300/80 hover:text-amber-100 hover:bg-amber-500/10 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  {t.resetPortraitBtn}
                </button>
              )}
            </div>
          </div>

          {/* Right: 32 Deities Grid */}
          <div className="flex-1 overflow-y-auto p-5">
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {SANATANA_DEITIES.map((deity) => {
                const isSelected = selectedDeity.id === deity.id;
                const localName = getDeityName(deity);
                return (
                  <button
                    key={deity.id}
                    onClick={() => {
                      setSelectedDeity(deity);
                      soundEngine.playTileFlip();
                    }}
                    className={`group flex flex-col items-center p-2 rounded-xl transition-all cursor-pointer text-center ${
                      isSelected
                        ? 'bg-amber-500/20 ring-2 ring-amber-400'
                        : 'bg-[#140A07] hover:bg-amber-500/10 border border-amber-500/15'
                    }`}
                  >
                    <div className="w-full aspect-square rounded-lg overflow-hidden">
                      <DeityPortrait
                        deity={deity}
                        customImageUrl={customImages[deity.id]}
                      />
                    </div>
                    <div className="mt-1.5 text-xs font-semibold text-amber-100 truncate w-full">
                      {localName}
                    </div>
                    <div className="text-[10px] text-amber-200/60 truncate w-full">
                      {deity.nameEn}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
