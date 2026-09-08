import { Clock, Eye, HandHeart, Scale, Shield, Zap } from 'lucide-react';
import type { ComponentType } from 'react';
import {
  COMPETENCY_LABEL,
  COMPETENCY_LETTER,
  COMPETENCY_ORDER,
  type Competency,
} from '../../types/guardians';

/**
 * The S.H.I.E.L.D. Behavioural Framework — one canonical definition.
 *
 * This is the spine of the whole product: the proposal commits to "one
 * transferable decision-making process" reinforced by every scenario, and the
 * six competencies are what the pilot's pre/post assessments actually measure.
 * So the public site, the player's Skills page, and the facilitator portal's
 * skill-coverage report must all describe them identically — a participant who
 * reads "Spot the Risk" on the landing page and "SPOT the Risk" in the app is
 * being shown two different frameworks.
 *
 * Before consolidation, `SkillsPage.tsx` carried its own copy of this list with
 * different wording and a per-item palette (`orange-50`, `rose-50`,
 * `indigo-50`, `cyan-50`…) that existed nowhere else in the design system.
 *
 * Labels and letters come from `types/guardians.ts`, which the game engine and
 * assessment scoring already treat as authoritative. Do not restate them here.
 */

export interface ShieldCompetency {
  competency: Competency;
  /** Single letter for the S.H.I.E.L.D. acronym. */
  letter: string;
  /** Canonical label, e.g. "Spot the Risk". */
  label: string;
  /** The Guardian that represents this skill in play (proposal §3.2). */
  guardian: string;
  /** What the Guardian actually does when used. */
  guardianAbility: string;
  /** Short focus line for cards and coverage reports. */
  focus: string;
  /** Plain-language explanation, written for a 14-year-old reader. */
  meaning: string;
  /** How the skill is practised in missions. */
  practice: string;
  icon: ComponentType<{ className?: string }>;
}

const DETAIL: Record<
  Competency,
  Omit<ShieldCompetency, 'competency' | 'letter' | 'label'>
> = {
  SPOT: {
    guardian: 'VeriFox',
    guardianAbility: 'Checks a claim against trusted information.',
    focus: 'Verification & threat detection',
    meaning:
      'Notice the signals that a situation is not what it appears to be — artificial urgency, easy money, or a request for your bank login.',
    practice: 'Phishing analysis, impersonation detection, suspicious-listing checks.',
    icon: Eye,
  },
  HOLD: {
    guardian: 'Echo',
    guardianAbility: "Invites a teammate's explanation.",
    focus: 'Consultation & deliberate delay',
    meaning:
      'Put time between the pressure and your decision. A genuine opportunity still stands up after a pause.',
    practice: 'Resisting countdowns, asking for a second opinion, stepping away.',
    icon: Clock,
  },
  IDENTIFY: {
    guardian: 'Cluepaw',
    guardianAbility: 'Reveals one overlooked clue.',
    focus: 'Situational & social awareness',
    meaning:
      'Work out who is pushing the choice and what they stand to gain from it.',
    practice: 'Reading social engineering, fake authority, and peer manipulation.',
    icon: Zap,
  },
  EVALUATE: {
    guardian: 'ByteBuddy',
    guardianAbility: 'Highlights unsafe links, permissions, or data requests.',
    focus: 'Cyber hygiene & long-term cost',
    meaning:
      'Follow the choice past the moment you make it. What does it cost in three days, three months, or on a permanent record?',
    practice: 'Money-mule legal exposure, credential leakage, account restrictions.',
    icon: Scale,
  },
  LEAD: {
    guardian: 'Beacon',
    guardianAbility: 'Identifies a safe reporting channel.',
    focus: 'Safe reporting & trusted guidance',
    meaning:
      'Make the choice that holds up to scrutiny, and know how to raise it through a channel you trust.',
    practice: 'Reporting routes, speaking to a trusted adult, taking accountability.',
    icon: Shield,
  },
  DEFEND: {
    guardian: 'Shieldfin',
    guardianAbility: 'Protects another player from a pressure event.',
    focus: 'Peer support & de-escalation',
    meaning:
      'Step in for someone else privately and constructively, without escalating the situation or shaming them.',
    practice: 'Peer Shield Mode, discreet intervention, non-judgemental support.',
    icon: HandHeart,
  },
};

/** The six competencies, in S.H.I.E.L.D. order. */
export const SHIELD_FRAMEWORK: ShieldCompetency[] = COMPETENCY_ORDER.map((competency) => ({
  competency,
  letter: COMPETENCY_LETTER[competency],
  label: COMPETENCY_LABEL[competency],
  ...DETAIL[competency],
}));

export const SHIELD_BY_COMPETENCY: Record<Competency, ShieldCompetency> = Object.fromEntries(
  SHIELD_FRAMEWORK.map((entry) => [entry.competency, entry]),
) as Record<Competency, ShieldCompetency>;
