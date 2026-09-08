import { useEffect, useState, type ReactNode } from 'react';
import {
  CircleSlash,
  FileEdit,
  Lock,
  PencilLine,
  ShieldAlert,
  UserRoundSearch,
  Users,
} from 'lucide-react';
import { YouthMissionStatusChip } from './YouthMissionQueue';
import {
  COMPETENCY_LABEL,
  COMPETENCY_LETTER,
} from '../../../types/guardians.js';
import {
  TARGET_GROUP_AGE,
  type YouthMissionDecision,
  type YouthMissionSubmission,
} from '../../../types/admin.js';

export function YouthMissionPanel({
  submission,
  onDecide,
  onClose,
}: {
  submission: YouthMissionSubmission;
  onDecide: (
    id: string,
    decision: YouthMissionDecision,
    note: string,
  ) => void;
  onClose: () => void;
}) {
  const [note, setNote] = useState(submission.reviewNote ?? '');

  useEffect(() => {
    setNote(submission.reviewNote ?? '');
  }, [submission.id, submission.reviewNote]);

  const decide = (decision: YouthMissionDecision) => {
    onDecide(submission.id, decision, note.trim());
    onClose();
  };

  return (
    <div className="flex h-full flex-col bg-surface">
      <header className="border-b border-line bg-surface-sunk px-6 py-5 pr-14">
        <div className="flex flex-wrap items-center gap-2">
          <YouthMissionStatusChip status={submission.status} />
          <span className="inline-flex items-center gap-1 rounded-[6px] border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-amber-700">
            <Lock className="h-2.5 w-2.5" aria-hidden="true" />
            Simulated submission
          </span>
        </div>
        <h2
          id="youth-mission-title"
          className="mt-2 text-[19px] font-extrabold tracking-tight text-navy-900"
        >
          {submission.title}
        </h2>
        <p className="mt-0.5 text-[13px] text-ink-muted">
          {submission.category}
        </p>
      </header>

      <div className="thin-scroll flex-1 space-y-5 overflow-y-auto px-6 py-5">
        <Field label="The idea, as submitted">
          <p className="text-[14px] leading-relaxed text-ink">
            {submission.summary}
          </p>
        </Field>

        <Field label="What the submitter says it teaches">
          <p className="text-[14px] leading-relaxed text-ink">
            {submission.intendedLesson}
          </p>
        </Field>

        <Field label="Proposed audience band">
          <p className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-ink">
            <Users className="h-4 w-4 text-ink-soft" aria-hidden="true" />
            <span>{submission.suggestedBand}</span>
            <span className="text-ink-muted">
              {TARGET_GROUP_AGE[submission.suggestedBand]}
            </span>
          </p>
        </Field>

        <Field label="Proposed S.H.I.E.L.D. skill">
          <p className="inline-flex items-center gap-1.5 text-[14px] font-bold text-navy-900">
            <span
              aria-hidden="true"
              className="grid h-4 w-4 place-items-center rounded bg-navy-900 text-[9px] font-extrabold text-white"
            >
              {COMPETENCY_LETTER[submission.proposedCompetency]}
            </span>
            {COMPETENCY_LABEL[submission.proposedCompetency]}
          </p>
        </Field>

        <Field label="Safeguarding points to weigh">
          <div className="rounded-[16px] border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide text-amber-700">
              <ShieldAlert className="h-4 w-4 shrink-0" aria-hidden="true" />
              Reviewer checklist
            </div>
            <ul className="mt-2 space-y-2">
              {submission.safeguardingFlags.map((flag) => (
                <li
                  key={flag}
                  className="flex items-start gap-2 text-[13px] leading-relaxed text-amber-900"
                >
                  <span
                    aria-hidden="true"
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-700"
                  />
                  <span>{flag}</span>
                </li>
              ))}
            </ul>
          </div>
        </Field>

        <Field label="Reviewer notes">
          <textarea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Document safeguarding considerations or requested revisions..."
            className="w-full min-h-[44px] rounded-[6px] border border-line-strong bg-surface p-3 text-[13.5px] outline-none transition placeholder:text-ink-soft focus:border-civic-500"
          />
        </Field>

        <div className="rounded-[16px] border border-line bg-surface-sunk p-3.5 text-[12px] text-ink-muted">
          <p className="flex items-center gap-1 font-semibold text-navy-900">
            <UserRoundSearch className="h-3.5 w-3.5 text-civic-700" />
            Submitter identity safeguards
          </p>
          <p className="mt-1">
            Submitter is recorded only as{' '}
            <strong className="font-bold text-navy-900">{submission.submittedBy}</strong>{' '}
            ({submission.submitterBand}). No personal data, school, class or
            contact detail exists.
          </p>
        </div>
      </div>

      <footer className="space-y-2 border-t border-line bg-surface-sunk p-4">
        <button
          type="button"
          onClick={() => decide('CONVERTED')}
          className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-[6px] bg-leaf-600 px-4 text-[13.5px] font-bold text-white shadow-sm transition hover:bg-leaf-700"
        >
          <FileEdit className="h-4 w-4" />
          Convert to scenario draft
        </button>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => decide('CHANGES_REQUESTED')}
            className="inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-[6px] border border-line bg-surface px-3 text-[12.5px] font-semibold text-ink transition hover:border-civic-300"
          >
            <PencilLine className="h-3.5 w-3.5 text-civic-700" />
            Request changes
          </button>
          <button
            type="button"
            onClick={() => decide('REJECTED')}
            className="inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-[6px] border border-line bg-surface px-3 text-[12.5px] font-semibold text-coral-700 transition hover:border-coral-200 hover:bg-coral-50"
          >
            <CircleSlash className="h-3.5 w-3.5" />
            Do not take forward
          </button>
        </div>
      </footer>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-muted">
        {label}
      </p>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
