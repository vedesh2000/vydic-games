import React, { useState } from 'react';
import { DeityCardData } from '../data/deities';
import { useI18n } from '../i18n/I18nContext';

interface DeityPortraitProps {
  deity: DeityCardData;
  customImageUrl?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const BlessingTileArtwork: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    viewBox="0 0 160 160"
    className={`w-full h-full select-none ${className}`}
    aria-label="Sacred Om Kalasha Blessing"
  >
    <defs>
      <radialGradient id="blessingBg" cx="50%" cy="50%" r="60%">
        <stop offset="0%" stopColor="#78350F" />
        <stop offset="65%" stopColor="#451A03" />
        <stop offset="100%" stopColor="#1C0A02" />
      </radialGradient>
      <radialGradient id="blessingHalo" cx="50%" cy="46%" r="42%">
        <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.9" />
        <stop offset="55%" stopColor="#F59E0B" stopOpacity="0.45" />
        <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="goldLeaf" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FEF08A" />
        <stop offset="50%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#B45309" />
      </linearGradient>
    </defs>

    <rect width="160" height="160" rx="14" fill="url(#blessingBg)" />
    <rect
      x="6"
      y="6"
      width="148"
      height="148"
      rx="10"
      fill="none"
      stroke="url(#goldLeaf)"
      strokeWidth="2"
      strokeOpacity="0.7"
    />

    {/* 16-Petal Lotus Mandala */}
    <circle cx="80" cy="76" r="56" fill="url(#blessingHalo)" />
    <g transform="translate(80, 76)" stroke="url(#goldLeaf)" strokeWidth="1.2" fill="none" opacity="0.55">
      {Array.from({ length: 12 }).map((_, i) => (
        <ellipse
          key={i}
          cx="0"
          cy="-36"
          rx="9"
          ry="20"
          transform={`rotate(${i * 30})`}
        />
      ))}
    </g>

    {/* Sacred Purnakumbha / Kalasha & Deepam */}
    <path
      d="M58 118 C52 100, 108 100, 102 118 L96 130 L64 130 Z"
      fill="url(#goldLeaf)"
      stroke="#FEF08A"
      strokeWidth="1.5"
    />
    {/* Mango leaves & Coconut */}
    <path d="M80 96 C62 84, 52 96, 65 104 Z" fill="#10B981" />
    <path d="M80 96 C98 84, 108 96, 95 104 Z" fill="#10B981" />
    <circle cx="80" cy="92" r="10" fill="#B45309" stroke="#FDE047" strokeWidth="1.5" />

    {/* Glowing Sacred Om Symbol */}
    <circle cx="80" cy="56" r="26" fill="#451A03" fillOpacity="0.75" stroke="url(#goldLeaf)" strokeWidth="2" />
    <text
      x="80"
      y="67"
      textAnchor="middle"
      fill="#FEF08A"
      fontSize="32"
      fontWeight="bold"
      fontFamily="serif"
    >
      ॐ
    </text>
  </svg>
);

