import { render, screen, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { GuardiansPage } from '../pages/GuardiansPage';

describe('GuardiansPage Component', () => {
  it('renders all six Guardians', async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <GuardiansPage />
        </MemoryRouter>
      );
    });

    expect(screen.getByRole('heading', { name: 'VeriFox' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Echo' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Beacon' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Shieldfin' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Cluepaw' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'ByteBuddy' })).toBeInTheDocument();
  });

  it('shows each Guardian discipline without filter tabs', async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <GuardiansPage />
        </MemoryRouter>
      );
    });

    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(6);
  });
});
