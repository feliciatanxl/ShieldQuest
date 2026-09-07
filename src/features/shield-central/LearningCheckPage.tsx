import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';

interface Question {
  id: string;
  scenario: string;
  options: { text: string; safe: boolean; explanation: string }[];
}

const CHECK_QUESTIONS: Question[] = [
  {
    id: 'q1',
    scenario: 'A Telegram contact promises $250 for using your Singpass to register a crypto account.',
    options: [
      {
        text: 'Refuse immediately and report the user on ScamShield.',
        safe: true,
        explanation: 'Singpass credentials are tied to legal liability; sharing them is a criminal offense under the Computer Misuse Act.',
      },
      {
        text: 'Agree, provided they pay the $250 upfront before you give the details.',
        safe: false,
        explanation: 'Upfront payment does not protect you from criminal liability as an illegal money mule.',
      },
      {
        text: 'Ask a friend to use their Singpass instead so your name stays clean.',
        safe: false,
        explanation: 'Pushing a peer into a crime damages trust and exploits friendships.',
      },
    ],
  },
  {
    id: 'q2',
    scenario: 'You receive an urgent SMS with an overseas bank link saying your account will be suspended in 15 minutes.',
    options: [
      {
        text: 'Click the link right away so you don’t lose access to your savings.',
        safe: false,
        explanation: 'Artificial time limits are engineered to bypass critical pause.',
      },
      {
        text: 'Close the SMS and verify directly with your bank through their verified mobile app or 1799 hotline.',
        safe: true,
        explanation: 'Legitimate banks in Singapore never include clickable links in SMS notifications.',
      },
      {
        text: 'Reply to the SMS asking if it is authentic.',
        safe: false,
        explanation: 'Replying confirms your active phone number to fraudulent automated bots.',
      },
    ],
  },
];

export function LearningCheckPage() {
  const navigate = useNavigate();
  const [activeCheck, setActiveCheck] = useState<'pre' | 'post'>('pre');
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const q = CHECK_QUESTIONS[currentIdx];

  const handleSelectOption = (optionIdx: number) => {
    setAnswers({ ...answers, [q.id]: optionIdx });
  };

  const handleNext = () => {
    if (currentIdx < CHECK_QUESTIONS.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setIsCompleted(true);
    }
  };

  return (
    <div className="flex min-h-full flex-col bg-slate-50 text-slate-800">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-md">
        <button
          type="button"
          onClick={() => navigate('/shield-central')}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-slate-200"
          aria-label="Back to Shield Central"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="text-center">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-600">
            Facilitated Pilot Evaluation
          </span>
          <h1 className="text-base font-extrabold text-navy-900 sm:text-lg">
            Learning Check-In
          </h1>
        </div>
        <Link
          to="/board"
          className="rounded-lg bg-navy-900 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-navy-800"
        >
          Board
        </Link>
      </header>

      {/* Main Content */}
      <main className="mx-auto w-full max-w-xl flex-1 p-4 sm:p-6">
        {!isCompleted ? (
          <div>
            {/* Stage Selector */}
            <div className="grid grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
              <button
                type="button"
                onClick={() => {
                  setActiveCheck('pre');
                  setCurrentIdx(0);
                  setIsCompleted(false);
                }}
                className={`rounded-xl py-2 text-xs font-extrabold transition ${
                  activeCheck === 'pre'
                    ? 'bg-navy-900 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Pre-Session Baseline
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveCheck('post');
                  setCurrentIdx(0);
                  setIsCompleted(false);
                }}
                className={`rounded-xl py-2 text-xs font-extrabold transition ${
                  activeCheck === 'post'
                    ? 'bg-navy-900 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Post-Session Check
              </button>
            </div>

            {/* Question Card */}
            <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold uppercase tracking-wider text-cyan-700">
                  Question {currentIdx + 1} of {CHECK_QUESTIONS.length}
                </span>
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                  Ungraded Check
                </span>
              </div>

              <h2 className="mt-3 text-base font-extrabold text-navy-900 sm:text-lg">
                {q.scenario}
              </h2>

              {/* Options */}
              <div className="mt-5 space-y-2.5">
                {q.options.map((opt, idx) => {
                  const isSelected = answers[q.id] === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectOption(idx)}
                      className={`w-full rounded-2xl border-2 p-3.5 text-left text-xs font-bold transition active:scale-[0.98] sm:text-sm ${
                        isSelected
                          ? 'border-cyan-600 bg-cyan-50/80 text-cyan-950'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-current text-[11px]">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="leading-relaxed">{opt.text}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                disabled={answers[q.id] === undefined}
                onClick={handleNext}
                className="mt-6 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-navy-900 text-sm font-extrabold text-white transition hover:bg-navy-800 disabled:opacity-40"
              >
                {currentIdx < CHECK_QUESTIONS.length - 1 ? 'Next Question' : 'Complete Survey'}
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center animate-in fade-in duration-200">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h2 className="mt-4 text-2xl font-black text-navy-900">
              Check-In Completed!
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Your anonymous responses were recorded to track cohort-wide risk recognition.
            </p>

            <div className="mt-6 space-y-3 rounded-2xl border border-slate-200 bg-white p-5 text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Evaluation Privacy Note
              </span>
              <p className="text-xs leading-relaxed text-slate-600">
                Individual responses are strictly anonymous and stored without tracking cookies or student PII.
                Facilitators evaluate aggregate shift across the entire cohort.
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-2">
              <Link
                to="/shield-central"
                className="flex min-h-[48px] w-full items-center justify-center rounded-xl bg-navy-900 text-sm font-extrabold text-white"
              >
                Return to Shield Central
              </Link>
              <Link
                to="/board"
                className="flex min-h-[44px] w-full items-center justify-center rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                Continue City Board
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
