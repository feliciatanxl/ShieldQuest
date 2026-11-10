import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { ConsequenceTeaser } from '../components/ConsequenceTeaser';

describe('Delayed Consequence Teaser Component', () => {
  it('renders the USP headline and decision options', () => {
    render(<ConsequenceTeaser />);
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Every Choice Has a Ripple Effect/i,
      })
    ).toBeInTheDocument();

    expect(screen.getByText(/Send the 6-digit SMS code quickly/i)).toBeInTheDocument();
    expect(screen.getByText(/Pause\. Refuse to send the code/i)).toBeInTheDocument();
  });

  it('reveals immediate and delayed consequences when Option A is selected', async () => {
    const user = userEvent.setup();
    render(<ConsequenceTeaser />);

    const optionA = screen.getByText(/Send the 6-digit SMS code quickly/i);
    await user.click(optionA);

    expect(screen.getByText(/Timeline Simulation Result/i)).toBeInTheDocument();
    expect(screen.getByText(/Immediate Outcome \(0 – 5 mins\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Delayed Fallout \(2 hours – 24 hours later\)/i)).toBeInTheDocument();
    expect(screen.getByText(/locked out of your primary gaming account/i)).toBeInTheDocument();
  });

  it('reveals safe recovery when Option B is selected', async () => {
    const user = userEvent.setup();
    render(<ConsequenceTeaser />);

    const optionB = screen.getByText(/Pause\. Refuse to send the code/i);
    await user.click(optionB);

    expect(screen.getByText(/Timeline Simulation Result/i)).toBeInTheDocument();
    expect(screen.getByText(/When you call Kyler’s actual phone number/i)).toBeInTheDocument();
    expect(screen.getByText(/VeriFox & Shieldfin/i)).toBeInTheDocument();
  });

  it('resets the simulation when the Reset Decision button is clicked', async () => {
    const user = userEvent.setup();
    render(<ConsequenceTeaser />);

    const optionA = screen.getByText(/Send the 6-digit SMS code quickly/i);
    await user.click(optionA);

    const resetButton = screen.getByRole('button', { name: /Reset Decision/i });
    await user.click(resetButton);

    expect(screen.queryByText(/Timeline Simulation Result/i)).not.toBeInTheDocument();
    expect(
      screen.getByText(/Select Option A or Option B above to observe how immediate outcomes differ/i)
    ).toBeInTheDocument();
  });
});
