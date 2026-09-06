import { useEffect, useRef, useState } from 'react';
import type {
  ChoiceResult,
  Deltas,
  MissionConsequence,
  ScenarioChoice,
} from '../../../types/scenarios';
import type { GuardianAward } from '../../../types/guardians';
import { useSessionStore } from '../../stores/sessionStore';
import { MULE_ENCOUNTER, MULE_PEER_SHIELD } from './data';

// TODO(Participant): simulated scenario figures have no Prisma fields yet.
// These are a fresh simulation on each replay, separate from earned participation tokens.
const baseline = { coins: 0, trust: 62, risk: 28, resiliencePoints: 85 };
function applyDeltas(profile: typeof baseline, deltas: Deltas) {
  return {
    coins: Math.max(0, profile.coins + (deltas.coins ?? 0)),
    trust: Math.max(0, Math.min(100, profile.trust + (deltas.trust ?? 0))),
    risk: Math.max(0, Math.min(100, profile.risk + (deltas.risk ?? 0))),
    resiliencePoints: Math.max(0, profile.resiliencePoints + (deltas.resilience ?? 0)),
  };
}

/** Solo run only. The group-decision orchestration remains phase 4. */
export function useMissionRun(scenarioId: string, activityId = scenarioId) {
  const scenario = [MULE_ENCOUNTER, MULE_PEER_SHIELD].find((item) => item.id === scenarioId);
  const [profile, setProfile] = useState(baseline);
  const [taggedClues, setTaggedClues] = useState<string[]>([]);
  const [committedChoice, setCommittedChoice] = useState<ScenarioChoice | null>(null);
  const [result, setResult] = useState<ChoiceResult | null>(null);
  const [consequence, setConsequence] = useState<MissionConsequence | null>(null);
  const [guardianAward, setGuardianAward] = useState<GuardianAward | null>(null);
  const [tokensAwarded, setTokensAwarded] = useState(0);
  const [burst, setBurst] = useState<{
    key: number;
    title: string;
    amount?: string;
    tone: 'positive' | 'reward' | 'caution';
  } | null>(null);
  const committed = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  useEffect(() => clearTimers, []);

  function choose(selection: ScenarioChoice) {
    if (committed.current || !scenario) return;
    // Resolve from authored content, never trust a caller-supplied result.
    const choice = scenario.choices.find((item) => item.id === selection.id);
    if (!choice) return;
    committed.current = true;
    const next: ChoiceResult = {
      outcome: choice.outcome,
      ...choice.immediate,
      debrief: choice.debrief,
      delayed: choice.delayed,
    };
    // TODO(Choice, GuardianProgress): replace local resolution with a participant-authorized
    // decision endpoint when it exists. GET /scenarios only serves the separate API samples.
    const grant = useSessionStore.getState().completeMission(activityId, choice, scenario.mode);
    setGuardianAward(grant.guardianAward);
    setTokensAwarded(grant.tokensAwarded);
    setCommittedChoice(choice);
    setResult(next);
    setProfile((value) => applyDeltas(value, next.deltas));
    setBurst({
      key: Date.now(),
      title: next.flashTitle,
      amount: next.flashAmount,
      tone: next.outcome === 'SAFE' ? 'positive' : next.outcome === 'RISKY' ? 'reward' : 'caution',
    });
    timers.current.push(setTimeout(() => setBurst(null), 2000));
    if (next.delayed) {
      const delayed = next.delayed;
      timers.current.push(
        setTimeout(() => {
          setProfile((value) => applyDeltas(value, delayed.deltas));
          setConsequence(delayed);
        }, delayed.delayMs),
      );
    }
  }

  function replay() {
    clearTimers();
    committed.current = false;
    setCommittedChoice(null);
    setResult(null);
    setConsequence(null);
    setBurst(null);
    setGuardianAward(null);
    setTokensAwarded(0);
    setTaggedClues([]);
    setProfile(baseline);
  }
  return {
    scenario,
    profile,
    result,
    consequence,
    burst,
    guardianAward,
    tokensAwarded,
    taggedClues,
    pendingChoiceId: null,
    committedChoice,
    isResolved: Boolean(committedChoice),
    transcript: [
      ...(scenario?.messages ?? []),
      ...(committedChoice
        ? [
            {
              id: `reply_${committedChoice.id}`,
              author: 'you' as const,
              body: committedChoice.reply,
            },
          ]
        : []),
    ],
    toggleClue: (id: string) => {
      if (committed.current || !scenario?.clues?.some((clue) => clue.id === id)) return;
      setTaggedClues((previous) =>
        previous.includes(id) ? previous.filter((item) => item !== id) : [...previous, id],
      );
    },
    choose,
    replay,
  };
}
