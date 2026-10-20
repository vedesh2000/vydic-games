import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown, X } from 'lucide-react';
import { useI18n, SUPPORTED_LANGUAGES } from '../i18n/I18nContext';
import { soundEngine } from '../utils/sound';

interface LanguageSelectorProps {
  compact?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ compact = false }) => {
  const { lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});

  const currentLangObj =
    SUPPORTED_LANGUAGES.find((l) => l.code === lang) || SUPPORTED_LANGUAGES[0];

  const updatePosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const menuWidth = Math.min(288, vw - 24); // max 288px, at least 12px margin on both sides

    // Calculate left so it never overflows left (< 12px) or right (> vw - 12px)
    let left = rect.left;
    if (left + menuWidth > vw - 12) {
      left = vw - menuWidth - 12;
    }
    if (left < 12) {
      left = 12;
    }

    const top = Math.min(rect.bottom + 8, vh - 340);

    setMenuStyle({
      position: 'fixed',
      top: `${Math.max(12, top)}px`,
      left: `${left}px`,
      width: `${menuWidth}px`,
    });
  };

  useEffect(() => {
    if (!open) return;
    updatePosition();

    const handleOutside = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('mousedown', handleOutside);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('mousedown', handleOutside);
    };
  }, [open]);

  return (
    <div className="relative inline-block text-left">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => {
          setOpen((prev) => !prev);
          soundEngine.playTileFlip();
        }}
        className={`flex items-center gap-1.5 rounded-xl bg-[#1C100B]/95 hover:bg-amber-500/15 border border-amber-500/30 text-amber-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
          compact ? 'px-2.5 py-1.5 text-xs' : 'px-3.5 py-2 text-xs font-medium'
        }`}
        aria-label="Select Indic Language"
      >
        <Globe className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span>{currentLangObj.nativeName}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-amber-300/70 shrink-0 transition-transform duration-150 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <>
          {/* Subtle backdrop on mobile to prevent accidental clicks */}
          <div
            className="fixed inset-0 z-40 bg-black/40 sm:bg-transparent"
            onClick={() => setOpen(false)}
          />
          <div
            ref={menuRef}
            style={menuStyle}
            className="z-50 rounded-2xl bg-[#1A0D08] border border-amber-500/45 shadow-2xl p-2.5 max-h-[75vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between px-1.5 pb-2 mb-1.5 border-b border-amber-500/20">
              <span className="text-xs font-semibold text-amber-200/80">
                భాష · भाषा · Language
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-1 rounded-lg text-amber-200/60 hover:text-amber-100 hover:bg-amber-500/10 cursor-pointer"
                aria-label="Close language menu"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {SUPPORTED_LANGUAGES.map((item) => {
                const isSelected = item.code === lang;
                return (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => {
                      setLang(item.code);
                      soundEngine.playTileFlip();
                      setOpen(false);
                    }}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                        : 'bg-[#120805]/70 text-amber-100 hover:bg-amber-500/15 border border-amber-500/15'
                    }`}
                  >
                    <div className="min-w-0 pr-1">
                      <div className="text-sm leading-snug truncate">
                        {item.nativeName}
                      </div>
                      <div
                        className={`text-[10px] leading-tight truncate ${
                          isSelected ? 'text-slate-900/80' : 'text-amber-200/55'
                        }`}
                      >
                        {item.englishName}
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