export const DeityPortrait: React.FC<DeityPortraitProps> = ({
  deity,
  customImageUrl,
  className = '',
}) => {
  const [imgError, setImgError] = useState(false);
  const { getDeityName } = useI18n();
  const localizedName = getDeityName(deity);

  if (customImageUrl && !imgError) {
    return (
      <div className={`relative w-full h-full overflow-hidden rounded-lg bg-[#1A0E0A] ${className}`}>
        <img
          src={customImageUrl}
          alt={`${localizedName} (${deity.nameEn})`}
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 ring-1 ring-inset ring-amber-400/40 rounded-lg pointer-events-none" />
      </div>
    );
  }

  const gradId = `bg_${deity.id}`;
  const haloId = `halo_${deity.id}`;
  const goldId = `gold_${deity.id}`;

  const renderTilak = () => {
    switch (deity.tilakStyle) {
      case 'tirumala':
        return (
          <g>
            {/* Iconic Tirumala White U-Namam covering brow + red central Sri Choornam */}
            <path
              d="M69 57 L69 71 Q80 76 91 71 L91 57 L86 57 L86 68 Q80 71 74 68 L74 57 Z"
              fill="#F8FAFC"
            />
            <rect x="78.5" y="56" width="3" height="14" rx="1.5" fill="#DC2626" />
          </g>
        );
      case 'vishnu':
        return (
          <g>
            <path
              d="M74 57 L74 68 Q80 71 86 68 L86 57"
              fill="none"
              stroke="#FEF08A"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <line x1="80" y1="56" x2="80" y2="68" stroke="#EF4444" strokeWidth="2.2" strokeLinecap="round" />
          </g>
        );
      case 'shiva':
        return (
          <g>
            {/* Vibhuti Tripundra + Third Eye */}
            <line x1="70" y1="60" x2="90" y2="60" stroke="#E2E8F0" strokeWidth="1.6" strokeLinecap="round" />
            <line x1="72" y1="63.5" x2="88" y2="63.5" stroke="#E2E8F0" strokeWidth="1.6" strokeLinecap="round" />
            <line x1="70" y1="67" x2="90" y2="67" stroke="#E2E8F0" strokeWidth="1.6" strokeLinecap="round" />
            <ellipse cx="80" cy="63.5" rx="2.3" ry="4.2" fill="#EF4444" stroke="#FEF08A" strokeWidth="0.8" />
          </g>
        );
      case 'kumkum':
        return (
          <g>
            <circle cx="80" cy="63" r="3.8" fill="#DC2626" stroke="#FEF08A" strokeWidth="1" />
            <path d="M74 58 Q80 55 86 58" stroke="#FDE047" strokeWidth="1.2" fill="none" />
          </g>
        );
      case 'sindoor':
        return (
          <g>
            <path d="M77 56 L80 68 L83 56 Z" fill="#EF4444" />
            <circle cx="80" cy="66" r="2.2" fill="#FEF08A" />
          </g>
        );
      case 'surya':
        return (
          <g>
            <circle cx="80" cy="62" r="4" fill="#F97316" stroke="#FEF08A" strokeWidth="1.2" />
            <circle cx="80" cy="62" r="1.5" fill="#FEF08A" />
          </g>
        );
    }
  };

  const renderWeaponOrAttribute = () => {
    switch (deity.id) {
      case 'rama':
        return (
          <g>
            {/* Golden Kodanda Bow & Quiver */}
            <path
              d="M28 32 C12 68, 12 104, 30 136"
              fill="none"
              stroke={`url(#${goldId})`}
              strokeWidth="4.5"
              strokeLinecap="round"
            />
            <line x1="29" y1="34" x2="29" y2="134" stroke="#FEF08A" strokeWidth="1.2" strokeOpacity="0.85" />
            {/* Golden Arrow */}
            <line x1="126" y1="40" x2="136" y2="125" stroke={`url(#${goldId})`} strokeWidth="3" />
            <polygon points="125,32 120,44 132,43" fill="#FEF08A" />
          </g>
        );
      case 'krishna':
        return (
          <g>
            {/* Peacock Feather (Morpankh) on Crown */}
            <g transform="translate(94, 16) rotate(22)">
              <ellipse cx="0" cy="0" rx="9" ry="14" fill="#10B981" stroke="#34D399" strokeWidth="1" />
              <ellipse cx="0" cy="-1" rx="6" ry="9" fill="#0284C7" />
              <ellipse cx="0" cy="-2" rx="3.5" ry="5" fill="#1E1B4B" stroke="#F59E0B" strokeWidth="1" />
            </g>
            {/* Golden Bansuri Flute near lips */}
            <rect
              x="42"
              y="95"
              width="86"
              height="6.5"
              rx="3.2"
              transform="rotate(-5 80 96)"
              fill={`url(#${goldId})`}
              stroke="#FEF08A"
              strokeWidth="1"
            />
            <circle cx="62" cy="97" r="1.3" fill="#451A03" />
            <circle cx="72" cy="96.5" r="1.3" fill="#451A03" />
            <circle cx="82" cy="96" r="1.3" fill="#451A03" />
            <circle cx="92" cy="95.5" r="1.3" fill="#451A03" />
          </g>
        );
      case 'hanuman':
        return (
          <g>
            {/* Golden Gada Mace on Right */}
            <line x1="130" y1="62" x2="122" y2="136" stroke={`url(#${goldId})`} strokeWidth="4.5" strokeLinecap="round" />
            <circle cx="132" cy="52" r="14" fill={`url(#${goldId})`} stroke="#FEF08A" strokeWidth="1.5" />
            <path d="M120 52 Q132 45 144 52" stroke="#9A3412" strokeWidth="1.8" fill="none" />
            <polygon points="132,33 128,39 136,39" fill="#FEF08A" />
            {/* Glowing Sanjeevani Mountain on Left */}
            <polygon
              points="14,72 28,44 42,72"
              fill="#059669"
              stroke="#6EE7B7"
              strokeWidth="1.5"
            />
            <circle cx="28" cy="54" r="3" fill="#FEF08A" />
          </g>
        );
      case 'shiva':
      case 'nataraja':
      case 'ardhanarishwara':
        return (
          <g>
            {/* Crescent Moon in Locks */}
            <path
              d="M95 22 A11 11 0 1 1 83 34 A8 8 0 1 0 95 22 Z"
              fill="#F8FAFC"
            />
            {/* Golden Trishula on Left */}
            <line x1="28" y1="36" x2="28" y2="136" stroke={`url(#${goldId})`} strokeWidth="3.2" />
            <path
              d="M18 46 C18 60, 28 62, 28 62 C28 62, 38 60, 38 46"
              fill="none"
              stroke={`url(#${goldId})`}
              strokeWidth="3"
              strokeLinecap="round"
            />
            <polygon points="28,28 24,42 32,42" fill="#FEF08A" />
            {/* Damaru Drum */}
            <polygon points="20,68 36,78 36,68 20,78" fill="#D97706" stroke="#FEF08A" strokeWidth="1" />
            {/* Coiled Vasuki Serpent at Neck */}
            <path d="M58 106 Q80 115 102 106" stroke="#475569" strokeWidth="5" fill="none" strokeLinecap="round" />
          </g>
        );
      case 'ganesha':
        return (
          <g>
            {/* Large Auspicious Elephant Ears */}
            <path
              d="M52 56 C22 46, 18 88, 48 94 Z"
              fill={deity.skinTone}
              stroke={`url(#${goldId})`}
              strokeWidth="2"
            />
            <path
              d="M108 56 C138 46, 142 88, 112 94 Z"
              fill={deity.skinTone}
              stroke={`url(#${goldId})`}
              strokeWidth="2"
            />
            {/* Curved Elephant Trunk holding Modak */}
            <path
              d="M72 78 C72 108, 96 116, 102 100 C105 93, 96 90, 94 96"
              fill="none"
              stroke={deity.skinTone}
              strokeWidth="12"
              strokeLinecap="round"
            />
            {/* Ekadanta Tusk */}
            <path d="M67 86 L60 96 L70 91 Z" fill="#F8FAFC" />
            {/* Golden Modak Sweet in Trunk Curve */}
            <path d="M97 86 C91 94, 107 94, 101 86 Z" fill="#FEF08A" stroke="#D97706" strokeWidth="1" />
          </g>
        );
      case 'durga':
      case 'kali':
        return (
          <g>
            {/* Trishula Right & Chakra Left */}
            <line x1="132" y1="36" x2="132" y2="134" stroke={`url(#${goldId})`} strokeWidth="3" />
            <path d="M123 46 Q132 62 141 46" fill="none" stroke={`url(#${goldId})`} strokeWidth="2.5" />
            <circle cx="28" cy="56" r="12" fill="none" stroke="#FEF08A" strokeWidth="2.5" strokeDasharray="3 2" />
            {/* Traditional Nose Ring (Nath) */}
            <circle cx="85" cy="81" r="4.5" fill="none" stroke="#FEF08A" strokeWidth="1.3" />
          </g>
        );
      case 'lakshmi':
      case 'parvati':
      case 'annapurna':
      case 'gayatri':
        return (
          <g>
            {/* Twin Blooming Pink Lotuses Flanking Shoulders */}
            <g transform="translate(28, 66)">
              <ellipse cx="0" cy="0" rx="10" ry="6" fill="#F43F5E" />
              <ellipse cx="-6" cy="-4" rx="5" ry="9" transform="rotate(-25)" fill="#FB7185" />
              <ellipse cx="6" cy="-4" rx="5" ry="9" transform="rotate(25)" fill="#FB7185" />
              <ellipse cx="0" cy="-6" rx="5" ry="10" fill="#FDA4AF" />
            </g>
            <g transform="translate(132, 66)">
              <ellipse cx="0" cy="0" rx="10" ry="6" fill="#F43F5E" />
              <ellipse cx="-6" cy="-4" rx="5" ry="9" transform="rotate(-25)" fill="#FB7185" />
              <ellipse cx="6" cy="-4" rx="5" ry="9" transform="rotate(25)" fill="#FB7185" />
              <ellipse cx="0" cy="-6" rx="5" ry="10" fill="#FDA4AF" />
            </g>
            <circle cx="85" cy="81" r="4" fill="none" stroke="#FEF08A" strokeWidth="1.2" />
          </g>
        );
      case 'saraswati':
        return (
          <g>
            {/* Sacred Veena Held Diagonally */}
            <line x1="28" y1="126" x2="132" y2="54" stroke="#D97706" strokeWidth="7" strokeLinecap="round" />
            <line x1="28" y1="126" x2="132" y2="54" stroke="#FEF08A" strokeWidth="1.8" />
            <circle cx="40" cy="118" r="14" fill="#B45309" stroke="#FEF08A" strokeWidth="2" />
            <circle cx="124" cy="60" r="9" fill="#B45309" stroke="#FEF08A" strokeWidth="1.5" />
          </g>
        );
      case 'venkateswara':
      case 'vishnu':
      case 'dhanvantari':
        return (
          <g>
            {/* Sudarshana Chakra (Right) & Panchajanya Shanku (Left) */}
            <circle cx="132" cy="54" r="12" fill="none" stroke="#FEF08A" strokeWidth="3" strokeDasharray="4 2" />
            <circle cx="132" cy="54" r="5" fill="#F59E0B" />
            <path
              d="M28 42 C18 50, 20 64, 28 68 C36 64, 38 50, 28 42 Z"
              fill="#F8FAFC"
              stroke="#FEF08A"
              strokeWidth="1.5"
            />
          </g>
        );
      case 'murugan':
        return (
          <g>
            {/* Sacred Golden Vel Spear */}
            <line x1="130" y1="44" x2="130" y2="136" stroke={`url(#${goldId})`} strokeWidth="3.2" />
            <path
              d="M130 22 C118 36, 122 48, 130 52 C138 48, 142 36, 130 22 Z"
              fill={`url(#${goldId})`}
              stroke="#FEF08A"
              strokeWidth="1.5"
            />
            <line x1="125" y1="38" x2="135" y2="38" stroke="#DC2626" strokeWidth="2" />
          </g>
        );
      case 'surya':
        return (
          <g>
            {/* 16 Blazing Solar Rays Around Halo */}
            {Array.from({ length: 16 }).map((_, i) => (
              <line
                key={i}
                x1="80"
                y1="70"
                x2="80"
                y2="12"
                stroke="#FDE047"
                strokeWidth="2"
                strokeOpacity="0.55"
                transform={`rotate(${i * 22.5} 80 70)`}
              />
            ))}
          </g>
        );
      case 'sudarshana':
        return (
          <g>
            {/* Sacred Shatkona Hexagram Star Behind */}
            <polygon
              points="80,16 128,98 32,98"
              fill="none"
              stroke="#FEF08A"
              strokeWidth="2.2"
              strokeOpacity="0.65"
            />
            <polygon
              points="80,120 128,38 32,38"
              fill="none"
              stroke="#F97316"
              strokeWidth="2.2"
              strokeOpacity="0.65"
            />
          </g>
        );
      case 'parashurama':
        return (
          <g>
            {/* Golden Battle Axe (Parashu) */}
            <line x1="128" y1="36" x2="128" y2="136" stroke="#B45309" strokeWidth="4" />
            <path
              d="M128 42 C106 34, 104 64, 128 58 Z"
              fill="#E2E8F0"
              stroke="#FEF08A"
              strokeWidth="1.5"
            />
          </g>
        );
      case 'vamana':
        return (
          <g>
            {/* Traditional Palm-Leaf Parasol Umbrella */}
            <path
              d="M22 44 Q80 14 138 44 Z"
              fill="#D97706"
              fillOpacity="0.55"
              stroke="#FEF08A"
              strokeWidth="1.5"
            />
          </g>
        );
      default:
        return (
          <g>
            {/* Flanking Sacred Temple Deepams */}
            <circle cx="26" cy="60" r="5" fill="#FEF08A" opacity="0.8" />
            <circle cx="134" cy="60" r="5" fill="#FEF08A" opacity="0.8" />
          </g>
        );
    }
  };

  const renderSpecialVisageDetails = () => {
    if (deity.id === 'narasimha') {
      return (
        <g>
          {/* Blazing Lion Mane & Fierce Whiskers */}
          {Array.from({ length: 14 }).map((_, i) => (
            <ellipse
              key={i}
              cx="80"
              cy="40"
              rx="6"
              ry="14"
              fill="#D97706"
              stroke="#FEF08A"
              strokeWidth="0.8"
              transform={`rotate(${i * 25.7} 80 72)`}
            />
          ))}
        </g>
      );
    }
    if (deity.id === 'dattatreya' || deity.id === 'brahma') {
      return (
        <g>
          {/* Side Profile Faces of Trimurti / Chaturmukha */}
          <ellipse cx="52" cy="74" rx="14" ry="18" fill={deity.skinTone} stroke="#B45309" strokeWidth="1.5" opacity="0.9" />
          <ellipse cx="108" cy="74" rx="14" ry="18" fill={deity.skinTone} stroke="#B45309" strokeWidth="1.5" opacity="0.9" />
        </g>
      );
    }
    if (deity.id === 'garuda') {
      return (
        <g>
          {/* Golden Wings Flanking */}
          <path d="M48 76 C14 52, 12 96, 44 108 Z" fill="#F59E0B" stroke="#FEF08A" strokeWidth="1.5" />
          <path d="M112 76 C146 52, 148 96, 116 108 Z" fill="#F59E0B" stroke="#FEF08A" strokeWidth="1.5" />
        </g>
      );
    }
    if (deity.id === 'nandi') {
      return (
        <g>
          {/* Sacred Curved Bull Horns with Gold Tips */}
          <path d="M56 52 C40 32, 46 20, 56 26" fill="none" stroke="#FEF08A" strokeWidth="4.5" strokeLinecap="round" />
          <path d="M104 52 C120 32, 114 20, 104 26" fill="none" stroke="#FEF08A" strokeWidth="4.5" strokeLinecap="round" />
        </g>
      );
    }
    if (deity.id === 'varaha') {
      return (
        <g>
          {/* Sacred White Tusks Lifting Bhudevi (Earth) */}
          <path d="M62 84 C52 72, 56 58, 66 64" fill="none" stroke="#F8FAFC" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M98 84 C108 72, 104 58, 94 64" fill="none" stroke="#F8FAFC" strokeWidth="3.5" strokeLinecap="round" />
          <circle cx="80" cy="48" r="8" fill="#10B981" stroke="#38BDF8" strokeWidth="1.5" />
        </g>
      );
    }
    return null;
  };

  return (
    <svg
      viewBox="0 0 160 160"
      className={`w-full h-full select-none ${className}`}
      aria-label={`${deity.nameTe} - ${deity.nameEn}`}
    >
      <defs>
        <radialGradient id={gradId} cx="50%" cy="45%" r="65%">
          <stop offset="0%" stopColor={deity.bgGradient[0]} />
          <stop offset="100%" stopColor={deity.bgGradient[1]} />
        </radialGradient>
        <radialGradient id={haloId} cx="50%" cy="44%" r="40%">
          <stop offset="0%" stopColor={deity.auraColor} stopOpacity="0.65" />
          <stop offset="60%" stopColor={deity.auraColor} stopOpacity="0.2" />
          <stop offset="100%" stopColor={deity.auraColor} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={goldId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>
      </defs>

      {/* Rich Sanctum Background */}
      <rect width="160" height="160" rx="12" fill={`url(#${gradId})`} />

      {/* Tanjore Gold Frame & Arch (Prabhavali) */}
      <rect
        x="5"
        y="5"
        width="150"
        height="150"
        rx="9"
        fill="none"
        stroke={`url(#${goldId})`}
        strokeWidth="1.8"
        strokeOpacity="0.65"
      />
      <path
        d="M14 146 L14 62 A66 66 0 0 1 146 62 L146 146"
        fill="none"
        stroke={`url(#${goldId})`}
        strokeWidth="1.2"
        strokeOpacity="0.35"
        strokeDasharray="3 2"
      />

      {/* Glowing Divine Prabhamandala Halo */}
      <circle cx="80" cy="68" r="52" fill={`url(#${haloId})`} />
      <circle
        cx="80"
        cy="68"
        r="38"
        fill="none"
        stroke={`url(#${goldId})`}
        strokeWidth="1.2"
        strokeOpacity="0.55"
        strokeDasharray="4 3"
      />

      {/* Deity Specific Weapons / Back Attributes */}
      {renderWeaponOrAttribute()}
      {renderSpecialVisageDetails()}

      {/* Divine Shoulders & Silk Pitambara / Garland */}
      <path
        d="M36 146 C38 114, 56 104, 80 104 C104 104, 122 114, 124 146 Z"
        fill={deity.accentColor}
        fillOpacity="0.85"
        stroke={`url(#${goldId})`}
        strokeWidth="2"
      />
      {/* Vaijayanti / Temple Garland */}
      <path
        d="M54 108 Q80 136 106 108"
        fill="none"
        stroke="#FEF08A"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray="2 4"
      />
      <path
        d="M60 106 Q80 126 100 106"
        fill="none"
        stroke="#EF4444"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Golden Makara Kundala Earrings */}
      <circle cx="52" cy="79" r="6.5" fill={`url(#${goldId})`} stroke="#FEF08A" strokeWidth="1.2" />
      <circle cx="52" cy="79" r="2.2" fill="#EF4444" />
      <circle cx="108" cy="79" r="6.5" fill={`url(#${goldId})`} stroke="#FEF08A" strokeWidth="1.2" />
      <circle cx="108" cy="79" r="2.2" fill="#EF4444" />

      {/* Sacred Face Contour */}
      <path
        d="M56 64 C56 46, 104 46, 104 64 C104 86, 93 98, 80 98 C67 98, 56 86, 56 64 Z"
        fill={deity.skinTone}
        stroke={`url(#${goldId})`}
        strokeWidth="1.6"
      />

      {/* Ornate Tanjore Kirita Makuta (Gold Crown) */}
      <path
        d="M53 56 L58 34 L70 42 L80 20 L90 42 L102 34 L107 56 Z"
        fill={`url(#${goldId})`}
        stroke="#FEF08A"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <rect x="52" y="52" width="56" height="6.5" rx="3" fill={`url(#${goldId})`} stroke="#FEF08A" strokeWidth="1" />
      {/* Crown Jewels */}
      <circle cx="80" cy="44" r="3.5" fill="#EF4444" stroke="#FEF08A" strokeWidth="0.8" />
      <circle cx="67" cy="48" r="2.2" fill="#10B981" />
      <circle cx="93" cy="48" r="2.2" fill="#10B981" />
      <circle cx="80" cy="20" r="3" fill="#FEF08A" />

      {/* Expressive Lotus Eyes & Eyebrows */}
      <path d="M63 68 Q69 65 75 68" stroke="#1E1B4B" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M85 68 Q91 65 97 68" stroke="#1E1B4B" strokeWidth="1.6" fill="none" strokeLinecap="round" />

      <ellipse cx="69" cy="72" rx="5.2" ry="2.7" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.1" />
      <circle cx="69" cy="72" r="2.1" fill="#0F172A" />
      <circle cx="68.3" cy="71.3" r="0.7" fill="#FFFFFF" />

      <ellipse cx="91" cy="72" rx="5.2" ry="2.7" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.1" />
      <circle cx="91" cy="72" r="2.1" fill="#0F172A" />
      <circle cx="90.3" cy="71.3" r="0.7" fill="#FFFFFF" />

      {/* Forehead Tilak / Namam / Tripundra */}
      {renderTilak()}

      {/* Nose & Serene Divine Smile (for non-Ganesha) */}
      {deity.id !== 'ganesha' && (
        <g>
          <path d="M80 71 L78.5 80 L82 81" stroke="#334155" strokeWidth="1.3" fill="none" strokeLinecap="round" />
          <path
            d="M73 86 Q80 91 87 86"
            stroke="#991B1B"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        </g>
      )}

      {/* Sacred Emblem Ribbon at Bottom of Portrait */}
      <rect
        x="18"
        y="134"
        width="124"
        height="18"
        rx="9"
        fill="#120906"
        fillOpacity="0.88"
        stroke={`url(#${goldId})`}
        strokeWidth="1"
      />
      <text
        x="80"
        y="146.5"
        textAnchor="middle"
        fill="#FDE68A"
        fontSize="10"
        fontWeight="700"
      >
        {localizedName}
      </text>
    </svg>
  );
};
