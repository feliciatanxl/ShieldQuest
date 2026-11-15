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

    expect(screen.getByRole('heading', { name: 'VeriFox', level: 3 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Echo', level: 3 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Beacon', level: 3 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Shieldfin', level: 3 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Cluepaw', level: 3 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'ByteBuddy', level: 3 })).toBeInTheDocument();
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
