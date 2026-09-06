import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import type { Scenario } from '../../../types';

export function ThinkVoteExplain({
  scenario,
  onConfirm,
}: {
  scenario: Scenario;
  onConfirm: (id: string) => void;
}) {
  const [choiceId, setChoiceId] = useState('');
  return (
    <div className="vote-panel">
      <span className="eyebrow">THINK · VOTE · EXPLAIN</span>
      <h3>What would you do?</h3>
      <p>
        Choose for yourself first. In a live session, your squad would compare responses after
        everyone votes.
      </p>
      <fieldset>
        <legend className="sr-only">Choose your response</legend>
        {scenario.choices.map((choice) => (
          <label className={`choice ${choiceId === choice.id ? 'active' : ''}`} key={choice.id}>
            <input
              type="radio"
              name="vote"
              value={choice.id}
              checked={choiceId === choice.id}
              onChange={() => setChoiceId(choice.id)}
            />
            <span>{choice.label}</span>
          </label>
        ))}
      </fieldset>
      <button
        className="primary-button full"
        disabled={!choiceId}
        onClick={() => onConfirm(choiceId)}
      >
        <CheckCircle2 size={18} /> Confirm demo choice
      </button>
      <p className="small-label">
        This choice stays in this preview and is not submitted to a server.
      </p>
    </div>
  );
}

export function SquadVoteDashboard() {
  return (
    <div className="empty-panel">
      <h3>Every perspective counts</h3>
      <p>
        Squad comparison will appear here once private voting and live sessions are connected.
        Responses should stay hidden until the voting round closes.
      </p>
      <span className="badge">Planned · live squad voting</span>
    </div>
  );
}
