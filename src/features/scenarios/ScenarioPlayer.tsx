import { useState } from 'react';
import { ArrowRight, Search, MessagesSquare, ShieldCheck } from 'lucide-react';
import type { MissionPhase, Scenario } from '../../../types';
import { Modal } from '../../components/Modal';
import { ThinkVoteExplain } from '../voting/ThinkVoteExplain';
import { ConsequenceCard } from '../consequences/ConsequenceCard';
import { useSessionStore } from '../../stores/sessionStore';

const phases: MissionPhase[] = [
  'Explore',
  'Investigate',
  'Discuss',
  'Decide',
  'Experience',
  'Protect',
];
export function ScenarioPlayer({ scenario, onClose }: { scenario: Scenario; onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [choice, setChoice] = useState('');
  const completePreview = useSessionStore((state) => state.completePreview);
  return (
    <Modal title={scenario.title} onClose={onClose}>
      <span className="badge">Sample mission · local preview</span>
      <ol className="phase-list">
        {phases.map((phase, i) => (
          <li
            key={phase}
            className={i <= step ? 'active' : ''}
            aria-current={i === step ? 'step' : undefined}
          >
            <span>{i + 1}</span>
            {phase}
          </li>
        ))}
      </ol>
      <div className="phase-content" aria-live="polite">
        {step === 0 && (
          <>
            <div className="phase-icon" aria-hidden="true">
              {scenario.district === 'school' ? '🏫' : scenario.district === 'retail' ? '🛍️' : '💻'}
            </div>
            <h3>A choice is around the corner.</h3>
            <p>{scenario.prompt}</p>
          </>
        )}
        {step === 1 && (
          <>
            <Search className="phase-icon" />
            <h3>Look a little closer.</h3>
            <p>{scenario.clue}</p>
            <div className="note">Which detail changes how you see the situation?</div>
          </>
        )}
        {step === 2 && (
          <>
            <MessagesSquare className="phase-icon" />
            <h3>Make space for another perspective.</h3>
            <p>
              Who could be affected? What might they be feeling? Talk it through with your squad, or
              take a moment to reflect on your own.
            </p>
            <div className="note">There’s no timer. Good thinking deserves a little room.</div>
          </>
        )}
        {step === 3 && (
          <ThinkVoteExplain
            scenario={scenario}
            onConfirm={(id) => {
              setChoice(id);
              setStep(4);
            }}
          />
        )}
        {step === 4 && (
          <ConsequenceCard
            message={scenario.choices.find((item) => item.id === choice)?.reflection ?? ''}
          />
        )}
        {step === 5 && (
          <>
            <ShieldCheck className="phase-icon" />
            <h3>Take the lesson beyond the board.</h3>
            <p>
              What is one thing you could do differently next time? Share your reason with your
              squad.
            </p>
            <div className="note">
              Preview skill: <strong>{scenario.skill}</strong>. Completing this sample adds a demo
              Guardian to your collection; real skill criteria are still to be built.
            </div>
          </>
        )}
      </div>
      {step !== 3 && (
        <button
          className="primary-button full"
          onClick={() => {
            if (step === 5) {
              completePreview(scenario.id, scenario.guardian);
              onClose();
            } else setStep(step + 1);
          }}
        >
          {step === 5 ? 'Finish preview' : `Continue to ${phases[step + 1]}`}
          <ArrowRight size={18} />
        </button>
      )}
    </Modal>
  );
}
