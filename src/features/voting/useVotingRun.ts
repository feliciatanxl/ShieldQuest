import { useEffect, useRef, useState } from 'react';
import type { GroupDecisionScenario, GroupDecisionStage } from '../../../types/voting';
import type { GuardianAward } from '../../../types/guardians';
import { useSessionStore } from '../../stores/sessionStore';
import { peerRoleForRound } from './peer-roles-data';

/**
 * Dedicated hook driving the Think · Vote · Explain facilitated group decision lifecycle.
 *
 * Sequence: THINK → VOTE → GROUP → EXPLAIN → RECONSIDER → DEBRIEF.
 *
 * Progress is granted upon reaching the debrief, whichever way the player voted
 * and whether or not they changed their mind. Keyed grants in sessionStore guarantee
 * rerenders and re-runs cannot duplicate rewards.
 */
export function useVotingRun(scenario: GroupDecisionScenario) {
  const [stage, setStage] = useState<GroupDecisionStage>('THINK');
  const [firstChoice, setFirstChoice] = useState<string | null>(null);
  const [finalChoice, setFinalChoice] = useState<string | null>(null);
  const [factors, setFactors] = useState<string[]>([]);
  const [factorsShared, setFactorsShared] = useState(false);
  const [tokensAwarded, setTokensAwarded] = useState(0);
  const [guardianAward, setGuardianAward] = useState<GuardianAward | null>(null);
  const [round, setRound] = useState(0);

  const awardedRef = useRef(false);

  useEffect(() => {
    if (stage !== 'DEBRIEF' || awardedRef.current) return;
    awardedRef.current = true;
    const result = useSessionStore
      .getState()
      .completeGroupDecision(scenario.nodeId, scenario.guardianId);
    setGuardianAward(result.guardianAward);
    setTokensAwarded(result.tokensAwarded);
  }, [stage, scenario.nodeId, scenario.guardianId]);

  const role = peerRoleForRound(round);

  const finishThink = () => {
    setStage('VOTE');
  };

  const chooseFirst = (id: string) => {
    setFirstChoice(id);
    setStage('GROUP');
  };

  const continueToExplain = () => {
    setStage('EXPLAIN');
  };

  const toggleFactor = (id: string) => {
    setFactors((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const shareFactors = () => {
    setFactorsShared(true);
  };

  const continueToReconsider = () => {
    setStage('RECONSIDER');
  };

  const chooseFinal = (id: string) => {
    setFinalChoice(id);
    setStage('DEBRIEF');
  };

  const restart = () => {
    setStage('THINK');
    setFirstChoice(null);
    setFinalChoice(null);
    setFactors([]);
    setFactorsShared(false);
    setTokensAwarded(0);
    setGuardianAward(null);
    setRound((r) => r + 1);
  };

  const firstOption = scenario.options.find((o) => o.id === firstChoice);
  const finalOption = scenario.options.find((o) => o.id === finalChoice);
  const changed = Boolean(firstChoice && finalChoice && firstChoice !== finalChoice);
  const chosenFactorLabels = scenario.factors
    .filter((f) => factors.includes(f.id))
    .map((f) => f.label);

  return {
    stage,
    round,
    role,
    firstChoice,
    finalChoice,
    firstOption,
    finalOption,
    factors,
    factorsShared,
    tokensAwarded,
    guardianAward,
    changed,
    chosenFactorLabels,
    finishThink,
    chooseFirst,
    continueToExplain,
    toggleFactor,
    shareFactors,
    continueToReconsider,
    chooseFinal,
    restart,
  };
}
