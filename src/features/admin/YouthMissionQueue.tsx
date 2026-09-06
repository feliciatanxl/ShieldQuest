import {
  CircleSlash,
  FileEdit,
  PencilLine,
  ShieldAlert,
} from 'lucide-react';
import {
  COMPETENCY_LABEL,
  COMPETENCY_LETTER,
} from '../../../types/guardians.js';
import {
  TARGET_GROUP_AGE,
  YOUTH_MISSION_STATUS_LABEL,
  type YouthMissionStatus,
  type YouthMissionSubmission,
} from '../../../types/admin.js';

export const STATUS_TONE: Record<YouthMissionStatus, string> = {
  AWAITING_REVIEW: 'border-amber-200 bg-amber-50 text-amber-700',
  CHANGES_REQUESTED: 'border-civic-200 bg-civic-50 text-civic-700',
  CONVERTED: 'border-leaf-200 bg-leaf-50 text-leaf-700',
  REJECTED: 'border-line bg-surface-sunk text-ink-muted',
};

export const DECISION_ICON = {
  CONVERTED: FileEdit,
  CHANGES_REQUESTED: PencilLine,
  REJECTED: CircleSlash,
} as const;

export function YouthMissionStatusChip({
  status,
}: {
  status: YouthMissionStatus;
}) {
  return (
    <span
      className={`inline-block rounded-md border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${STATUS_TONE[status]}`}
    >
      {YOUTH_MISSION_STATUS_LABEL[status]}
    </span>
  );
}

export function YouthMissionQueue({
  submissions,
  onSelect,
}: {
  submissions: YouthMissionSubmission[];
  onSelect: (submission: YouthMissionSubmission) => void;
}) {
  if (submissions.length === 0) {
    return (
      <p className="rounded-xl border border-line bg-surface px-4 py-8 text-center text-[14px] text-ink-muted">
        Nothing in the queue matches this filter.
      </p>
    );
  }

  return (
    <ul className="grid gap-3 xl:grid-cols-2">
      {submissions.map((submission) => (
        <li key={submission.id}>
          <button
            type="button"
            onClick={() => onSelect(submission)}
            className="flex h-full w-full flex-col rounded-xl border border-line bg-surface p-4 text-left transition hover:border-civic-300 hover:shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h3 className="min-w-0 text-[15px] font-bold leading-snug text-navy-900">
                {submission.title}
              </h3>
              <YouthMissionStatusChip status={submission.status} />
            </div>

            <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-ink-soft">
              <span className="font-semibold text-ink-muted">
                {submission.category}
              </span>
              <span aria-hidden="true">·</span>
              <span>
                {submission.suggestedBand}{' '}
                <span className="tabular-nums">
                  {TARGET_GROUP_AGE[submission.suggestedBand]}
                </span>
              </span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1 font-bold text-navy-900">
                <span
                  aria-hidden="true"
                  className="grid h-3.5 w-3.5 place-items-center rounded bg-navy-900 text-[8px] font-extrabold text-white"
                >
                  {COMPETENCY_LETTER[submission.proposedCompetency]}
                </span>
                {COMPETENCY_LABEL[submission.proposedCompetency]}
              </span>
            </p>

            <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-ink">
              {submission.summary}
            </p>

            {submission.safeguardingFlags.length > 0 && (
              <div className="mt-3 flex items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50/70 px-2.5 py-1 text-[11.5px] font-semibold text-amber-700">
                <ShieldAlert className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>
                  {submission.safeguardingFlags.length} safeguarding point
                  {submission.safeguardingFlags.length === 1 ? '' : 's'} flagged
                </span>
              </div>
            )}

            <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3 text-[11.5px] text-ink-soft">
              <span>
                Submitted by{' '}
                <strong className="font-bold text-navy-900">
                  {submission.submittedBy}
                </strong>{' '}
                ({submission.submitterBand})
              </span>
              <span>{submission.submittedOn}</span>
            </div>
          </button>
        </li>
      ))}
    </ul>
  );
}
