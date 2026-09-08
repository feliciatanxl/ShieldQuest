import { BrowserRouter, Navigate, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { lazy, Suspense, useEffect } from 'react';
import { useCityBoardStore } from './stores/cityBoardStore';

const PublicWebsite = lazy(() =>
  import('./features/public-site/PublicWebsite').then((module) => ({
    default: module.PublicWebsite,
  })),
);
const FacilitatorLogin = lazy(() =>
  import('./features/admin/FacilitatorLogin').then((module) => ({
    default: module.FacilitatorLogin,
  })),
);
const AdminRouteWrapper = lazy(() =>
  import('./features/admin/AdminRouteWrapper').then((module) => ({
    default: module.AdminRouteWrapper,
  })),
);
const PlayerExperience = lazy(() =>
  import('./features/player/PlayerExperience').then((module) => ({
    default: module.PlayerExperience,
  })),
);
const PeerShield = lazy(() =>
  import('./features/peer-shield/PeerShield').then((module) => ({
    default: module.PeerShield,
  })),
);
const MinigameRoutePage = lazy(() =>
  import('./features/minigames/MinigameRoutePage').then((module) => ({
    default: module.MinigameRoutePage,
  })),
);
const ScenarioRoutePage = lazy(() =>
  import('./features/scenarios/ScenarioRoutePage').then((module) => ({
    default: module.ScenarioRoutePage,
  })),
);
const OnboardingRoutePage = lazy(() =>
  import('./features/onboarding/OnboardingRoutePage').then((module) => ({
    default: module.OnboardingRoutePage,
  })),
);
const ShieldCentralHub = lazy(() =>
  import('./features/shield-central/ShieldCentralHub').then((module) => ({
    default: module.ShieldCentralHub,
  })),
);
const CasebookPage = lazy(() =>
  import('./features/shield-central/CasebookPage').then((module) => ({
    default: module.CasebookPage,
  })),
);
const RewardsPage = lazy(() =>
  import('./features/shield-central/RewardsPage').then((module) => ({
    default: module.RewardsPage,
  })),
);
const AchievementsPage = lazy(() =>
  import('./features/shield-central/AchievementsPage').then((module) => ({
    default: module.AchievementsPage,
  })),
);
const SkillsPage = lazy(() =>
  import('./features/shield-central/SkillsPage').then((module) => ({
    default: module.SkillsPage,
  })),
);
const TrustedHelpPage = lazy(() =>
  import('./features/shield-central/TrustedHelpPage').then((module) => ({
    default: module.TrustedHelpPage,
  })),
);
const PlayerSettingsPage = lazy(() =>
  import('./features/shield-central/PlayerSettingsPage').then((module) => ({
    default: module.PlayerSettingsPage,
  })),
);
const LearningCheckPage = lazy(() =>
  import('./features/shield-central/LearningCheckPage').then((module) => ({
    default: module.LearningCheckPage,
  })),
);
const SessionCompletePage = lazy(() =>
  import('./features/assessment/SessionCompletePage').then((module) => ({
    default: module.SessionCompletePage,
  })),
);
const NotFoundPage = lazy(() =>
  import('./features/public-site/NotFoundPage').then((module) => ({
    default: module.NotFoundPage,
  })),
);

function RouteFallback() {
  return (
    <div className="grid min-h-dvh place-items-center bg-[var(--sq-canvas)] px-6 text-center" role="status">
      <div>
        <div className="mx-auto h-10 w-10 animate-pulse rounded-[10px] bg-[var(--sq-action)]" />
        <p className="mt-4 text-sm font-bold text-[var(--sq-ink-muted)]">Opening ShieldQuest…</p>
      </div>
    </div>
  );
}

/**
 * Handles legacy hash navigations (#website, #admin, #play, #login, #onboarding, #shield-central)
 * and seamlessly synchronises them with real URLs.
 */
function HashNavigationHandler() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.toLowerCase();
      if (!hash) return;

      if (
        hash === '#website' ||
        hash.startsWith('#about') ||
        hash.startsWith('#how-it-works') ||
        hash.startsWith('#framework') ||
        hash.startsWith('#schools') ||
        hash.startsWith('#impact') ||
        hash.startsWith('#safety') ||
        hash.startsWith('#faq')
      ) {
        if (location.pathname !== '/') navigate('/');
      } else if (hash === '#facilitator' || hash === '#admin') {
        if (!location.pathname.startsWith('/admin')) navigate('/admin');
      } else if (hash === '#login') {
        if (location.pathname !== '/admin/login') navigate('/admin/login');
      } else if (hash === '#play' || hash === '#game') {
        if (location.pathname !== '/board') navigate('/board');
      } else if (
        hash.startsWith('#/mini-game') ||
        hash.startsWith('#mini-game') ||
        hash.startsWith('#/district') ||
        hash.startsWith('#district') ||
        hash.startsWith('#/mission') ||
        hash.startsWith('#mission') ||
        hash.startsWith('#/think-vote-explain') ||
        hash.startsWith('#think-vote-explain')
      ) {
        const targetView = window.location.hash.replace(/^#\/?/, '/');
        useCityBoardStore.getState().navigate(targetView);
        if (location.pathname !== '/board') {
          navigate('/board' + window.location.hash);
        }
      } else if (hash === '#onboarding') {
        if (location.pathname !== '/onboarding') navigate('/onboarding');
      } else if (hash === '#peer-shield') {
        if (location.pathname !== '/peer-shield') navigate('/peer-shield');
      } else if (hash === '#shield-central') {
        if (location.pathname !== '/shield-central') navigate('/shield-central');
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [navigate, location.pathname]);

  return null;
}

export function App() {
  return (
    <BrowserRouter>
      <HashNavigationHandler />
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          {/* Public site is the canonical entry point for partners and evaluators. */}
          <Route path="/" element={<PublicWebsite />} />
          <Route path="/website" element={<Navigate replace to="/" />} />

          {/* Player PWA experience */}
          <Route path="/board" element={<PlayerExperience initialPage="city" />} />
          <Route path="/play" element={<PlayerExperience initialPage="city" />} />
          <Route path="/join" element={<PlayerExperience initialPage="squad" />} />
          <Route path="/squad" element={<PlayerExperience initialPage="squad" />} />
          <Route path="/guardians" element={<PlayerExperience initialPage="guardians" />} />
          <Route path="/progress" element={<PlayerExperience initialPage="reflection" />} />
          <Route path="/welcome" element={<OnboardingRoutePage />} />
          <Route path="/onboarding" element={<OnboardingRoutePage />} />
          <Route path="/scenario/:id" element={<ScenarioRoutePage />} />
          <Route path="/minigame/:id" element={<MinigameRoutePage />} />
          <Route path="/mini-game/:id" element={<MinigameRoutePage />} />
          <Route path="/peer-shield" element={<PeerShield />} />

          {/* Public Institutional Pages */}
          <Route path="/about" element={<PublicWebsite />} />
          <Route path="/how-it-works" element={<PublicWebsite />} />
          <Route path="/for-schools" element={<PublicWebsite />} />
          <Route path="/safety" element={<PublicWebsite />} />
          <Route path="/accessibility" element={<PublicWebsite />} />
          <Route path="/faq" element={<PublicWebsite />} />

          {/* Shield Central Hub & Subpages */}
          <Route path="/shield-central" element={<ShieldCentralHub />} />
          <Route path="/shield-central/casebook" element={<CasebookPage />} />
          <Route path="/shield-central/rewards" element={<RewardsPage />} />
          <Route path="/shield-central/achievements" element={<AchievementsPage />} />
          <Route path="/shield-central/skills" element={<SkillsPage />} />
          <Route path="/shield-central/trusted-help" element={<TrustedHelpPage />} />
          <Route path="/shield-central/settings" element={<PlayerSettingsPage />} />
          <Route path="/shield-central/check-in" element={<LearningCheckPage />} />
          <Route path="/evaluation" element={<LearningCheckPage />} />
          <Route path="/session-complete" element={<SessionCompletePage />} />

          {/* Facilitator & Admin Portal */}
          <Route path="/admin/login" element={<FacilitatorLogin />} />
          <Route path="/admin" element={<AdminRouteWrapper />} />
          <Route path="/admin/*" element={<AdminRouteWrapper />} />

          {/* Fallback 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
