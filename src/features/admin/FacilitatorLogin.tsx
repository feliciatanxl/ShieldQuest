import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock } from 'lucide-react';
import { BrandMark } from '../../design-system/BrandMark';

interface FacilitatorLoginProps {
  onSuccess?: () => void;
  onBackToHome?: () => void;
}

export function FacilitatorLogin({ onSuccess, onBackToHome }: FacilitatorLoginProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('facilitator@shieldquest.sg');
  const [password, setPassword] = useState('••••••••••••');
  const [loading, setLoading] = useState(false);

  const handleSuccess = onSuccess ?? (() => navigate('/admin'));
  const handleBack = onBackToHome ?? (() => navigate('/'));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      handleSuccess();
    }, 450);
  };

  return (
    <div className="flex min-h-screen flex-col justify-between bg-navy-950 font-sans text-slate-100 antialiased selection:bg-civic-500 selection:text-white">
      {/* Top Header */}
      <header className="border-b border-navy-900 bg-navy-950/90 px-4 py-3.5 backdrop-blur-md sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <BrandMark variant="dark" subtitle="Admin Portal" />

          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-300 hover:bg-white/10 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Public Site</span>
          </button>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-md">
          <div className="rounded-3xl border border-navy-800 bg-navy-900/90 p-8 shadow-2xl backdrop-blur-md">
            {/* Header */}
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-civic-600/20 text-civic-400 border border-civic-500/30">
                <Lock className="h-6 w-6" />
              </div>
              <h1 className="mt-4 text-2xl font-black uppercase tracking-tight text-white">
                ShieldQuest Admin Portal
              </h1>
              <p className="mt-1.5 text-xs text-slate-400">
                Authorised administrators and programme facilitators.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Official Email
                </label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@school.edu.sg"
                  className="mt-1.5 w-full rounded-xl border border-navy-700 bg-navy-950/80 p-3 text-xs text-white placeholder-slate-500 focus:border-civic-500 focus:outline-none focus:ring-1 focus:ring-civic-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => alert('For demonstration, click "Sign In" with the demo credentials.')}
                    className="text-[11px] font-bold text-civic-400 hover:underline"
                  >
                    Demo Password?
                  </button>
                </div>
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-navy-700 bg-navy-950/80 p-3 text-xs text-white placeholder-slate-500 focus:border-civic-500 focus:outline-none focus:ring-1 focus:ring-civic-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full min-h-[44px] rounded-xl bg-civic-600 px-4 py-3 text-xs font-black uppercase tracking-wider text-white shadow-md shadow-civic-600/30 transition hover:bg-civic-500 active:scale-[0.98] disabled:opacity-50"
                >
                  {loading ? 'Authenticating…' : 'Sign In to Portal'}
                </button>
              </div>

              <div className="mt-6 rounded-xl border border-navy-800 bg-navy-950/50 p-3.5 text-center">
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  <strong className="text-slate-300">Demo Note:</strong> Pre-filled with demonstration evaluator credentials for testing.
                </p>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-navy-900 px-4 py-4 text-center text-xs text-slate-500">
        ShieldQuest Admin Portal · Project SHIELD · Ministry of Home Affairs / SPF Delta Challenge
      </footer>
    </div>
  );
}
