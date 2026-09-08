import { useState, type FormEvent, type ReactNode } from 'react';
import { CheckCircle2, Rocket, Zap, ArrowRight } from 'lucide-react';
import { GuardianPlate } from '../guardians/GuardianArt';
import { guardians } from '../guardians/data';
import {
  COMPETENCY_LABEL,
  type Competency,
} from '../../../types/guardians.js';
import { Button } from '../../design-system/DesignSystem';
import {
  SIMULATED_COHORTS,
  TARGET_GROUPS,
  TARGET_GROUP_AGE,
  type AdminScenarioRow,
  type FlashMissionDraft,
  type SimulatedCohortId,
  type TargetGroup,
} from '../../../types/admin.js';

const COMPETENCIES = Object.keys(COMPETENCY_LABEL) as Competency[];

const EXAMPLE: FlashMissionDraft = {
  title: 'Fake Job Offer',
  category: 'Money Mule Recruitment',
  targetGroup: 'Post-Secondary / Tertiary',
  prompt:
    'An online recruiter says you can earn commission by receiving and forwarding payments.',
  choices: [
    'Accept the offer and start earning',
    'Ask for company registration details',
    'Reject and verify independently through official job portals',
  ],
  safeChoiceIndex: 2,
  safeResponse:
    'Verify unexpected offers independently and do not allow others to use your account to receive or transfer funds.',
  competency: 'SPOT',
  guardianId: guardians[0].id,
  debrief:
    'Commission for moving money through your own account is money mule recruitment, not a job.',
  warningSigns: ['Easy money', 'Urgency', 'Use of personal account'],
  cohorts: ['tertiary'],
  status: 'LIVE',
};

const labelCls =
  'block text-[11px] font-bold uppercase tracking-[0.12em] text-ink-muted';
const fieldCls =
  'mt-1.5 w-full min-h-[44px] rounded-[6px] border border-line-strong bg-surface px-3 py-2 text-[14px] text-ink outline-none transition placeholder:text-ink-soft focus:border-civic-500';

