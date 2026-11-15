// Types from ShieldQuest-V2 apps/web/src/world/contracts.ts that the Guardian port uses.
import type { GuardianId } from './v2Shared';
import type { QualityTier } from './quality';

export type SceneMood = 'neutral' | 'tense' | 'warm' | 'sober' | 'shiny';

export interface GuardianFigureProps {
  guardian: GuardianId;
  /** 0 = folded paper sheet (not yet earned), 1-3 = unfolded and growing. */
  level: number;
  /** Plays the fold-up animation once when it changes from 0 to 1. */
  celebrate?: boolean;
  quality: QualityTier;
}
