import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

  it('filters guardians when a discipline pill is selected', async () => {
    const user = userEvent.setup();
    await act(async () => {
      render(
        <MemoryRouter>
          <GuardiansPage />
        </MemoryRouter>
      );
    });

    const verificationTab = screen.getByRole('tab', { name: 'Verification' });
    await user.click(verificationTab);

    expect(screen.getByRole('heading', { name: 'VeriFox' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Echo' })).not.toBeInTheDocument();
  });
});
