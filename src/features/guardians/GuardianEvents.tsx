import { useEffect } from 'react';
import { X } from 'lucide-react';
import { useSessionStore } from '../../stores/sessionStore';
import { guardians } from './data';
import { GuardianMet } from './GuardianMet';
import { GuardianProgressNote } from './GuardianCard';
import { DistrictComplete } from '../assessment/DistrictComplete';
import { DISTRICT_BADGES } from '../assessment/data';
import { useWorld } from '../city-board/hooks/useWorld';
import { useShieldProgress } from './useShieldProgress';
import { TOKEN_AWARD } from '../../../types/assessment';
import type { Competency } from '../../../types/guardians';

/** Render after the mission dialog closes, so two dialogs never compete for focus. */
export function GuardianEvents() {
  const {
    pendingGuardianMeetings,
    pendingDistrictCelebrations,
    guardianNotice,
    completed,
    districtBadges,
    earnedAchievements,
    acknowledgeGuardianMet,
    acknowledgeDistrictCelebration,
    dismissGuardianNotice,
    recordDistrictBadge,
    recordAchievement,
  } = useSessionStore();

  const { districts } = useWorld();
  const { achievements, skillCounts } = useShieldProgress();

  /* Watch for district completion */
  useEffect(() => {
    for (const district of districts) {
      const builtNodes = district.nodes.filter((node) => node.availability !== 'PLANNED');
      if (builtNodes.length > 0 && builtNodes.every((node) => completed.includes(node.id))) {
        if (!districtBadges.includes(district.id)) {
          recordDistrictBadge(district.id);
        }
      }
    }
  }, [districts, completed, districtBadges, recordDistrictBadge]);

  /* Watch for quiet achievement milestones */
  useEffect(() => {
    for (const a of achievements) {
      if (a.earned && !earnedAchievements.includes(a.id)) {
        recordAchievement(a.id);
      }
    }
  }, [achievements, earnedAchievements, recordAchievement]);

  const meeting = guardians.find((guardian) => guardian.id === pendingGuardianMeetings[0]) ?? null;
  const noticeGuardian = guardians.find((guardian) => guardian.id === guardianNotice?.guardianId);

  const celebratingId = pendingDistrictCelebrations[0] ?? null;
  const celebratingDistrict = celebratingId ? districts.find((d) => d.id === celebratingId) : undefined;
  const skills: Competency[] = celebratingDistrict
    ? [
        ...new Set(
          celebratingDistrict.nodes
            .filter((n) => n.completed)
            .map((n) => n.primaryCompetency),
        ),
      ]
    : [];
  const guardianId = celebratingDistrict?.nodes.find((n) => n.completed && n.guardianId)?.guardianId;
  const celebratingGuardian = guardianId ? guardians.find((g) => g.id === guardianId) : undefined;
  const guardianCumulative = celebratingGuardian
    ? (useSessionStore.getState().guardianProgress[celebratingGuardian.id] ?? 0)
    : 0;

  return (
    <div className="city-feature guardian-feature">
      {/* 1. First-meeting moment always goes first */}
      <GuardianMet guardian={meeting} onContinue={acknowledgeGuardianMet} />

      {/* 2. District complete celebration opens only after meeting is dismissed */}
      {!meeting && celebratingId && (
        <DistrictComplete
          districtId={celebratingId}
          districtName={celebratingDistrict?.name ?? ''}
          badge={DISTRICT_BADGES[celebratingId]}
          completed={celebratingDistrict?.completed ?? 0}
          total={celebratingDistrict?.nodes.filter((n) => n.availability !== 'PLANNED').length ?? 0}
          skills={skills.length ? skills : (Object.keys(skillCounts) as Competency[]).filter((c) => skillCounts[c] > 0)}
          guardian={celebratingGuardian}
          guardianCumulative={guardianCumulative}
          tokensAwarded={TOKEN_AWARD.district}
          onClose={acknowledgeDistrictCelebration}
        />
      )}

      {/* 3. Toast notice renders after all modal takeovers close */}
      {!meeting && !celebratingId && guardianNotice && noticeGuardian && (
        <div className="guardian-feedback" role="status">
          <GuardianProgressNote name={noticeGuardian.name} award={guardianNotice.award} />
          <button
            aria-label="Dismiss guardian progress"
            onClick={dismissGuardianNotice}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-lg text-navy-900"
          >
            <X size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
