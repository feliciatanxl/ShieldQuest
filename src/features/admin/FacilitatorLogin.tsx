import { useState } from 'react';
import { ArrowLeft, CheckCircle2, Lock, Shield, Sparkles } from 'lucide-react';

interface FacilitatorLoginProps {
  onSuccess: () => void;
  onBackToHome: () => void;
}

export function FacilitatorLogin({ onSuccess, onBackToHome }: FacilitatorLoginProps) {
  const [email, setEmail] = useState('facilitator@shieldquest.sg');
  const [password, setPassword] = useState('••••••••••••');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSuccess();
    }, 450);
  };

  return (
    <div className="flex min-h-screen flex-col justify-between bg-slate-900 font-sans text-slate-100 antialiased selection:bg-civic-500 selection:text-white">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 px-4 py-3 backdrop-blur-md sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-navy-800 to-navy-900 text-amber-400 border border-amber-400/30 shadow">
              <Shield className="h-5 w-5 fill-current" />
            </div>
            <div>
              <span className="text-base font-black uppercase tracking-tight text-white">
                Shield<span className="text-civic-400">Quest</span>
              </span>
              <span className="block text-[9px] font-extrabold uppercase tracking-widest text-slate-400">
                Facilitator & Evaluator Portal
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onBackToHome}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-bold text-slate-300 hover:bg-slate-800"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Public Site</span>
          </button>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-md">
          <div className="rounded-3xl border border-slate-800 bg-slate-950/90 p-8 shadow-2xl backdrop-blur-md">
            {/* Header */}
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-civic-600/20 text-civic-400 border border-civic-500/30">
                <Lock className="h-6 w-6" />
              </div>
              <h1 className="mt-4 text-2xl font-black uppercase tracking-tight text-white">
                Facilitator Access
              </h1>
              <p className="mt-1.5 text-xs text-slate-400">
                Sign in to create sessions, monitor squad live debriefs, and manage scenarios.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300">
                  Official Email
                </label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@school.edu.sg"
                  className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-xs text-white placeholder-slate-500 focus:border-civic-500 focus:outline-none focus:ring-1 focus:ring-civic-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => alert('For prototype demonstration, click "Sign In" with the demo credentials.')}
                    className="text-[11px] font-bold text-civic-400 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-xs text-white placeholder-slate-500 focus:border-civic-500 focus:outline-none focus:ring-1 focus:ring-civic-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-civic-600 to-civic-700 py-3 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-civic-600/30 transition hover:brightness-110 active:scale-95 disabled:opacity-70"
                >
                  {loading ? (
                    <span>Authenticating…</span>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <CheckCircle2 className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>

              {/* Quick Demo Access */}
              <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 p-3 text-center">
                <p className="text-[11px] font-bold text-amber-300">
                  Prototype Evaluator Access
                </p>
                <p className="mt-0.5 text-[10px] text-slate-400">
                  Pre-filled with demo credentials for instant evaluation review.
                </p>
                <button
                  type="button"
                  onClick={onSuccess}
                  className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-navy-950 hover:bg-amber-300"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Instant Demo Sign In</span>
                </button>
              </div>
            </form>
          </div>

          <p className="mt-6 text-center text-[11px] text-slate-500">
            Secure facilitator access · Project SHIELD Learning Platform
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-4 text-center text-xs text-slate-500">
        ShieldQuest Facilitator Portal · Prototype Environment
      </footer>
    </div>
  );
}
