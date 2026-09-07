import { useParams } from 'react-router-dom';
import { MissionRunner } from './MissionRunner';
import { MULE_ENCOUNTER, MULE_PEER_SHIELD } from './data';
import { NODE_EASY_MONEY, NODE_PEER_JAYDEN } from '../city-board/data/world-data';

export function ScenarioRoutePage() {
  const { id } = useParams<{ id: string }>();

  if (id === 'peer' || id === 'peer-shield') {
    return (
      <MissionRunner
        key="peer"
        scenarioId={MULE_PEER_SHIELD.id}
        activityId={NODE_PEER_JAYDEN}
        accent="teal"
        eyebrow="Peer Shield"
        modeBadge="Peer Shield"
        desktopSplit
        friend={{
          name: 'Jayden',
          quote: "Bro this guy says he'll pay me $200. I just need to receive the money first.",
        }}
        note="In Peer Shield you are not the target. You are practising how to help a friend step back from a risky decision."
        decisionPrompt="What would you do if this was your friend?"
        skillCaption="Peer Shield skill"
        backHref="/board"
        backLabel="Back to City Board"
      />
    );
  }

  return (
    <MissionRunner
      key={id || 'mule-encounter'}
      scenarioId={id || MULE_ENCOUNTER.id}
      activityId={NODE_EASY_MONEY}
      accent="civic"
      eyebrow="Decision Scenario"
      decisionPrompt="What do you do?"
      backHref="/board"
      backLabel="Back to City Board"
    />
  );
}