export function FlashMissionPanel({
  deployed,
  onDeploy,
  onCancel,
  onViewLibrary,
  onDone,
}: {
  deployed: AdminScenarioRow | null;
  onDeploy: (draft: FlashMissionDraft) => Promise<void>;
  onCancel: () => void;
  onViewLibrary: () => void;
  onDone: () => void;
}) {
  const [draft, setDraft] = useState<FlashMissionDraft>(EXAMPLE);
  const [submitting, setSubmitting] = useState(false);

  const set = <K extends keyof FlashMissionDraft>(
    key: K,
    value: FlashMissionDraft[K],
  ) => setDraft((prev) => ({ ...prev, [key]: value }));

  const setChoice = (index: 0 | 1 | 2, value: string) =>
    setDraft((prev) => {
      const choices: [string, string, string] = [...prev.choices];
      choices[index] = value;
      return { ...prev, choices };
    });

  const toggleCohort = (id: SimulatedCohortId) =>
    setDraft((prev) => ({
      ...prev,
      cohorts: prev.cohorts.includes(id)
        ? prev.cohorts.filter((c) => c !== id)
        : [...prev.cohorts, id],
    }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      await onDeploy(draft);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedGuardian =
    guardians.find((g) => g.id === draft.guardianId) ?? guardians[0];

  if (deployed) {
    return (
      <div className="flex h-full min-h-0 flex-col bg-surface">
        <div className="shrink-0 border-b border-line bg-leaf-50 p-6">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-leaf-600 text-white">
              <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-[19px] font-extrabold text-leaf-800">
                {deployed.status === 'LIVE'
                  ? 'Flash Mission deployed live'
                  : 'Flash Mission draft saved'}
              </h2>
              <p className="mt-0.5 text-[13px] text-leaf-700">
                {deployed.status === 'LIVE'
                  ? `Published to the ${deployed.targetGroup} cohort.`
                  : 'Saved to the Scenario Library as a draft.'}
              </p>
            </div>
          </div>
        </div>

        <div className="thin-scroll min-h-0 flex-1 space-y-4 overflow-y-auto p-6">
          <div className="rounded-[16px] border border-line bg-surface-sunk p-4">
            <span className="inline-block rounded-[6px] border border-civic-200 bg-civic-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-civic-700">
              Flash Mission
            </span>
            <h3 className="mt-2 text-[17px] font-extrabold text-navy-900">
              {deployed.title}
            </h3>
            <p className="mt-0.5 text-[13px] text-ink-muted">
              {deployed.category} · {deployed.targetGroup}
            </p>
            <p className="mt-3 text-[14px] leading-relaxed text-ink">
              {draft.prompt}
            </p>
          </div>

          <div className="rounded-[16px] border border-line bg-surface p-4">
            <p className={labelCls}>Debrief note</p>
            <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">
              {draft.debrief}
            </p>
          </div>
        </div>

        <footer className="flex shrink-0 flex-wrap items-center justify-end gap-3 border-t border-line bg-surface-sunk p-4">
          <button
            type="button"
            onClick={onViewLibrary}
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-[6px] border border-line px-4 text-[13px] font-bold text-ink transition hover:border-civic-300 hover:text-civic-700"
          >
            View in Scenario Library
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onDone}
            className="inline-flex min-h-[44px] items-center rounded-[6px] bg-navy-900 px-5 text-[13px] font-bold text-white transition hover:bg-navy-800"
          >
            Done
          </button>
        </footer>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex h-full min-h-0 flex-col bg-surface">
      <header className="shrink-0 border-b border-line bg-surface-sunk px-6 py-5 pr-14">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-[6px] border border-civic-200 bg-civic-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-civic-700">
            <Zap className="h-3 w-3" aria-hidden="true" />
            Fast-turnaround authoring
          </span>
        </div>
        <h2
          id="flash-mission-title"
          className="mt-1.5 text-[20px] font-extrabold tracking-tight text-navy-900"
        >
          Deploy Flash Mission
        </h2>
        <p className="mt-0.5 text-[13px] text-ink-muted">
          Compose and publish a targeted situation to youth cohorts in minutes.
        </p>
      </header>

      <div className="thin-scroll min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-5">
        <FormSection index={1} title="Metadata">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="fm-title" className={labelCls}>
                Mission title
              </label>
              <input
                id="fm-title"
                required
                value={draft.title}
                onChange={(e) => set('title', e.target.value)}
                className={fieldCls}
                placeholder="e.g. The Concert Ticket Deposit"
              />
            </div>

            <div>
              <label htmlFor="fm-category" className={labelCls}>
                Scam / Threat category
              </label>
              <input
                id="fm-category"
                required
                value={draft.category}
                onChange={(e) => set('category', e.target.value)}
                className={fieldCls}
                placeholder="e.g. E-Commerce Scam"
              />
            </div>

            <div>
              <label htmlFor="fm-audience" className={labelCls}>
                Target cohort
              </label>
              <select
                id="fm-audience"
                value={draft.targetGroup}
                onChange={(e) => set('targetGroup', e.target.value as TargetGroup)}
                className={fieldCls}
              >
                {TARGET_GROUPS.map((g) => (
                  <option key={g} value={g}>
                    {g} {TARGET_GROUP_AGE[g]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="fm-status" className={labelCls}>
                Deployment status
              </label>
              <select
                id="fm-status"
                value={draft.status}
                onChange={(e) =>
                  set('status', e.target.value as FlashMissionDraft['status'])
                }
                className={fieldCls}
              >
                <option value="LIVE">Live — publishes immediately</option>
                <option value="DRAFT">Draft — save without publishing</option>
              </select>
            </div>
          </div>
        </FormSection>

        <FormSection index={2} title="Situation prompt">
          <label htmlFor="fm-prompt" className={labelCls}>
            Prompt presented to the player
          </label>
          <textarea
            id="fm-prompt"
            required
            rows={3}
            value={draft.prompt}
            onChange={(e) => set('prompt', e.target.value)}
            className={`${fieldCls} resize-none`}
            placeholder="Describe the situation, pressure or request..."
          />
        </FormSection>

        <FormSection index={3} title="Decision choices">
          <p className="text-[12px] text-ink-soft">
            Mark which option represents the intended learning choice. This is
            author-facing only.
          </p>
          <div className="mt-3 space-y-2.5">
            {([0, 1, 2] as const).map((i) => {
              const isSafe = draft.safeChoiceIndex === i;
              return (
                <div
                  key={i}
                  className={`rounded-[16px] border p-3 transition ${
                    isSafe ? 'border-leaf-600 bg-leaf-50' : 'border-line bg-surface-sunk'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[6px] border border-line-strong bg-surface text-[13px] font-bold text-ink-muted">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <input
                      required
                      aria-label={`Choice ${String.fromCharCode(65 + i)}`}
                      value={draft.choices[i]}
                      onChange={(e) => setChoice(i, e.target.value)}
                      className={`${fieldCls} mt-0`}
                    />
                  </div>
                  <label className="mt-2 flex cursor-pointer items-center gap-2 pl-10 text-[12px] font-semibold text-ink-muted">
                    <input
                      type="radio"
                      name="fm-safe-choice"
                      checked={isSafe}
                      onChange={() => set('safeChoiceIndex', i)}
                      className="h-4 w-4"
                    />
                    Intended learning response
                    {isSafe && (
                      <span className="rounded bg-leaf-600 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white">
                        Author only
                      </span>
                    )}
                  </label>
                </div>
              );
            })}
          </div>
        </FormSection>

        <FormSection index={4} title="Learning alignment">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="fm-skill" className={labelCls}>
                S.H.I.E.L.D. skill
              </label>
              <select
                id="fm-skill"
                value={draft.competency}
                onChange={(e) => set('competency', e.target.value as Competency)}
                className={fieldCls}
              >
                {COMPETENCIES.map((k) => (
                  <option key={k} value={k}>
                    {COMPETENCY_LABEL[k]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="fm-guardian" className={labelCls}>
                Strengthens Guardian
              </label>
              <div className="mt-1.5 flex items-center gap-3">
                <GuardianPlate guardian={selectedGuardian} className="h-10 w-10 rounded-[10px]" />
                <select
                  id="fm-guardian"
                  value={draft.guardianId}
                  onChange={(e) => set('guardianId', e.target.value)}
                  className="min-h-[44px] flex-1 rounded-[6px] border border-line-strong bg-surface px-3 py-2 text-[14px] text-ink outline-none"
                >
                  {guardians.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({COMPETENCY_LABEL[g.competency]})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="fm-safe-resp" className={labelCls}>
                Safe response explanation
              </label>
              <textarea
                id="fm-safe-resp"
                required
                rows={2}
                value={draft.safeResponse}
                onChange={(e) => set('safeResponse', e.target.value)}
                className={`${fieldCls} resize-none`}
                placeholder="What principle explains why this choice holds up..."
              />
            </div>
          </div>
        </FormSection>

        <FormSection index={5} title="Debrief &amp; warning signs">
          <div className="space-y-4">
            <div>
              <label htmlFor="fm-debrief" className={labelCls}>
                Closing debrief message
              </label>
              <textarea
                id="fm-debrief"
                required
                rows={2}
                value={draft.debrief}
                onChange={(e) => set('debrief', e.target.value)}
                className={`${fieldCls} resize-none`}
                placeholder="The takeaway shown after deciding..."
              />
            </div>

            <div>
              <label htmlFor="fm-warning-signs" className={labelCls}>
                Warning signs tags (comma-separated)
              </label>
              <input
                id="fm-warning-signs"
                value={draft.warningSigns.join(', ')}
                onChange={(e) =>
                  set(
                    'warningSigns',
                    e.target.value
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean),
                  )
                }
                className={fieldCls}
                placeholder="e.g. Easy money, Urgency, Off-platform payment"
              />
            </div>
          </div>
        </FormSection>

        <FormSection index={6} title="Simulated distribution cohorts">
          <div className="grid gap-2 sm:grid-cols-2">
            {SIMULATED_COHORTS.map(({ id, label }) => {
              const checked = draft.cohorts.includes(id);
              return (
                <label
                  key={id}
                  className={`flex min-h-[44px] cursor-pointer items-center gap-2.5 rounded-[6px] border p-2.5 text-[13px] font-semibold transition ${
                    checked
                      ? 'border-civic-500 bg-civic-50 text-civic-900'
                      : 'border-line bg-surface text-ink-muted'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleCohort(id)}
                    className="h-4 w-4"
                  />
                  <span>{label}</span>
                </label>
              );
            })}
          </div>
        </FormSection>
      </div>

      <footer className="flex shrink-0 flex-wrap items-center justify-end gap-3 border-t border-line bg-surface-sunk p-4">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={submitting}
          leftIcon={<Rocket className="h-4 w-4" aria-hidden="true" />}
        >
          {draft.status === 'LIVE' ? 'Deploy flash mission' : 'Save draft'}
        </Button>
      </footer>
    </form>
  );
}

function FormSection({
  index,
  title,
  children,
}: {
  index: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-2 border-b border-line pb-5">
      <div className="flex items-center gap-2">
        <span
          aria-hidden="true"
          className="grid h-5 w-5 place-items-center rounded-full bg-navy-100 text-[10px] font-bold text-navy-800"
        >
          {index}
        </span>
        <h3 className="text-[14px] font-bold text-navy-900">{title}</h3>
      </div>
      <div>{children}</div>
    </section>
  );
}
