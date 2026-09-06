import { Check, LockKeyhole } from 'lucide-react';
import { useSessionStore } from '../../stores/sessionStore';
import type { GuardianId } from '../../../types';

export const guardians: {
  id: GuardianId;
  name: string;
  animal: string;
  skill: string;
  color: string;
}[] = [
  { id: 'verifox', name: 'VeriFox', animal: '🦊', skill: 'Check your sources', color: '#ffe6be' },
  { id: 'echo', name: 'Echo', animal: '🐰', skill: 'Lead with empathy', color: '#f6dce4' },
  { id: 'beacon', name: 'Beacon', animal: '🦉', skill: 'Speak up for others', color: '#e9e3bc' },
  {
    id: 'shieldfin',
    name: 'Shieldfin',
    animal: '🐬',
    skill: 'Protect your boundaries',
    color: '#d4e9ed',
  },
  {
    id: 'cluepaw',
    name: 'Cluepaw',
    animal: '🐻',
    skill: 'Spot the warning signs',
    color: '#e6dcca',
  },
  {
    id: 'bytebuddy',
    name: 'ByteBuddy',
    animal: '🤖',
    skill: 'Build digital confidence',
    color: '#e0def5',
  },
];

export function Guardians({ compact = false }: { compact?: boolean }) {
  const earned = useSessionStore((state) => state.guardians);
  return (
    <div className={compact ? 'guardian-mini-grid' : 'guardian-grid'}>
      {guardians.map((guardian) => (
        <div
          className={`guardian-card ${earned.includes(guardian.id) ? 'earned' : ''}`}
          key={guardian.id}
        >
          <div className="guardian-avatar" style={{ background: guardian.color }}>
            <span aria-hidden="true">{guardian.animal}</span>
            <span className="guardian-lock">
              {earned.includes(guardian.id) ? <Check size={12} /> : <LockKeyhole size={11} />}
            </span>
          </div>
          <strong>{guardian.name}</strong>
          {!compact && (
            <>
              <p>{guardian.skill}</p>
              <span className="small-label">
                {earned.includes(guardian.id) ? 'Collected in preview' : 'Waiting to be discovered'}
              </span>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
