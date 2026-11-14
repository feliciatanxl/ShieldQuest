import React from 'react';
import { Guardian } from '@shieldquest/shared';

interface GuardianCardProps {
  guardian: Guardian;
  isDetailed?: boolean;
}

// Character concept portraits with expressive silhouettes, facial features, and gear
export const GuardianCharacterPortrait: React.FC<{ guardianId: string; color: string; accentColor: string }> = ({
  guardianId,
  color,
  accentColor,
}) => {
  switch (guardianId) {
    case 'verifox':
      return (
        /* VeriFox: Sleek, clever fox investigator with magnifying eyepiece and inquisitive expression */
        <svg viewBox="0 0 160 160" className="w-full h-full" fill="none" aria-hidden="true">
          <defs>
            <radialGradient id="foxGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={color} stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0B132B" stopOpacity="0" />
            </radialGradient>
          </defs>
          {/* Ambient character aura */}
          <circle cx="80" cy="80" r="70" fill="url(#foxGlow)" />
          {/* Fox Ears */}
          <polygon points="40,24 68,68 28,68" fill={color} />
          <polygon points="120,24 132,68 92,68" fill={color} />
          <polygon points="44,32 64,62 34,62" fill="#F7F5EF" />
          <polygon points="116,32 126,62 96,62" fill="#F7F5EF" />
          {/* Main Fox Head */}
          <path d="M30 68 C30 110 55 136 80 142 C105 136 130 110 130 68 C130 55 105 50 80 50 C55 50 30 55 30 68 Z" fill={color} />
          {/* White muzzle & cheeks */}
          <path d="M42 85 C42 120 62 136 80 140 C98 136 118 120 118 85 C105 98 92 100 80 100 C68 100 55 98 42 85 Z" fill="#F7F5EF" />
          {/* Alert Eyes */}
          <ellipse cx="60" cy="82" rx="6" ry="8" fill="#101B3A" />
          <circle cx="58" cy="80" r="2.5" fill="#FFFFFF" />
          {/* Investigative Monocle / Optical HUD on Right Eye */}
          <circle cx="98" cy="82" r="14" stroke="#38D9E6" strokeWidth="3" fill="#101B3A" fillOpacity="0.7" />
          <circle cx="98" cy="82" r="8" stroke={accentColor} strokeWidth="1.5" strokeDasharray="3 2" />
          <circle cx="98" cy="82" r="3.5" fill="#38D9E6" />
          <line x1="108" y1="92" x2="118" y2="102" stroke="#38D9E6" strokeWidth="3" strokeLinecap="round" />
          {/* Fox Nose & Confident Smile */}
          <polygon points="80,105 74,98 86,98" fill="#101B3A" />
          <path d="M74 112 Q80 117 86 112" stroke="#101B3A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          {/* Verification Badge Pin */}
          <polygon points="80,132 86,138 80,144 74,138" fill="#FDE047" stroke="#101B3A" strokeWidth="1" />
        </svg>
      );

    case 'echo':
      return (
        /* Echo: Empathetic, wise owl companion with soundwave crown and warm resonance rings */
        <svg viewBox="0 0 160 160" className="w-full h-full" fill="none" aria-hidden="true">
          <defs>
            <radialGradient id="echoGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={color} stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0B132B" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="80" cy="80" r="70" fill="url(#echoGlow)" />
          {/* Resonance wave antennas */}
          <path d="M30 40 Q45 25 60 40" stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M100 40 Q115 25 130 40" stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M22 30 Q45 12 70 30" stroke={accentColor} strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 3" fill="none" opacity="0.7" />
          <path d="M90 30 Q115 12 138 30" stroke={accentColor} strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 3" fill="none" opacity="0.7" />
          {/* Owl Feathered Tuft Ears */}
          <polygon points="46,36 68,65 35,65" fill={color} />
          <polygon points="114,36 125,65 92,65" fill={color} />
          {/* Head & Body */}
          <circle cx="80" cy="88" r="48" fill={color} />
          {/* Face Discs */}
          <circle cx="62" cy="84" r="20" fill="#F7F5EF" />
          <circle cx="98" cy="84" r="20" fill="#F7F5EF" />
          {/* Empathetic Large Eyes with Purple Radiance */}
          <circle cx="62" cy="84" r="10" fill="#101B3A" />
          <circle cx="98" cy="84" r="10" fill="#101B3A" />
          <circle cx="60" cy="82" r="3.5" fill="#A78BFA" />
          <circle cx="96" cy="82" r="3.5" fill="#A78BFA" />
          <circle cx="63" cy="85" r="1.5" fill="#FFFFFF" />
          <circle cx="99" cy="85" r="1.5" fill="#FFFFFF" />
          {/* Heart-Shaped Beak */}
          <polygon points="80,98 75,88 85,88" fill="#FDE047" />
          {/* Speech Ripple Mark */}
          <circle cx="80" cy="120" r="4" fill="#38D9E6" />
          <circle cx="80" cy="120" r="9" stroke="#38D9E6" strokeWidth="1.5" fill="none" opacity="0.6" strokeDasharray="2 2" />
        </svg>
      );

    case 'beacon':
      return (
        /* Beacon: High-tech sentinel falcon lookout with optical prism lens and reporting antennae */
        <svg viewBox="0 0 160 160" className="w-full h-full" fill="none" aria-hidden="true">
          <defs>
            <radialGradient id="beaconGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={color} stopOpacity="0.45" />
              <stop offset="100%" stopColor="#0B132B" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="80" cy="80" r="70" fill="url(#beaconGlow)" />
          {/* Signal projection rays */}
          <polygon points="80,45 25,15 35,45" fill="#38D9E6" fillOpacity="0.25" />
          <polygon points="80,45 135,15 125,45" fill="#38D9E6" fillOpacity="0.25" />
          {/* Sentinel Crest / Crown */}
          <polygon points="80,24 64,55 96,55" fill={accentColor} />
          {/* Main Helmet / Bird Head */}
          <path d="M42 62 C42 45 60 40 80 40 C100 40 118 45 118 62 C118 95 102 120 80 135 C58 120 42 95 42 62 Z" fill="#101B3A" stroke={color} strokeWidth="2.5" />
          {/* Visor Wing Plates */}
          <path d="M42 65 L65 78 L55 95 Z" fill={color} />
          <path d="M118 65 L95 78 L105 95 Z" fill={color} />
          {/* Central Prismatic Searchlight Eye */}
          <circle cx="80" cy="78" r="16" fill="#0D1A33" stroke="#FDE047" strokeWidth="2" />
          <circle cx="80" cy="78" r="9" fill="#38D9E6" />
          <polygon points="80,72 85,78 80,84 75,78" fill="#FFFFFF" />
          {/* Sharp Sentinel Beak */}
          <polygon points="80,108 72,92 88,92" fill="#F59E0B" stroke="#101B3A" strokeWidth="1" />
          {/* Emergency Signal Crest */}
          <rect x="74" y="118" width="12" height="6" rx="2" fill="#38D9E6" />
        </svg>
      );

    case 'shieldfin':
      return (
        /* Shieldfin: Resolute, courageous dolphin/orca defender with wave shield crest */
        <svg viewBox="0 0 160 160" className="w-full h-full" fill="none" aria-hidden="true">
          <defs>
            <radialGradient id="shieldGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={color} stopOpacity="0.45" />
              <stop offset="100%" stopColor="#0B132B" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="80" cy="80" r="70" fill="url(#shieldGlow)" />
          {/* Wave Crest Shield Silhouette */}
          <path
            d="M80 20 C48 20 36 42 36 75 C36 108 58 128 80 142 C102 128 124 108 124 75 C124 42 112 20 80 20 Z"
            fill={color}
            stroke="#60A5FA"
            strokeWidth="2.5"
          />
          {/* Inner Armor Plate */}
          <path
            d="M80 32 C56 32 48 50 48 76 C48 100 64 116 80 126 C96 116 112 100 112 76 C112 50 104 32 80 32 Z"
            fill="#101B3A"
          />
          {/* Dolphin Dorsal Fin Apex */}
          <path d="M80 32 Q95 48 88 62 Q78 52 80 32" fill="#38D9E6" />
          {/* Friendly Determined Gaze */}
          <ellipse cx="62" cy="74" rx="5" ry="7" fill="#60A5FA" />
          <circle cx="61" cy="72" r="2" fill="#FFFFFF" />
          <ellipse cx="98" cy="74" rx="5" ry="7" fill="#60A5FA" />
          <circle cx="97" cy="72" r="2" fill="#FFFFFF" />
          {/* Supportive Smile */}
          <path d="M72 90 Q80 96 88 90" stroke="#F7F5EF" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          {/* Peer Shield Medallion */}
          <polygon points="80,102 87,110 80,118 73,110" fill="#FDE047" stroke="#101B3A" strokeWidth="1" />
        </svg>
      );

    case 'cluepaw':
      return (
        /* Cluepaw: Stealthy, observant lynx tracker with keen perceptive eyes and magnifying paw */
        <svg viewBox="0 0 160 160" className="w-full h-full" fill="none" aria-hidden="true">
          <defs>
            <radialGradient id="clueGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={color} stopOpacity="0.45" />
              <stop offset="100%" stopColor="#0B132B" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="80" cy="80" r="70" fill="url(#clueGlow)" />
          {/* Lynx Tufted Ears */}
          <polygon points="42,22 68,65 30,65" fill={color} />
          <polygon points="118,22 130,65 92,65" fill={color} />
          {/* Ear tuft whiskers */}
          <line x1="42" y1="22" x2="38" y2="12" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="118" y1="22" x2="122" y2="12" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />
          {/* Main Lynx Head */}
          <circle cx="80" cy="86" r="46" fill={color} />
          <path d="M48 85 C48 116 66 128 80 130 C94 128 112 116 112 85 C100 95 90 98 80 98 C70 98 60 95 48 85 Z" fill="#F7F5EF" />
          {/* Keen Perceptive Green Eyes */}
          <ellipse cx="62" cy="78" rx="7" ry="9" fill="#064E3B" stroke="#34D399" strokeWidth="2" />
          <ellipse cx="62" cy="78" rx="3" ry="7" fill="#10B981" />
          <circle cx="60" cy="75" r="2" fill="#FFFFFF" />

          <ellipse cx="98" cy="78" rx="7" ry="9" fill="#064E3B" stroke="#34D399" strokeWidth="2" />
          <ellipse cx="98" cy="78" rx="3" ry="7" fill="#10B981" />
          <circle cx="96" cy="75" r="2" fill="#FFFFFF" />
          {/* Sleek Feline Nose */}
          <polygon points="80,95 75,88 85,88" fill="#101B3A" />
          {/* Whiskers */}
          <line x1="44" y1="96" x2="28" y2="94" stroke="#A7F3D0" strokeWidth="1.5" />
          <line x1="44" y1="102" x2="28" y2="105" stroke="#A7F3D0" strokeWidth="1.5" />
          <line x1="116" y1="96" x2="132" y2="94" stroke="#A7F3D0" strokeWidth="1.5" />
          <line x1="116" y1="102" x2="132" y2="105" stroke="#A7F3D0" strokeWidth="1.5" />
          {/* Magnifier Clue Pendant */}
          <circle cx="80" cy="120" r="8" fill="#101B3A" stroke="#FDE047" strokeWidth="2" />
          <circle cx="80" cy="120" r="4" fill="#34D399" />
          <line x1="86" y1="126" x2="92" y2="132" stroke="#FDE047" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'bytebuddy':
      return (
        /* ByteBuddy: Friendly companion droid with glowing holographic screen face and lock crest */
        <svg viewBox="0 0 160 160" className="w-full h-full" fill="none" aria-hidden="true">
          <defs>
            <radialGradient id="byteGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={color} stopOpacity="0.45" />
              <stop offset="100%" stopColor="#0B132B" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="80" cy="80" r="70" fill="url(#byteGlow)" />
          {/* Antenna with Security Key */}
          <line x1="80" y1="40" x2="80" y2="22" stroke={color} strokeWidth="3" />
          <circle cx="80" cy="20" r="6" fill="#F472B6" />
          <circle cx="80" cy="20" r="2.5" fill="#FFFFFF" />
          {/* Robot Head Body */}
          <rect x="36" y="38" width="88" height="82" rx="18" fill="#101B3A" stroke={color} strokeWidth="3" />
          {/* Side Headphone Jacks / Access ports */}
          <rect x="26" y="60" width="10" height="28" rx="4" fill={accentColor} />
          <rect x="124" y="60" width="10" height="28" rx="4" fill={accentColor} />
          {/* Glass Visor Screen */}
          <rect x="46" y="48" width="68" height="48" rx="10" fill="#070C1A" stroke="#38D9E6" strokeWidth="1.5" />
          {/* Expressive Pixel Eyes */}
          <circle cx="62" cy="70" r="7" fill="#38D9E6" />
          <circle cx="98" cy="70" r="7" fill="#38D9E6" />
          <circle cx="60" cy="68" r="2.5" fill="#FFFFFF" />
          <circle cx="96" cy="68" r="2.5" fill="#FFFFFF" />
          {/* Pixel Smile */}
          <path d="M72 82 Q80 88 88 82" stroke="#38D9E6" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          {/* Security Padlock / Hygiene Token */}
          <rect x="73" y="102" width="14" height="12" rx="3" fill="#FDE047" stroke="#101B3A" strokeWidth="1" />
          <path d="M76 102 V98 A4 4 0 0 1 84 98 V102" stroke="#FDE047" strokeWidth="2" fill="none" />
        </svg>
      );

    default:
      return null;
  }
};

export const GuardianCard: React.FC<GuardianCardProps> = ({ guardian }) => {
  return (
    <div
      className="game-panel-interactive p-6 flex flex-col justify-between group relative overflow-hidden transition-all duration-300"
      style={{
        borderTop: `4px solid ${guardian.color}`,
      }}
    >
      {/* Background ambient gradient glow */}
      <div
        className="absolute -top-16 -right-16 w-36 h-36 rounded-full blur-3xl opacity-20 transition-opacity duration-300 group-hover:opacity-40 pointer-events-none"
        style={{ backgroundColor: guardian.color }}
      />

      <div>
        {/* Character Portrait Showcase */}
        <div className="w-full aspect-[4/3] max-w-[170px] mx-auto my-2 relative flex items-center justify-center rounded-2xl bg-gradient-to-b from-shield-surface/60 to-shield-void/80 border border-shield-cardBorder/70 p-2 shadow-inner group-hover:scale-105 transition-transform duration-300">
          <GuardianCharacterPortrait
            guardianId={guardian.id}
            color={guardian.color}
            accentColor={guardian.accentColor}
          />
        </div>

        {/* Guardian Name & Associated Protective Skill */}
        <div className="my-3 text-center sm:text-left">
          <h3 className="text-2xl font-heading font-black text-shield-cream group-hover:text-shield-cyan transition-colors">
            {guardian.name}
          </h3>
          <span
            className="inline-block text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded border mt-1"
            style={{
              backgroundColor: `${guardian.color}18`,
              color: guardian.accentColor,
              borderColor: `${guardian.color}40`,
            }}
          >
            Skill: {guardian.discipline}
          </span>
        </div>

        {/* One short description */}
        <p className="text-xs sm:text-sm text-shield-cream/90 leading-relaxed">
          {guardian.role}
        </p>
      </div>
    </div>
  );
};
