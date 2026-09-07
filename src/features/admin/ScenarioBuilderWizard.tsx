import { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Plus,
  Save,
  Smartphone,
  Sparkles,
  Trash2,
} from 'lucide-react';

interface ScenarioBuilderProps {
  onClose: () => void;
  onSaveScenario: (scenario: any) => void;
}

export function ScenarioBuilderWizard({ onClose, onSaveScenario }: ScenarioBuilderProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [savedStatus, setSavedStatus] = useState<'saved' | 'saving'>('saved');

  // Form State
  const [title, setTitle] = useState('Telegram "Mystery Shopper" Commission');
  const [theme, setTheme] = useState('Job Scam / Money Muling');
  const [learnerBand, setLearnerBand] = useState('Upper Secondary (15-16)');
  const [difficulty, setDifficulty] = useState<'Standard' | 'Introductory' | 'Advanced'>('Standard');
  const [learningObjective, setLearningObjective] = useState(
    'Recognize that receiving funds on behalf of unknown employers carries statutory money-muling liability under the CDSA.',
  );

  const [intro, setIntro] = useState(
    'A recruiter reaches out via Telegram offering $150 per day to evaluate luxury items by receiving funds and buying gift cards.',
  );
  const [warningSigns, setWarningSigns] = useState<string[]>([
    'Unsolicited messaging from unknown numbers',
    'High commission for low-effort tasks',
    'Requesting funds to flow through personal bank accounts',
  ]);
  const [newWarningSign, setNewWarningSign] = useState('');

  const [choices, setChoices] = useState([
    {
      label: 'A',
      text: 'Accept the job and provide your PayNow number to receive the first test payout.',
      immediateOutcome: 'You receive $500 PayNow and feel excited about the easy earnings.',
      trustChange: -15,
      riskChange: +35,
      coinChange: +150,
    },
    {
      label: 'B',
      text: 'Ask the recruiter for their company UEN, official ACRA registration, and physical office address.',
      immediateOutcome: 'The recruiter deletes their profile and chat history immediately.',
      trustChange: +20,
      riskChange: -20,
      coinChange: +20,
    },
    {
      label: 'C',
      text: 'Decline the offer, take a screenshot, and report the account to Telegram and ScamShield.',
      immediateOutcome: 'You safely block the recruitment lure and protect others from falling prey.',
      trustChange: +30,
      riskChange: -30,
      coinChange: +40,
    },
  ]);

  const [delayedEvent, setDelayedEvent] = useState(
    'Police freeze your personal bank account. Commercial Affairs Department issues a formal interview notice for money-laundering facilitation.',
  );
  const [learningTakeaway, setLearningTakeaway] = useState(
    'Under Singapore law, allowing your bank account to receive or transfer funds for strangers makes you an accomplice to money laundering, carrying severe fines and imprisonment.',
  );

  const [competency, setCompetency] = useState<'SPOT' | 'HOLD' | 'IDENTIFY' | 'EVALUATE' | 'LEAD' | 'DEFEND'>('DEFEND');

  const [thinkPrompt, setThinkPrompt] = useState('Why would a legitimate business need you to receive money through your personal PayNow?');
  const [explainPrompt, setExplainPrompt] = useState('How would you convince a classmate who insists this is "free money"?');
  const [debriefQuestion, setDebriefQuestion] = useState('What are the statutory consequences of a frozen bank account for a student?');

  const triggerAutosave = () => {
    setSavedStatus('saving');
    setTimeout(() => setSavedStatus('saved'), 600);
  };

  const handleAddWarning = () => {
    if (newWarningSign.trim()) {
      setWarningSigns([...warningSigns, newWarningSign.trim()]);
      setNewWarningSign('');
      triggerAutosave();
    }
  };

  const handleRemoveWarning = (index: number) => {
    setWarningSigns(warningSigns.filter((_, i) => i !== index));
    triggerAutosave();
  };

  const handleSubmit = (finalStatus: 'draft' | 'under_review' | 'published') => {
    const payload = {
      id: `custom-${Date.now()}`,
      title,
      theme,
      learnerBand,
      difficulty,
      learningObjective,
      intro,
      warningSigns,
      choices,
      delayedEvent,
      learningTakeaway,
      competency,
      discussion: { thinkPrompt, explainPrompt, debriefQuestion },
      status: finalStatus,
    };
    onSaveScenario(payload);
    onClose();
  };

  const steps = [
    'Details',
    'Context',
    'Decisions',
    'Consequences',
    'Skills',
    'Discussion',
    'Preview',
    'Review',
  ];

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm text-slate-800">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-200/80 bg-slate-50/80 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-civic-600 text-white shadow-sm">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-navy-950">
              Scenario Builder Wizard
            </h2>
            <p className="text-[11px] font-bold text-slate-500">
              Authoring interactive youth crime prevention content
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
            <Save className="h-3.5 w-3.5 text-slate-400" />
            <span>{savedStatus === 'saving' ? 'Autosaving…' : 'Autosaved'}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 shadow-sm"
          >
            Exit Builder
          </button>
        </div>
      </div>

      {/* Step Progress Tracker */}
      <div className="border-b border-slate-200/80 bg-white px-6 py-4">
        <div className="flex items-center justify-between gap-1 overflow-x-auto">
          {steps.map((label, idx) => {
            const stepNumber = idx + 1;
            const isActive = stepNumber === currentStep;
            const isPast = stepNumber < currentStep;
            return (
              <button
                key={label}
                type="button"
                onClick={() => setCurrentStep(stepNumber)}
                className="flex flex-col items-center gap-1.5 text-center min-w-[50px] group"
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-black transition ${
                    isActive
                      ? 'bg-amber-400 text-navy-950 shadow-sm ring-2 ring-amber-400/40'
                      : isPast
                        ? 'bg-civic-600 text-white'
                        : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                  }`}
                >
                  {stepNumber}
                </div>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider hidden sm:inline ${
                    isActive ? 'text-amber-700 font-extrabold' : isPast ? 'text-slate-700' : 'text-slate-400'
                  }`}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Wizard Step Body */}
      <div className="flex-1 overflow-y-auto p-6 sm:p-8 min-h-[420px]">
        {/* STEP 1: Scenario Details */}
        {currentStep === 1 && (
          <div className="max-w-2xl space-y-4">
            <div>
              <h3 className="text-lg font-black tracking-tight text-navy-950">
                Step 1: Scenario Details
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Define the primary thematic area, target learner band, and learning objective.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">Scenario Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  triggerAutosave();
                }}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:border-civic-500 focus:ring-1 focus:ring-civic-500 focus:outline-none shadow-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700">Theme</label>
                <select
                  value={theme}
                  onChange={(e) => {
                    setTheme(e.target.value);
                    triggerAutosave();
                  }}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:border-civic-500 focus:ring-1 focus:ring-civic-500 focus:outline-none shadow-sm"
                >
                  <option>Job Scam / Money Muling</option>
                  <option>E-Commerce Fraud</option>
                  <option>Phishing & Credential Theft</option>
                  <option>Account Lending & Misuse</option>
                  <option>Cyberbullying & Peer Pressure</option>
                  <option>Retail Coercion & Shoplifting</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">Target Learner Band</label>
                <select
                  value={learnerBand}
                  onChange={(e) => {
                    setLearnerBand(e.target.value);
                    triggerAutosave();
                  }}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:border-civic-500 focus:ring-1 focus:ring-civic-500 focus:outline-none shadow-sm"
                >
                  <option>Lower Secondary (13-14)</option>
                  <option>Upper Secondary (15-16)</option>
                  <option>Post-Secondary (ITE/Poly/JC)</option>
                  <option>Youth Community</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">Difficulty</label>
              <div className="mt-1.5 flex gap-3">
                {(['Introductory', 'Standard', 'Advanced'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => {
                      setDifficulty(lvl);
                      triggerAutosave();
                    }}
                    className={`rounded-xl border px-4 py-2 text-xs font-bold transition shadow-sm ${
                      difficulty === lvl
                        ? 'border-amber-400 bg-amber-50 text-amber-900 ring-1 ring-amber-400'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">Learning Objective</label>
              <textarea
                rows={3}
                value={learningObjective}
                onChange={(e) => {
                  setLearningObjective(e.target.value);
                  triggerAutosave();
                }}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:border-civic-500 focus:ring-1 focus:ring-civic-500 focus:outline-none shadow-sm"
              />
            </div>
          </div>
        )}

        {/* STEP 2: Scenario Context */}
        {currentStep === 2 && (
          <div className="max-w-2xl space-y-4">
            <div>
              <h3 className="text-lg font-black tracking-tight text-navy-950">
                Step 2: Scenario Narrative & Context
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Write the narrative prompt that youths will read in the mission card.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">Introduction Narrative</label>
              <textarea
                rows={4}
                value={intro}
                onChange={(e) => {
                  setIntro(e.target.value);
                  triggerAutosave();
                }}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:border-civic-500 focus:ring-1 focus:ring-civic-500 focus:outline-none shadow-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">Warning Signs (Red Flags)</label>
              <div className="mt-2 space-y-2">
                {warningSigns.map((ws, i) => (
                  <div key={i} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs">
                    <span className="text-slate-800 font-medium">{ws}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveWarning(i)}
                      className="text-slate-400 hover:text-rose-600 transition"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={newWarningSign}
                    onChange={(e) => setNewWarningSign(e.target.value)}
                    placeholder="Add another red flag or risk signal..."
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-civic-500 focus:outline-none shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={handleAddWarning}
                    className="rounded-xl bg-civic-600 px-3 py-2 text-xs font-bold text-white hover:bg-civic-700 shadow-sm"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Decision Options */}
        {currentStep === 3 && (
          <div className="max-w-3xl space-y-6">
            <div>
              <h3 className="text-lg font-black tracking-tight text-navy-950">
                Step 3: Decision Options
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Configure choices, immediate outcomes, and status adjustments (Trust, Risk, Coins).
              </p>
            </div>

            <div className="space-y-4">
              {choices.map((c, idx) => (
                <div key={idx} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-400 text-xs font-black text-navy-950">
                      {c.label}
                    </span>
                    <span className="text-xs font-bold text-slate-500">Choice {idx + 1}</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700">Option Text</label>
                    <input
                      type="text"
                      value={c.text}
                      onChange={(e) => {
                        const updated = [...choices];
                        updated[idx]!.text = e.target.value;
                        setChoices(updated);
                        triggerAutosave();
                      }}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2 text-xs text-slate-900 shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700">Immediate Outcome</label>
                    <input
                      type="text"
                      value={c.immediateOutcome}
                      onChange={(e) => {
                        const updated = [...choices];
                        updated[idx]!.immediateOutcome = e.target.value;
                        setChoices(updated);
                        triggerAutosave();
                      }}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2 text-xs text-slate-900 shadow-sm"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="block text-[10px] font-bold text-slate-600">Trust Impact</span>
                      <input
                        type="number"
                        value={c.trustChange}
                        onChange={(e) => {
                          const updated = [...choices];
                          updated[idx]!.trustChange = Number(e.target.value);
                          setChoices(updated);
                          triggerAutosave();
                        }}
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-1.5 text-xs text-slate-900 shadow-sm"
                      />
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-600">Risk Impact</span>
                      <input
                        type="number"
                        value={c.riskChange}
                        onChange={(e) => {
                          const updated = [...choices];
                          updated[idx]!.riskChange = Number(e.target.value);
                          setChoices(updated);
                          triggerAutosave();
                        }}
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-1.5 text-xs text-slate-900 shadow-sm"
                      />
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-600">Coins</span>
                      <input
                        type="number"
                        value={c.coinChange}
                        onChange={(e) => {
                          const updated = [...choices];
                          updated[idx]!.coinChange = Number(e.target.value);
                          setChoices(updated);
                          triggerAutosave();
                        }}
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-1.5 text-xs text-slate-900 shadow-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: Delayed Consequences */}
        {currentStep === 4 && (
          <div className="max-w-2xl space-y-4">
            <div>
              <h3 className="text-lg font-black tracking-tight text-navy-950">
                Step 4: Delayed Consequences
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Explain what happens days or weeks after the choice: legal notifications, frozen accounts, or police action.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">Delayed Event</label>
              <textarea
                rows={3}
                value={delayedEvent}
                onChange={(e) => {
                  setDelayedEvent(e.target.value);
                  triggerAutosave();
                }}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:border-civic-500 focus:outline-none shadow-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">Learning Takeaway & Legal Notice</label>
              <textarea
                rows={4}
                value={learningTakeaway}
                onChange={(e) => {
                  setLearningTakeaway(e.target.value);
                  triggerAutosave();
                }}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:border-civic-500 focus:outline-none shadow-sm"
              />
            </div>
          </div>
        )}

        {/* STEP 5: S.H.I.E.L.D. Mapping */}
        {currentStep === 5 && (
          <div className="max-w-2xl space-y-4">
            <div>
              <h3 className="text-lg font-black tracking-tight text-navy-950">
                Step 5: S.H.I.E.L.D. Competency Mapping
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Select which Guardian capability this scenario exercises.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
              {[
                { id: 'SPOT', name: 'VeriFox · SPOT', desc: 'Detect fake domains and urgency lures' },
                { id: 'HOLD', name: 'Echo · HOLD', desc: 'Pause before sending OTP or payments' },
                { id: 'IDENTIFY', name: 'Cluepaw · IDENTIFY', desc: 'Verify seller background & ratings' },
                { id: 'EVALUATE', name: 'ByteBuddy · EVALUATE', desc: 'Examine suspicious task commissions' },
                { id: 'LEAD', name: 'Beacon · LEAD', desc: 'Step up and guide peers away from traps' },
                { id: 'DEFEND', name: 'Shieldfin · DEFEND', desc: 'Protect Singpass and bank accounts' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setCompetency(item.id as any);
                    triggerAutosave();
                  }}
                  className={`rounded-2xl border p-4 text-left transition shadow-sm ${
                    competency === item.id
                      ? 'border-amber-400 bg-amber-50 ring-1 ring-amber-400'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-xs font-black uppercase text-navy-950">{item.name}</div>
                  <p className="mt-1 text-[11px] text-slate-500">{item.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 6: Peer Discussion Prompts */}
        {currentStep === 6 && (
          <div className="max-w-2xl space-y-4">
            <div>
              <h3 className="text-lg font-black tracking-tight text-navy-950">
                Step 6: Peer Discussion Prompts
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Author questions for the Think–Vote–Explain squad conversation and facilitator debrief.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">Think Prompt (Private Reflection)</label>
              <input
                type="text"
                value={thinkPrompt}
                onChange={(e) => {
                  setThinkPrompt(e.target.value);
                  triggerAutosave();
                }}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 shadow-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">Explain Prompt (Squad Debate)</label>
              <input
                type="text"
                value={explainPrompt}
                onChange={(e) => {
                  setExplainPrompt(e.target.value);
                  triggerAutosave();
                }}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 shadow-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">Debrief Question (Whole Class)</label>
              <input
                type="text"
                value={debriefQuestion}
                onChange={(e) => {
                  setDebriefQuestion(e.target.value);
                  triggerAutosave();
                }}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 shadow-sm"
              />
            </div>
          </div>
        )}

        {/* STEP 7: Mobile Live Preview */}
        {currentStep === 7 && (
          <div className="flex flex-col items-center">
            <div className="mb-4 flex items-center gap-2 text-xs font-bold text-slate-600">
              <Smartphone className="h-4 w-4 text-civic-600" />
              <span>Player PWA Live Preview</span>
            </div>

            {/* Mobile Phone Mockup */}
            <div className="w-[340px] rounded-[36px] border-4 border-slate-800 bg-navy-950 p-4 shadow-xl">
              <div className="mx-auto h-4 w-28 rounded-full bg-slate-800 mb-3" />
              <div className="space-y-3 text-white">
                <div className="flex items-center justify-between text-[10px] font-bold text-amber-400">
                  <span>{theme}</span>
                  <span>{difficulty}</span>
                </div>
                <h4 className="text-sm font-black uppercase text-white">{title}</h4>
                <p className="text-[11px] text-slate-300 leading-snug">{intro}</p>

                <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-2.5">
                  <span className="text-[9px] font-black uppercase text-amber-300">Warning Signs:</span>
                  <ul className="mt-1 list-disc pl-3 text-[10px] text-slate-300">
                    {warningSigns.map((ws, idx) => (
                      <li key={idx}>{ws}</li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-1.5 pt-1">
                  {choices.map((c, i) => (
                    <div key={i} className="rounded-lg border border-white/15 bg-white/5 p-2 text-[10px]">
                      <span className="font-bold text-amber-300">Option {c.label}: </span>
                      {c.text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 8: Submit for Review */}
        {currentStep === 8 && (
          <div className="max-w-2xl space-y-5">
            <div>
              <h3 className="text-lg font-black tracking-tight text-navy-950">
                Step 8: Submission & Governance Workflow
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Review scenario parameters before saving or submitting for institutional peer evaluation.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-bold">Title:</span>
                <span className="font-extrabold text-navy-950">{title}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-bold">Theme:</span>
                <span className="font-extrabold text-navy-950">{theme}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-bold">Competency:</span>
                <span className="font-extrabold text-amber-600">{competency}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-bold">Choices Authored:</span>
                <span className="font-extrabold text-navy-950">{choices.length} options</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-4">
              <button
                type="button"
                onClick={() => handleSubmit('draft')}
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm"
              >
                Save as Draft
              </button>
              <button
                type="button"
                onClick={() => handleSubmit('under_review')}
                className="rounded-xl bg-amber-500 px-6 py-3 text-xs font-black uppercase tracking-wider text-navy-950 shadow-sm hover:bg-amber-400"
              >
                Submit for Institutional Review
              </button>
              <button
                type="button"
                onClick={() => handleSubmit('published')}
                className="rounded-xl bg-emerald-600 px-6 py-3 text-xs font-black uppercase tracking-wider text-white shadow-sm hover:bg-emerald-500"
              >
                Publish to Active Catalogue
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer Wizard Controls */}
      <div className="flex items-center justify-between border-t border-slate-200/80 bg-slate-50/80 px-6 py-4">
        <button
          type="button"
          disabled={currentStep === 1}
          onClick={() => setCurrentStep(currentStep - 1)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Previous</span>
        </button>

        <span className="text-xs font-bold text-slate-500">
          Step {currentStep} of {steps.length}
        </span>

        {currentStep < steps.length ? (
          <button
            type="button"
            onClick={() => setCurrentStep(currentStep + 1)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-civic-600 px-5 py-2 text-xs font-black uppercase tracking-wider text-white hover:bg-civic-700 shadow-sm"
          >
            <span>Next</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => handleSubmit('published')}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-black uppercase tracking-wider text-white hover:bg-emerald-500 shadow-sm"
          >
            <span>Finish & Publish</span>
            <CheckCircle2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
