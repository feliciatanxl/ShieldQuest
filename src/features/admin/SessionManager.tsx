import { useState } from 'react';
import {
  Copy,
  Pause,
  Play,
  QrCode,
  Square,
} from 'lucide-react';
import { PrototypeNotice } from '../../design-system/DesignSystem';

export function SessionManager() {
  const [sessionState, setSessionState] = useState<'idle' | 'active' | 'paused'>('active');
  const sessionCode = 'SQ-7842';
  const [copied, setCopied] = useState(false);

  const sessionName = 'Sec 3 Cohort A · Workshop 2';
  const venue = 'Computer Lab 2 / Zoom Room';
  const participantsJoined = 29;
  const totalExpected = 32;

  const squads = [
    { name: 'Squad Alpha', count: 5, status: 'Voted', leader: 'Token Beacon' },
    { name: 'Squad Bravo', count: 5, status: 'Voted', leader: 'Token Scout' },
    { name: 'Squad Charlie', count: 4, status: 'Thinking', leader: 'Token Sentinel' },
    { name: 'Squad Delta', count: 5, status: 'Voted', leader: 'Token Vanguard' },
    { name: 'Squad Echo', count: 5, status: 'Voted', leader: 'Token Beacon' },
    { name: 'Squad Foxtrot', count: 5, status: 'Thinking', leader: 'Token Scout' },
  ];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(sessionCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Session Top Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/90 p-5">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                sessionState === 'active'
                  ? 'bg-emerald-400 animate-pulse'
                  : sessionState === 'paused'
                    ? 'bg-amber-400'
                    : 'bg-slate-500'
              }`}
            />
            <span className="text-xs font-black uppercase tracking-wider text-slate-300">
              {sessionState === 'active'
                ? 'Live Facilitated Session'
                : sessionState === 'paused'
                  ? 'Session Paused'
                  : 'Session Ended'}
            </span>
            <PrototypeNotice text="Live Facilitator Room" />
          </div>
          <h2 className="mt-1 text-xl font-black text-white">{sessionName}</h2>
          <p className="text-xs text-slate-400">{venue} · Upper Secondary Band (15–16)</p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {sessionState === 'active' ? (
            <button
              type="button"
              onClick={() => setSessionState('paused')}
              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-400/40 bg-amber-500/20 px-4 py-2 text-xs font-bold text-amber-300 hover:bg-amber-500/30"
            >
              <Pause className="h-4 w-4" />
              <span>Pause Session</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setSessionState('active')}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500"
            >
              <Play className="h-4 w-4" />
              <span>Resume Session</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              if (confirm('Are you sure you want to conclude this workshop session?')) {
                setSessionState('idle');
              }
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-2 text-xs font-bold text-rose-300 hover:bg-rose-500/20"
          >
            <Square className="h-4 w-4" />
            <span>End Workshop</span>
          </button>
        </div>
      </div>

      {/* Session Join Credentials Block */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Room Code Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 flex flex-col justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Room Code</span>
          <div className="my-3 flex items-center justify-between">
            <span className="text-3xl font-black tracking-widest text-amber-300 font-mono">
              {sessionCode}
            </span>
            <button
              type="button"
              onClick={handleCopyCode}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:text-white"
              title="Copy session code"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
          {copied && <span className="text-[11px] font-bold text-emerald-400">Copied to clipboard!</span>}
          <p className="text-[11px] text-slate-400">Students enter this code at shieldquest.sg to join.</p>
        </div>

        {/* QR Code Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 flex items-center gap-4">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white p-2 text-navy-950 shadow">
            <QrCode className="h-16 w-16" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Classroom Scan</span>
            <p className="mt-1 text-xs text-white font-semibold leading-snug">
              Project on screen for fast tablet / phone onboarding.
            </p>
            <button
              type="button"
              onClick={() => alert('Full screen classroom QR projector modal')}
              className="mt-2 text-[11px] font-bold text-civic-400 hover:underline"
            >
              Project Fullscreen QR →
            </button>
          </div>
        </div>

        {/* Attendance Counter */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 flex flex-col justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Attendance</span>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{participantsJoined}</span>
            <span className="text-xs font-bold text-slate-400">/ {totalExpected} joined</span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${(participantsJoined / totalExpected) * 100}%` }}
            />
          </div>
          <span className="mt-2 text-[11px] text-slate-400">6 squads connected anonymously</span>
        </div>
      </div>

      {/* Live Scenario Voting Monitor */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400">
                Active Scenario Poll
              </span>
              <span className="rounded-md bg-civic-500/20 px-2 py-0.5 text-[10px] font-bold text-civic-300">
                Think–Vote–Explain
              </span>
            </div>
            <h3 className="mt-1 text-base font-black text-white">
              EASY MONEY: Job Offer via Telegram Message
            </h3>
          </div>
          <span className="text-xs font-extrabold text-emerald-400">
            24 of 29 participants voted (82%)
          </span>
        </div>

        {/* Aggregated Anonymous Choices */}
        <div className="mt-6 space-y-4">
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
              <span>A: Accept the job and provide PayNow to receive the $500 commission</span>
              <span className="text-rose-400 font-extrabold">3 votes (10%) · High Risk</span>
            </div>
            <div className="h-3 w-full rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-rose-500 rounded-full" style={{ width: '10%' }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
              <span>B: Ask for ACRA registration and official company UEN</span>
              <span className="text-civic-400 font-extrabold">21 votes (72%) · Safe Verification</span>
            </div>
            <div className="h-3 w-full rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-civic-500 rounded-full" style={{ width: '72%' }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
              <span>C: Immediately block and report the contact to ScamShield</span>
              <span className="text-emerald-400 font-extrabold">5 votes (18%) · Proactive Defence</span>
            </div>
            <div className="h-3 w-full rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: '18%' }} />
            </div>
          </div>
        </div>

        <p className="mt-5 text-center text-[11px] text-slate-400 font-medium">
          Individual votes remain strictly confidential. Facilitator view shows aggregated squad trends to guide discussion.
        </p>
      </div>

      {/* Active Squads Grid */}
      <div>
        <h3 className="text-sm font-black uppercase tracking-wider text-slate-300 mb-3">
          Connected Squads
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {squads.map((sq, i) => (
            <div key={i} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-white">{sq.name}</span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                    sq.status === 'Voted'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {sq.status}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                <span>{sq.count} members</span>
                <span className="text-slate-500">{sq.leader}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
