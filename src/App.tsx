import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { PublicWebsite } from './features/public-site/PublicWebsite';
import { FacilitatorLogin } from './features/admin/FacilitatorLogin';
import { AdminRouteWrapper } from './features/admin/AdminRouteWrapper';
import { PlayerExperience } from './features/player/PlayerExperience';
import { PeerShield } from './features/peer-shield/PeerShield';
import { MinigameRoutePage } from './features/minigames/MinigameRoutePage';
import { ScenarioRoutePage } from './features/scenarios/ScenarioRoutePage';
import { OnboardingRoutePage } from './features/onboarding/OnboardingRoutePage';
import { ShieldCentralHub } from './features/shield-central/ShieldCentralHub';
import { CasebookPage } from './features/shield-central/CasebookPage';
import { RewardsPage } from './features/shield-central/RewardsPage';
import { AchievementsPage } from './features/shield-central/AchievementsPage';
import { SkillsPage } from './features/shield-central/SkillsPage';
import { TrustedHelpPage } from './features/shield-central/TrustedHelpPage';
import { PlayerSettingsPage } from './features/shield-central/PlayerSettingsPage';
import { LearningCheckPage } from './features/shield-central/LearningCheckPage';
import { SessionCompletePage } from './features/assessment/SessionCompletePage';
import { NotFoundPage } from './features/public-site/NotFoundPage';

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
        if (location.pathname !== '/website') navigate('/website');
      } else if (hash === '#facilitator' || hash === '#admin') {
        if (!location.pathname.startsWith('/admin')) navigate('/admin');
      } else if (hash === '#login') {
        if (location.pathname !== '/admin/login') navigate('/admin/login');
      } else if (hash === '#play' || hash === '#game') {
        if (location.pathname !== '/' && location.pathname !== '/board') navigate('/');
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
      <Routes>
        {/* Canonical Player Experience (default root & game routes) */}
        <Route path="/" element={<PlayerExperience initialPage="city" />} />
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
        <Route path="/peer-shield" element={<PeerShield />} />

        {/* Public Institutional Pages */}
        <Route path="/website" element={<PublicWebsite />} />
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
    </BrowserRouter>
  );
}

export default App;
