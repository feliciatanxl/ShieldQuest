import { MissionRunner } from './MissionRunner';
import { MULE_ENCOUNTER, MULE_PEER_SHIELD } from './data';
import { NODE_EASY_MONEY, NODE_PEER_JAYDEN } from '../city-board/data/world-data';

export const isMissionView = (view: string) => view === '/play' || view === '/peer-shield';

export function MissionPage({ view }: { view: string }) {
  return view === '/peer-shield' ? (
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
      note="In Peer Shield you are not the target. You are practising how to help a friend step back from a risky decision — without confronting anyone or putting yourself in the middle of it."
      decisionPrompt="What would you do if this was your friend?"
      skillCaption="Peer Shield skill"
      backHref="/district/community"
      backLabel="Back to Community Hub"
    />
  ) : (
    <MissionRunner
      key="encounter"
      scenarioId={MULE_ENCOUNTER.id}
      activityId={NODE_EASY_MONEY}
      accent="civic"
      eyebrow="Digi-District"
      decisionPrompt="What do you do?"
      backHref="/district/digital"
      backLabel="Back to Digi-District"
    />
  );
}
