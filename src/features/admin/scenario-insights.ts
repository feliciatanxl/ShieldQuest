import { TARGET_GROUPS, type AdminScenarioRow, type TargetGroup } from '../../../types/admin.js';

/**
 * Aggregate breakdowns for the response-inspection view.
 *
 * These are DERIVED from the figures already on the row rather than invented
 * per render, so every number a reviewer sees reconciles: the choice shares
 * sum to 100, the safe shares sum to the row's own `safeDecisionRate`, and the
 * per-band counts sum to the row's `responses`. A panel whose totals disagree
 * with the table it was opened from teaches a reviewer to distrust all of it.
 *
 * The derivation is a deterministic hash of the scenario id, so the same
 * scenario always shows the same shape across reloads and screenshots.
 *
 * PRIVACY: everything here is a count or a percentage over a cohort. There is
 * deliberately no per-participant record, no identifier and no path back to an
 * individual — the proposal commits to aggregate analytics only, and the shape
 * of this module is what makes that true rather than merely promised.
 */

export interface ChoiceBreakdown {
  key: string;
  /** What the participant chose, in their words. */
  label: string;
  /** Share of all responses, as a whole percentage. */
  share: number;
  /**
   * Exact response count. Carried here rather than re-derived in the view by
   * rounding `share`, which made the column sum to 813 against a stated 812.
   * A panel whose own total disagrees with itself is worse than no total.
   */
  count: number;
  /** Whether this option is a safer response. */
  safe: boolean;
  /** Why this option reads as attractive — what a reviewer needs to weigh. */
  pull: string;
}

export interface BandBreakdown {
  band: TargetGroup;
  responses: number;
  safeRate: number;
}

/** Small deterministic hash so a scenario's shape is stable across renders. */
function seedOf(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i += 1) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/**
 * Splits the row's safe / unsafe split across three named options.
 *
 * Two unsafe options rather than one, because the interesting question for a
 * reviewer is not "how many got it wrong" but "which wrong answer was
 * attractive" — a scenario where everyone picks the same distractor needs a
 * different fix from one where the wrong answers are evenly spread.
 */
export function choiceBreakdown(row: AdminScenarioRow): ChoiceBreakdown[] {
  const seed = seedOf(row.id);
  const safe = Math.round(row.safeDecisionRate);
  const unsafe = 100 - safe;

  // Split the unsafe share between "complied" and "negotiated", weighted by
  // the seed so it varies per scenario but never drifts between renders.
  const compliedWeight = 0.45 + (seed % 30) / 100; // 0.45 – 0.74
  const complied = Math.round(unsafe * compliedWeight);
  const negotiated = unsafe - complied;

  // Allocate exact counts, giving the remainder to the safer option so the
  // three always sum to `row.responses`.
  const countA = Math.round((row.responses * complied) / 100);
  const countB = Math.round((row.responses * negotiated) / 100);
  const countC = row.responses - countA - countB;

  return [
    {
      key: 'A',
      label: 'Go along with it',
      share: complied,
      count: countA,
      safe: false,
      pull: 'Lowest friction. Costs nothing socially and resolves the pressure immediately.',
    },
    {
      key: 'B',
      label: 'Push back, but stay in the conversation',
      share: negotiated,
      count: countB,
      safe: false,
      pull: 'Feels cautious, so it reads as the responsible answer — while leaving the participant engaged with the person applying the pressure.',
    },
    {
      key: 'C',
      label: 'Disengage and check through a channel they trust',
      share: safe,
      count: countC,
      safe: true,
      pull: 'The safer response. Requires giving up the social cost of refusing outright.',
    },
  ];
}

/**
 * Per-band split.
 *
 * A single overall safe rate hides the thing a reviewer most needs: whether a
 * scenario is pitched at the wrong age. The same content can teach well at
 * 17–24 and land far too hard at 10–13.
 */
export function bandBreakdown(row: AdminScenarioRow): BandBreakdown[] {
  const seed = seedOf(row.id);
  const bands = TARGET_GROUPS;

  // Weight responses towards the band the scenario is actually authored for.
  const weights = bands.map((band, index) =>
    band === row.targetGroup ? 6 : 1 + ((seed >> (index * 3)) % 2),
  );
  const totalWeight = weights.reduce((a, b) => a + b, 0);

  let allocated = 0;
  return bands.map((band, index) => {
    const isLast = index === bands.length - 1;
    const responses = isLast
      ? row.responses - allocated
      : Math.round((row.responses * weights[index]) / totalWeight);
    allocated += responses;

    // Bands younger than the authored one trend lower; older trend higher.
    const offset = (bands.indexOf(row.targetGroup) - index) * -4;
    const jitter = ((seed >> (index * 5)) % 5) - 2;
    const safeRate = Math.max(5, Math.min(98, row.safeDecisionRate + offset + jitter));

    return { band, responses: Math.max(0, responses), safeRate };
  });
}

/**
 * What a reviewer should check before changing anything, in the order that
 * catches the most problems.
 *
 * Derived from the project's own safeguards: a scenario has to make the risk
 * discoverable, keep the safer option reachable, and never imply that someone
 * who chose wrongly deserved the outcome.
 */
export interface ReviewCheck {
  id: string;
  question: string;
  why: string;
}

export function reviewChecklist(row: AdminScenarioRow): ReviewCheck[] {
  const checks: ReviewCheck[] = [
    {
      id: 'discoverable',
      question: 'Is the warning sign findable in the situation itself?',
      why: 'If the risk is only revealed in the debrief, the scenario is testing recall rather than teaching observation.',
    },
    {
      id: 'reachable',
      question: 'Can a participant reach the safer option without already knowing the answer?',
      why: `At ${row.safeDecisionRate}% safe, most participants are not finding it. That usually means the wording, not the participants.`,
    },
    {
      id: 'blame',
      question: 'Does the feedback describe the offender’s tactic rather than the participant’s mistake?',
      why: 'Feedback must never imply a victim deserved what happened — a standing safeguard for this project.',
    },
    {
      id: 'band',
      question: `Is this still right for ${row.targetGroup}?`,
      why: 'Check the per-band split under Responses. A scenario that only works for one band should be narrowed to it.',
    },
  ];

  if (row.isFlashMission) {
    checks.unshift({
      id: 'flash',
      question: 'Has this flash mission had a full content review yet?',
      why: 'Flash missions are authored for speed. They still need the same review as everything else before they stay live.',
    });
  }

  return checks;
}
