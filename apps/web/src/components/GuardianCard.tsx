import React from 'react';
import { Quote } from 'lucide-react';
import { Guardian } from '@shieldquest/shared';

interface GuardianCardProps {
  guardian: Guardian;
  isDetailed?: boolean;
}

// Bespoke stylized SVG mascot badges for the Guardians
const GuardianMascotEmblem: React.FC<{ guardianId: string; color: string }> = ({
  guardianId,
  color,
}) => {
  switch (guardianId) {
    case 'verifox':
      return (
        <svg viewBox="0 0 100 100" className="w-20 h-20" fill="none" aria-hidden="true">
          <circle cx="50" cy="50" r="46" fill="#101B3A" stroke={color} strokeWidth="2.5" />
          {/* Fox Ears */}
          <polygon points="30,22 45,45 22,45" fill={color} fillOpacity="0.85" />
          <polygon points="70,22 78,45 55,45" fill={color} fillOpacity="0.85" />
          <polygon points="33,28 42,42 27,42" fill="#F7F5EF" fillOpacity="0.9" />
          <polygon points="67,28 73,42 58,42" fill="#F7F5EF" fillOpacity="0.9" />
          {/* Fox Face Shield */}
          <polygon points="50,78 20,44 80,44" fill={color} fillOpacity="0.95" />
          <polygon points="50,78 35,44 65,44" fill="#F7F5EF" />
          {/* Magnifier / Verification eye */}
          <circle cx="50" cy="48" r="9" stroke="#101B3A" strokeWidth="3" fill="#38D9E6" />
          <line x1="57" y1="55" x2="65" y2="63" stroke="#101B3A" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );
    case 'echo':
      return (
        <svg viewBox="0 0 100 100" className="w-20 h-20" fill="none" aria-hidden="true">
          <circle cx="50" cy="50" r="46" fill="#101B3A" stroke={color} strokeWidth="2.5" />
          {/* Resonating soundwaves */}
          <circle cx="50" cy="50" r="34" stroke={color} strokeWidth="1.5" strokeDasharray="6 4" strokeOpacity="0.5" />
          <circle cx="50" cy="50" r="26" stroke={color} strokeWidth="2" strokeOpacity="0.75" />
          {/* Conversational speech nodes */}
          <path d="M38 42 C38 34 62 34 62 42 C62 48 55 52 50 56 L50 62" stroke="#F7F5EF" strokeWidth="3.5" strokeLinecap="round" />
          <circle cx="50" cy="72" r="2.5" fill="#F7F5EF" />
          <circle cx="34" cy="50" r="4" fill={color} />
          <circle cx="66" cy="50" r="4" fill={color} />
        </svg>
      );
    case 'beacon':
      return (
        <svg viewBox="0 0 100 100" className="w-20 h-20" fill="none" aria-hidden="true">
          <circle cx="50" cy="50" r="46" fill="#101B3A" stroke={color} strokeWidth="2.5" />
          {/* Lighthouse / Tower structure */}
          <polygon points="50,22 42,75 58,75" fill={color} fillOpacity="0.9" />
          {/* Light projection beams */}
          <polygon points="50,30 20,15 25,40" fill="#38D9E6" fillOpacity="0.4" />
          <polygon points="50,30 80,15 75,40" fill="#38D9E6" fillOpacity="0.4" />
          {/* Beacon light core */}
          <circle cx="50" cy="30" r="6" fill="#F7F5EF" />
          <circle cx="50" cy="30" r="12" stroke="#38D9E6" strokeWidth="1.5" strokeOpacity="0.6" />
        </svg>
      );
    case 'shieldfin':
      return (
        <svg viewBox="0 0 100 100" className="w-20 h-20" fill="none" aria-hidden="true">
          <circle cx="50" cy="50" r="46" fill="#101B3A" stroke={color} strokeWidth="2.5" />
          {/* Dolphin / Fin Protective Crest */}
          <path
            d="M50 18 C32 18 24 35 24 55 C24 72 38 82 50 85 C62 82 76 72 76 55 C76 35 68 18 50 18 Z"
            fill={color}
            fillOpacity="0.85"
          />
          {/* Inner Protective Core */}
          <path
            d="M50 26 C38 26 32 38 32 54 C32 66 42 74 50 77 C58 74 68 66 68 54 C68 38 62 26 50 26 Z"
            fill="#101B3A"
          />
          {/* Wave fin crest */}
          <path d="M42 45 Q50 35 58 45 Q50 55 42 45" fill="#38D9E6" />
          <circle cx="50" cy="62" r="3" fill="#F7F5EF" />
        </svg>
      );
    case 'cluepaw':
      return (
        <svg viewBox="0 0 100 100" className="w-20 h-20" fill="none" aria-hidden="true">
          <circle cx="50" cy="50" r="46" fill="#101B3A" stroke={color} strokeWidth="2.5" />
          {/* Paw Prints with Analytical Geometry */}
          <ellipse cx="38" cy="35" rx="5" ry="7" fill={color} />
          <ellipse cx="62" cy="35" rx="5" ry="7" fill={color} />
          <ellipse cx="26" cy="48" rx="4.5" ry="6" fill={color} />
          <ellipse cx="74" cy="48" rx="4.5" ry="6" fill={color} />
          {/* Main investigative palm */}
          <path
            d="M50 48 C38 48 34 60 38 72 C42 78 58 78 62 72 C66 60 62 48 50 48 Z"
            fill={color}
            fillOpacity="0.9"
          />
          {/* Magnifier lens on the clue */}
          <circle cx="50" cy="63" r="5" fill="#101B3A" />
          <circle cx="50" cy="63" r="2.5" fill="#34D399" />
        </svg>
      );
    case 'bytebuddy':
      return (
        <svg viewBox="0 0 100 100" className="w-20 h-20" fill="none" aria-hidden="true">
          <circle cx="50" cy="50" r="46" fill="#101B3A" stroke={color} strokeWidth="2.5" />
          {/* Microchip Guardian Head */}
          <rect x="28" y="28" width="44" height="44" rx="10" fill={color} fillOpacity="0.85" />
          {/* Chip Contacts */}
          <line x1="20" y1="40" x2="28" y2="40" stroke={color} strokeWidth="3" />
          <line x1="20" y1="60" x2="28" y2="60" stroke={color} strokeWidth="3" />
          <line x1="72" y1="40" x2="80" y2="40" stroke={color} strokeWidth="3" />
          <line x1="72" y1="60" x2="80" y2="60" stroke={color} strokeWidth="3" />
          <line x1="40" y1="20" x2="40" y2="28" stroke={color} strokeWidth="3" />
          <line x1="60" y1="20" x2="60" y2="28" stroke={color} strokeWidth="3" />
          <line x1="40" y1="72" x2="40" y2="80" stroke={color} strokeWidth="3" />
          <line x1="60" y1="72" x2="60" y2="80" stroke={color} strokeWidth="3" />
          {/* Digital Screen & Binary Eyes */}
          <rect x="34" y="34" width="32" height="32" rx="6" fill="#101B3A" />
          <circle cx="44" cy="48" r="3.5" fill="#38D9E6" />
          <circle cx="56" cy="48" r="3.5" fill="#38D9E6" />
          <path d="M44 58 Q50 62 56 58" stroke="#38D9E6" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
};

export const GuardianCard: React.FC<GuardianCardProps> = ({ guardian, isDetailed = false }) => {
  return (
    <div
      className="game-panel-interactive p-6 flex flex-col justify-between group relative overflow-hidden"
      style={{
        borderTop: `3px solid ${guardian.color}`,
      }}
    >
      {/* Background ambient gradient glow */}
      <div
        className="absolute -top-16 -right-16 w-36 h-36 rounded-full blur-3xl opacity-20 transition-opacity duration-300 group-hover:opacity-40 pointer-events-none"
        style={{ backgroundColor: guardian.color }}
      />

      <div>
        {/* Header: Mascot Crest & Badge */}
        <div className="flex items-center justify-between gap-4 mb-5">
          <div className="p-1 rounded-2xl bg-shield-dark/60 border border-shield-cardBorder/60 group-hover:scale-105 transition-transform duration-300">
            <GuardianMascotEmblem guardianId={guardian.id} color={guardian.color} />
          </div>

          <div className="text-right">
            <span
              className="inline-block text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border mb-1"
              style={{
                backgroundColor: `${guardian.color}15`,
                color: guardian.color,
                borderColor: `${guardian.color}40`,
              }}
            >
              {guardian.badge}
            </span>
            <div className="text-xs text-shield-muted font-mono">{guardian.discipline}</div>
          </div>
        </div>

        {/* Guardian Name & Role */}
        <div className="mb-4">
          <h3 className="text-2xl font-heading font-extrabold text-white mb-1 group-hover:text-shield-cyan transition-colors">
            {guardian.name}
          </h3>
          <p className="text-xs font-semibold uppercase tracking-wider text-shield-muted">
            Discipline: <span className="text-shield-cream">{guardian.discipline}</span>
          </p>
        </div>

        {/* In-Game Role & Behaviour */}
        <p className="text-sm text-shield-cream/90 leading-relaxed mb-4">
          {guardian.role}
        </p>

        {isDetailed && (
          <p className="text-xs text-shield-muted leading-relaxed mb-5 pt-3 border-t border-shield-cardBorder/40">
            {guardian.description}
          </p>
        )}

        {/* Reinforced Behaviour Box */}
        <div className="p-3.5 rounded-xl bg-shield-navy/70 border border-shield-cardBorder/70 text-xs text-shield-cream mb-5">
          <span className="font-semibold text-shield-gold block mb-1">
            Protective Habit Instilled:
          </span>
          <p className="leading-snug">{guardian.reinforcedBehaviour}</p>
        </div>
      </div>

      {/* Quote / Motto */}
      <div className="pt-4 border-t border-shield-cardBorder/50 flex items-start gap-2 text-xs italic text-shield-muted">
        <Quote className="w-4 h-4 flex-shrink-0 text-shield-cyan mt-0.5 opacity-70" />
        <p>"{guardian.quote}"</p>
      </div>
    </div>
  );
};
