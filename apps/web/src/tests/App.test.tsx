import { render, screen, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { RootLayout } from '../layouts/RootLayout';
import { HomePage } from '../pages/HomePage';
import { AboutPage } from '../pages/AboutPage';
import { HowItWorksPage } from '../pages/HowItWorksPage';
import { GuardiansPage } from '../pages/GuardiansPage';
import { WorldPage } from '../pages/WorldPage';
import { FaqPage } from '../pages/FaqPage';
import { NotFoundPage } from '../pages/NotFoundPage';

function renderWithRouter(initialEntry = '/') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
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
    </MemoryRouter>
  );
}

describe('ShieldQuest Public Navigation & Routing', () => {
  it('renders HomePage with hero headline and primary CTAs on root route', async () => {
    await act(async () => {
      renderWithRouter('/');
    });
    expect(screen.getByRole('heading', { level: 1, name: /Every Choice Shapes Your Story/i })).toBeInTheDocument();
    
    // Multiple links exist for navigation and hero CTA
    const worldLinks = screen.getAllByRole('link', { name: /Explore the World/i });
    expect(worldLinks.length).toBeGreaterThan(0);
    expect(worldLinks[0]).toHaveAttribute('href', '/world');

    const howItWorksLinks = screen.getAllByRole('link', { name: /How It Works/i });
    expect(howItWorksLinks.length).toBeGreaterThan(0);
    expect(howItWorksLinks[0]).toHaveAttribute('href', '/how-it-works');
  });

  it('renders AboutPage with S.H.I.E.L.D. framework', async () => {
    await act(async () => {
      renderWithRouter('/about');
    });
    expect(screen.getByRole('heading', { level: 1, name: /Empowering Youths to Make Safer Choices Together/i })).toBeInTheDocument();
    expect(screen.getByText(/The S.H.I.E.L.D. Framework/i)).toBeInTheDocument();
  });

  it('renders HowItWorksPage with player journey loop', async () => {
    await act(async () => {
      renderWithRouter('/how-it-works');
    });
    expect(screen.getByRole('heading', { level: 1, name: /How ShieldQuest Works/i })).toBeInTheDocument();
    expect(screen.getByText(/The 6-Step Player Journey/i)).toBeInTheDocument();
    expect(screen.getByText(/The Think–Vote–Explain Ritual/i)).toBeInTheDocument();
  });

  it('renders GuardiansPage with 6 guardians', async () => {
    await act(async () => {
      renderWithRouter('/guardians');
    });
    expect(screen.getByRole('heading', { level: 1, name: /Meet the Six Guardians/i })).toBeInTheDocument();
    expect(screen.getAllByText(/VeriFox/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Shieldfin/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/ByteBuddy/i).length).toBeGreaterThan(0);
  });

  it('renders WorldPage with City Board districts', async () => {
    await act(async () => {
      renderWithRouter('/world');
    });
    expect(screen.getByRole('heading', { level: 1, name: /Explore the Fictional City Board/i })).toBeInTheDocument();
    expect(screen.getAllByText(/School Street/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Digi-District/i).length).toBeGreaterThan(0);
  });

  it('renders FaqPage with accordion', async () => {
    await act(async () => {
      renderWithRouter('/faq');
    });
    expect(screen.getByRole('heading', { level: 1, name: /Answers & Safety Principles/i })).toBeInTheDocument();
    expect(screen.getByText(/What is ShieldQuest\?/i)).toBeInTheDocument();
  });

  it('renders NotFoundPage on unknown route', async () => {
    await act(async () => {
      renderWithRouter('/unknown-path-12345');
    });
    expect(screen.getByRole('heading', { level: 1, name: /Lost on the City Board\?/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Return to Headquarters/i })).toHaveAttribute('href', '/');
  });
});
