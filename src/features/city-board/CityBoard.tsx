import { useEffect } from 'react';
import type { Scenario } from '../../../types';
import { useCityBoardStore } from '../../stores/cityBoardStore';
import { CityHomeExperience } from './CityHomeExperience';
import DistrictPage from './DistrictPage';
import CityLink from './navigation';
import { isMissionView, MissionPage } from '../scenarios/MissionPage';
import { GroupDecisionRunner, GROUP_CHAT_JOB } from '../voting/ThinkVoteExplain';

export function CityBoard({
  onMission,
  onNavigate,
}: {
  onMission: (scenario: Scenario) => void;
  onNavigate: (page: 'guardians' | 'squad' | 'reflection' | 'portal') => void;
}) {
  const { view, navigate, scenarios, catalogueStatus, catalogueMode, loadScenarios } =
    useCityBoardStore();
  useEffect(() => {
    if (catalogueStatus === 'idle') void loadScenarios();
  }, [catalogueStatus, loadScenarios]);
  useEffect(() => {
    if (view === '/guardians' || view === '/join' || view === '/progress' || view === '/admin') {
      onNavigate(
        view === '/admin'
          ? 'portal'
          : view === '/guardians'
            ? 'guardians'
            : view === '/join'
              ? 'squad'
              : 'reflection',
      );
      navigate('/game');
    }
    if (view.startsWith('/mission/')) {
      const scenario = scenarios.find((item) => `/mission/${encodeURIComponent(item.id)}` === view);
      if (scenario) {
        onMission(scenario);
        navigate(`/district/${scenario.district}`);
      }
    }
  }, [view, scenarios, onMission, onNavigate, navigate]);

  return (
    <div className="city-feature">
      <div className="city-api-status" role="status">
        {catalogueStatus === 'loading' || catalogueStatus === 'idle' ? (
          'Loading missions…'
        ) : catalogueStatus === 'error' ? (
          <>
            Missions could not be loaded. You can still explore the city.{' '}
            <button onClick={() => void loadScenarios()}>Retry</button>
          </>
        ) : catalogueMode === 'demo' ? (
          'Mission previews · Progress lasts for this visit'
        ) : (
          'City missions'
        )}
      </div>
      <div className="city-viewport">
        {isMissionView(view) ? (
          <MissionPage view={view} />
        ) : view === '/think-vote-explain' ? (
          <GroupDecisionRunner
            scenario={GROUP_CHAT_JOB}
            backHref="/district/digital"
            backLabel="Back to Digi-District"
          />
        ) : view === '/game' ? (
          <CityHomeExperience />
        ) : view.startsWith('/district/') ? (
          <DistrictPage />
        ) : (
          <div className="mx-auto max-w-2xl space-y-5 p-6 text-ink">
            <h1 className="text-2xl font-extrabold text-navy-900">
              {view === '/shield-central' ? 'Shield Central' : 'Coming soon'}
            </h1>
            {view === '/shield-central' ? (
              <>
                <p>Your city, your route. Choose a district or visit your squad.</p>
                <CityLink href="/guardians" className="block rounded-xl bg-navy-900 p-4 text-white">
                  Open Guardians
                </CityLink>
                <CityLink href="/join" className="block rounded-xl bg-navy-900 p-4 text-white">
                  My squad
                </CityLink>
                <CityLink href="/progress" className="block rounded-xl bg-navy-900 p-4 text-white">
                  Reflection
                </CityLink>
              </>
            ) : (
              <p>This part of ShieldQuest will be available in a later feature update.</p>
            )}
            <CityLink
              href="/game"
              className="inline-flex rounded-xl bg-civic-600 px-5 py-3 font-bold text-white"
            >
              Back to ShieldQuest City
            </CityLink>
          </div>
        )}
      </div>
    </div>
  );
}
