import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { DistrictMap } from '../components/DistrictMap';

describe('DistrictMap Component', () => {
  it('renders all 4 districts on initial load', () => {
    render(<DistrictMap />);
    expect(screen.getByRole('button', { name: /Select district: School Street/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Select district: Retail District/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Select district: Digi-District/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Select district: Community Hub/i })).toBeInTheDocument();
  });

  it('updates the detailed dossier when a district is clicked', async () => {
    const user = userEvent.setup();
    render(<DistrictMap />);

    const digiDistrictBtn = screen.getByRole('button', { name: /Select district: Digi-District/i });
    await user.click(digiDistrictBtn);

    const dossier = screen.getByRole('region', { name: /Details for Digi-District/i });
    expect(dossier).toBeInTheDocument();
    expect(dossier).toHaveTextContent(/Phishing links, gaming account trades/i);
    expect(dossier).toHaveTextContent(/Digital hygiene/i);
  });

  it('switches between Map View and accessible List View', async () => {
    const user = userEvent.setup();
    render(<DistrictMap />);

    const listViewBtn = screen.getByRole('button', { name: /Accessible List View/i });
    await user.click(listViewBtn);

    expect(screen.queryByText(/Sector 01/i)).not.toBeInTheDocument(); // Map badge is replaced by list layout
    expect(screen.getByText(/A bustling commercial corridor packed with high-end shops/i)).toBeInTheDocument();

    const mapViewBtn = screen.getByRole('button', { name: /Interactive Map View/i });
    await user.click(mapViewBtn);
    expect(screen.getByText(/Sector 01/i)).toBeInTheDocument();
  });
});
