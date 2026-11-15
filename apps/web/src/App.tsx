import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { RootLayout } from './layouts/RootLayout';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { GuardiansPage } from './pages/GuardiansPage';
import { WorldPage } from './pages/WorldPage';
import { FaqPage } from './pages/FaqPage';
import { NotFoundPage } from './pages/NotFoundPage';
const CharacterTestPage = React.lazy(() => import('./pages/CharacterTestPage').then((m) => ({ default: m.CharacterTestPage })));

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Single gameplay playground; own header, outside the site layout */}
        <Route path="/dev/character-test" element={<React.Suspense fallback={null}><CharacterTestPage /></React.Suspense>} />
        <Route path="/dev/neighbourhood-test" element={<Navigate to="/dev/character-test" replace />} />
        <Route path="/" element={<RootLayout />}>
          <Route index element={<HomePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="how-it-works" element={<HowItWorksPage />} />
          <Route path="guardians" element={<GuardiansPage />} />
          <Route path="world" element={<WorldPage />} />
          <Route path="faq" element={<FaqPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
