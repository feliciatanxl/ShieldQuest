import { useState } from 'react';
import {
  ArrowRight,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Eye,
  Handshake,
  Lock,
  Menu,
  MessageSquare,
  School,
  Send,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  X,
  Zap,
} from 'lucide-react';
import { PrototypeNotice } from '../../design-system/DesignSystem';

interface PublicWebsiteProps {
  onPlay: () => void;
  onFacilitatorLogin: () => void;
}

export function PublicWebsite({ onPlay, onFacilitatorLogin }: PublicWebsiteProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [enquirySubmitted, setEnquirySubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const guardians = [
    {
      name: 'VeriFox',
      competency: 'SPOT',
      description: 'Teaches youths to detect unverified sender addresses, spoofed domains, and urgency triggers.',
      bg: 'from-amber-500/20 to-amber-600/10',
      border: 'border-amber-400/40',
      badge: 'bg-amber-400 text-navy-950',
    },
    {
      name: 'Echo',
      competency: 'HOLD',
      description: 'Prompts pausing before clicking fast payment links or sharing one-time authorisation codes.',
      bg: 'from-teal-500/20 to-teal-600/10',
      border: 'border-teal-400/40',
      badge: 'bg-teal-400 text-navy-950',
    },
    {
      name: 'Cluepaw',
      competency: 'IDENTIFY',
      description: 'Investigates seller ratings, suspicious marketplace listings, and unverified bank transfers.',
      bg: 'from-blue-500/20 to-blue-600/10',
      border: 'border-blue-400/40',
      badge: 'bg-blue-400 text-navy-950',
    },
    {
      name: 'ByteBuddy',
      competency: 'EVALUATE',
      description: 'Analyzes digital permissions, suspicious job perks, and high-yield commission offers.',
      bg: 'from-indigo-500/20 to-indigo-600/10',
      border: 'border-indigo-400/40',
      badge: 'bg-indigo-400 text-navy-950',
    },
    {
      name: 'Beacon',
      competency: 'LEAD',
      description: 'Models prosocial leadership, constructive peer intervention, and bystander support.',
      bg: 'from-rose-500/20 to-rose-600/10',
      border: 'border-rose-400/40',
      badge: 'bg-rose-400 text-navy-950',
    },
    {
      name: 'Shieldfin',
      competency: 'DEFEND',
      description: 'Shields personal bank accounts, Singpass credentials, and confidential records from misuse.',
      bg: 'from-emerald-500/20 to-emerald-600/10',
      border: 'border-emerald-400/40',
      badge: 'bg-emerald-400 text-navy-950',
    },
  ];

  const scenarios = [
    { title: 'Job Scams & Mule Recruitment', desc: 'Attractive commissions for simple tasks lead to criminal liability for money muling.', category: 'Financial Crime', risk: 'High Risk' },
    { title: 'E-Commerce Marketplace Fraud', desc: 'Pre-ordered gaming consoles and concert tickets with direct PayNow requests.', category: 'Consumer Safety', risk: 'Medium Risk' },
    { title: 'Phishing & Impersonation', desc: 'Urgent security alerts requiring immediate credential verification and fake app downloads.', category: 'Cyber Hygiene', risk: 'High Risk' },
    { title: 'Account Lending & Misuse', desc: 'Friends or acquaintances requesting to "borrow" a bank account or gaming profile.', category: 'Legal Liability', risk: 'High Risk' },
    { title: 'Cyberbullying & Defamation', desc: 'Group chat pressure, private photo sharing, and digital bystander intervention.', category: 'Peer Safety', risk: 'Medium Risk' },
    { title: 'Coercion & Shoplifting Circles', desc: 'Physical and social peer coercion around retail premises and group dare dynamics.', category: 'Community Crime', risk: 'High Risk' },
  ];

  const faqs = [
    {
      q: 'What age groups is ShieldQuest designed for?',
      a: 'ShieldQuest is calibrated for youths aged 11 to 18+, covering Secondary, Post-Secondary (ITE/Poly/JC), and youth community groups. Scenarios and debrief prompts are modularly assigned to match specific developmental stages.',
    },
    {
      q: 'Do participants need to install an app or create an account?',
      a: 'No installation is needed. ShieldQuest is a Progressive Web App (PWA) that loads instantly in any modern web browser via a 6-digit session code or QR scan. No personal accounts or app store downloads are required.',
    },
    {
      q: 'What devices are supported?',
      a: 'Any smartphone, tablet, Chromebook, laptop, or desktop computer running Chrome, Safari, Edge, or Firefox. The interface dynamically adapts between mobile hand-held and desktop layouts.',
    },
    {
      q: 'Is personal information or student data collected?',
      a: 'No. ShieldQuest employs Privacy by Design: zero NRICs, zero banking details, and zero phone numbers. Sessions use anonymous pseudonyms to compare pre/post learning outcomes at an aggregated cohort level.',
    },
    {
      q: 'Can schools and organisations facilitate their own sessions?',
      a: 'Yes. School educators, school counsellors, student development officers, and youth workers can use the Facilitator Portal to generate sessions, monitor live squad debates, and access structured debrief guides.',
    },
    {
      q: 'How long does a typical learning workshop take?',
      a: 'A standard workshop is designed for 90 minutes (10 min briefing, 45 min interactive board and scenario choices, 25 min Think–Vote–Explain peer debrief, and 10 min reflection). It can also be split into two 45-minute modular periods.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased selection:bg-civic-500 selection:text-white">
      {/* ------------------------------------------------------------- */}
      {/* 1. INSTITUTIONAL HEADER & NAVIGATION                          */}
      {/* ------------------------------------------------------------- */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-navy-900 to-navy-950 text-amber-400 shadow-md">
              <Shield className="h-6 w-6 fill-current" />
            </div>
            <div>
              <span className="text-xl font-black uppercase tracking-tight text-navy-950">
                Shield<span className="text-civic-600">Quest</span>
              </span>
              <span className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
                Project SHIELD · Youth Learning
              </span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden items-center gap-7 lg:flex">
            <a href="#about" className="text-sm font-bold text-slate-600 transition hover:text-navy-950">
              About
            </a>
            <a href="#how-it-works" className="text-sm font-bold text-slate-600 transition hover:text-navy-950">
              How It Works
            </a>
            <a href="#framework" className="text-sm font-bold text-slate-600 transition hover:text-navy-950">
              Learning Framework
            </a>
            <a href="#schools" className="text-sm font-bold text-slate-600 transition hover:text-navy-950">
              For Schools & Partners
            </a>
            <a href="#impact" className="text-sm font-bold text-slate-600 transition hover:text-navy-950">
              Impact & Evaluation
            </a>
            <a href="#safety" className="text-sm font-bold text-slate-600 transition hover:text-navy-950">
              Safety & Privacy
            </a>
            <a href="#faq" className="text-sm font-bold text-slate-600 transition hover:text-navy-950">
              FAQ
            </a>
          </nav>

          {/* Right Action CTAs */}
          <div className="hidden items-center gap-3 sm:flex">
            <button
              type="button"
              onClick={onFacilitatorLogin}
              className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-slate-700 transition hover:border-slate-400 hover:bg-slate-100"
            >
              Facilitator Login
            </button>
            <button
              type="button"
              onClick={onPlay}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-civic-600 to-civic-700 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-md shadow-civic-600/25 transition hover:brightness-110 active:scale-95"
            >
              <Sparkles className="h-4 w-4" />
              <span>Explore ShieldQuest</span>
            </button>
          </div>

          {/* Mobile Hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 lg:hidden"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Nav Drawer */}
        {mobileMenuOpen && (
          <div className="border-b border-slate-200 bg-white px-4 py-5 lg:hidden">
            <nav className="flex flex-col gap-3">
              <a
                href="#about"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                About
              </a>
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                How It Works
              </a>
              <a
                href="#framework"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                Learning Framework
              </a>
              <a
                href="#schools"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                For Schools & Partners
              </a>
              <a
                href="#impact"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                Impact & Evaluation
              </a>
              <a
                href="#safety"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                Safety & Privacy
              </a>
              <a
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                FAQ
              </a>
              <div className="mt-4 flex flex-col gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onPlay();
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-civic-600 px-4 py-3 text-sm font-black text-white"
                >
                  <Sparkles className="h-4 w-4" />
                  Explore ShieldQuest (PWA)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onFacilitatorLogin();
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700"
                >
                  Facilitator Portal
                </button>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* ------------------------------------------------------------- */}
      {/* 2. HERO SECTION                                               */}
      {/* ------------------------------------------------------------- */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50 to-slate-100 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            {/* Left Content */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-civic-200 bg-civic-50 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-civic-700">
                <ShieldCheck className="h-4 w-4 text-civic-600" />
                <span>Project SHIELD · Crime Prevention & Scam Awareness</span>
              </div>
              <h1 className="mt-5 text-3xl font-black tracking-tight text-navy-950 sm:text-5xl lg:text-6xl lg:leading-[1.12]">
                Learn safer choices before they become{' '}
                <span className="text-civic-600 underline decoration-amber-400 decoration-wavy decoration-2">
                  real consequences.
                </span>
              </h1>
              <p className="mt-5 text-base font-medium leading-relaxed text-slate-600 sm:text-lg">
                ShieldQuest is an interactive youth crime-prevention learning platform where participants explore
                realistic scenarios, make decisions, discuss choices with peers, and experience how immediate and
                delayed consequences unfold.
              </p>

              {/* CTAs */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={onPlay}
                  className="inline-flex items-center gap-2 rounded-xl bg-navy-950 px-6 py-3.5 text-sm font-extrabold uppercase tracking-wider text-white shadow-xl shadow-navy-950/20 transition hover:bg-navy-900 active:scale-95"
                >
                  <span>Explore ShieldQuest</span>
                  <ArrowRight className="h-4 w-4 text-amber-400" />
                </button>
                <button
                  type="button"
                  onClick={onFacilitatorLogin}
                  className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
                >
                  <span>For Facilitators</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={onPlay}
                  className="text-xs font-extrabold text-civic-600 hover:underline"
                >
                  Play Interactive Demo →
                </button>
              </div>

              {/* Trust Statement */}
              <div className="mt-8 flex items-center gap-3 border-t border-slate-200/80 pt-6">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                  <CheckCircle className="h-4 w-4" />
                </div>
                <p className="text-xs font-semibold text-slate-500">
                  Designed for facilitated youth learning, scenario-based discussion and privacy-conscious evaluation.
                </p>
              </div>
            </div>

            {/* Right Preview Card / 2.5D City Teaser */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl border-4 border-white bg-gradient-to-br from-navy-900 to-navy-950 p-6 text-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-rose-500" />
                    <span className="h-3 w-3 rounded-full bg-amber-400" />
                    <span className="h-3 w-3 rounded-full bg-emerald-400" />
                    <span className="ml-2 text-xs font-bold text-white/70">ShieldQuest City · PWA</span>
                  </div>
                  <PrototypeNotice text="Interactive Prototype" />
                </div>

                {/* 2.5D Graphic Representation */}
                <div className="my-6 rounded-2xl border border-white/15 bg-navy-950/80 p-6 text-center">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-400 text-navy-950 shadow-lg shadow-amber-400/20">
                    <Shield className="h-10 w-10 fill-current" />
                  </div>
                  <h3 className="mt-4 text-xl font-black uppercase tracking-tight text-white">
                    4 Isometric Districts
                  </h3>
                  <p className="mt-1 text-xs text-white/70">
                    School Street · Retail District · Digi-District · Community Hub
                  </p>
                  <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-300">
                    <Zap className="h-3.5 w-3.5" />
                    <span>2.5D Diamond Grid Engine</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <div className="text-xl font-black text-amber-300">16</div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-white/60">
                      City Spaces
                    </div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <div className="text-xl font-black text-teal-300">6</div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-white/60">
                      S.H.I.E.L.D. Guardians
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 3. THREE PILLARS (WHAT IS SHIELDQUEST)                        */}
      {/* ------------------------------------------------------------- */}
      <section id="about" className="py-20 bg-white border-y border-slate-200/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-xs font-extrabold uppercase tracking-widest text-civic-600">
              Core Methodology
            </span>
            <h2 className="mt-2 text-3xl font-black text-navy-950 sm:text-4xl">
              Three Pillars of Behavioural Prevention
            </h2>
            <p className="mt-3 text-slate-600 font-medium">
              ShieldQuest is an evidence-informed Progressive Web App built to help youths internalise crime and scam
              prevention through active, reflective practice.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Pillar 1 */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-8 shadow-sm transition hover:shadow-md">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-md shadow-amber-500/25">
                <Zap className="h-7 w-7" />
              </div>
              <h3 className="mt-6 text-xl font-black uppercase tracking-tight text-navy-950">PRACTISE</h3>
              <p className="mt-2 text-sm text-slate-600 font-medium leading-relaxed">
                Make decisions in realistic scenarios before real-world stakes occur. Youths experience authentic
                chat offers, marketplace listings, and urgent requests.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-8 shadow-sm transition hover:shadow-md">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-md shadow-teal-600/25">
                <MessageSquare className="h-7 w-7" />
              </div>
              <h3 className="mt-6 text-xl font-black uppercase tracking-tight text-navy-950">DISCUSS</h3>
              <p className="mt-2 text-sm text-slate-600 font-medium leading-relaxed">
                Compare reasoning with peers using structured Think–Vote–Explain mechanics. Anonymous squad voting
                sparks deep dialogue on underlying risk cues.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-8 shadow-sm transition hover:shadow-md">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-civic-600 text-white shadow-md shadow-civic-600/25">
                <TrendingUp className="h-7 w-7" />
              </div>
              <h3 className="mt-6 text-xl font-black uppercase tracking-tight text-navy-950">REFLECT</h3>
              <p className="mt-2 text-sm text-slate-600 font-medium leading-relaxed">
                Experience both immediate outcomes and delayed consequences. Learn how a single shared password or
                bank transfer can compound over time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 4. HOW IT WORKS (9-STEP VISUAL FLOW)                          */}
      {/* ------------------------------------------------------------- */}
      <section id="how-it-works" className="py-20 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-extrabold uppercase tracking-widest text-civic-600">
              Facilitated Journey
            </span>
            <h2 className="mt-2 text-3xl font-black text-navy-950 sm:text-4xl">
              How ShieldQuest Works
            </h2>
            <p className="mt-3 text-slate-600 font-medium">
              A structured 9-step learning loop connecting individual reflection, peer deliberation, and systemic debrief.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { num: '01', title: 'Join Session', desc: 'Scan a room QR or enter a 6-letter room code on any phone or laptop.' },
              { num: '02', title: 'Explore City', desc: 'Navigate the 2.5D isometric district board with your chosen token avatar.' },
              { num: '03', title: 'Encounter Scenario', desc: 'Land on an active challenge involving real-life scam or crime temptations.' },
              { num: '04', title: 'Think', desc: 'Privately analyze situational warning signs, risk signals, and trust indicators.' },
              { num: '05', title: 'Vote', desc: 'Cast an anonymous individual vote on the best and safest course of action.' },
              { num: '06', title: 'Explain', desc: 'Debate divergent choices with squad members to hear diverse peer perspectives.' },
              { num: '07', title: 'See Consequence', desc: 'Discover how the choice unfolds with immediate feedback and delayed legal/social fallout.' },
              { num: '08', title: 'Debrief', desc: 'Facilitator-guided group discussion highlights statutory laws and safer habits.' },
              { num: '09', title: 'Build Your SHIELD', desc: 'Unlock Guardian competencies and earn Shield Tokens to solidify habits.' },
            ].map((step) => (
              <div
                key={step.num}
                className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <div className="text-2xl font-black text-civic-600/30">{step.num}</div>
                <h3 className="mt-2 text-base font-extrabold text-navy-950 uppercase tracking-tight">
                  {step.title}
                </h3>
                <p className="mt-1.5 text-xs text-slate-600 font-medium leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 5. S.H.I.E.L.D. BEHAVIOURAL FRAMEWORK                         */}
      {/* ------------------------------------------------------------- */}
      <section id="framework" className="py-20 bg-navy-950 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-xs font-extrabold uppercase tracking-widest text-amber-400">
              Theoretical Foundation
            </span>
            <h2 className="mt-2 text-3xl font-black text-white sm:text-4xl">
              The S.H.I.E.L.D. Behavioural Framework
            </h2>
            <p className="mt-3 text-slate-300 font-medium">
              Six core competencies mapped to psychological defence factors, represented by the S.H.I.E.L.D. Guardians.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guardians.map((g) => (
              <div
                key={g.name}
                className={`rounded-3xl border bg-gradient-to-br p-6 backdrop-blur-md ${g.border} ${g.bg}`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">{g.name}</h3>
                  <span className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wider ${g.badge}`}>
                    {g.competency}
                  </span>
                </div>
                <p className="mt-4 text-xs font-semibold leading-relaxed text-slate-200">
                  {g.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 6. EDUCATIONAL SCENARIOS SHOWCASE                             */}
      {/* ------------------------------------------------------------- */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-civic-600">
                Authored Scenarios
              </span>
              <h2 className="mt-2 text-3xl font-black text-navy-950 sm:text-4xl">
                Realistic Crime-Prevention Topics
              </h2>
              <p className="mt-2 text-slate-600 font-medium max-w-2xl">
                Scenarios designed to match prevailing youth vulnerabilities in Singapore, with age-appropriate adaptations.
              </p>
            </div>
            <span className="inline-flex items-center rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
              Adaptable across ages 11–18+
            </span>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scenarios.map((s, idx) => (
              <div
                key={idx}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 p-6 shadow-sm transition hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-civic-700 uppercase tracking-wider">{s.category}</span>
                    <span className="rounded-md bg-rose-50 px-2 py-0.5 font-extrabold text-rose-700 border border-rose-200">
                      {s.risk}
                    </span>
                  </div>
                  <h3 className="mt-4 text-base font-extrabold text-navy-950 uppercase tracking-tight">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-xs text-slate-600 font-medium leading-relaxed">
                    {s.desc}
                  </p>
                </div>
                <div className="mt-6 border-t border-slate-100 pt-4 flex items-center justify-between text-xs font-bold text-civic-600">
                  <span>Interactive Mission</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 7. FOR SCHOOLS & YOUTH PARTNERS                               */}
      {/* ------------------------------------------------------------- */}
      <section id="schools" className="py-20 bg-slate-100 border-t border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-12 shadow-md">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-7">
                <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-civic-600">
                  <School className="h-4 w-4" />
                  <span>Workshop Deployment Model</span>
                </span>
                <h2 className="mt-2 text-3xl font-black text-navy-950 sm:text-4xl">
                  Bring ShieldQuest to Your School or Youth Centre
                </h2>
                <p className="mt-4 text-sm font-medium leading-relaxed text-slate-600">
                  Conducted as a structured 90-minute workshop or integrated into modular curriculum slots.
                  Students collaborate in squads of 4–5 using standard school laptops, iPads, or personal mobile devices.
                </p>

                <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-bold text-slate-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>90-min standard session</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Squads of 4–5 youths</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Any device / PWA</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Facilitator dashboard</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Pre/Post evaluations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Classroom or hall</span>
                  </div>
                </div>

                <div className="mt-8 flex flex-wrap gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setEnquiryOpen(true);
                      setEnquirySubmitted(false);
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-civic-600 px-6 py-3 text-sm font-extrabold uppercase tracking-wider text-white shadow-lg shadow-civic-600/25 transition hover:bg-civic-700 active:scale-95"
                  >
                    <span>Request / Plan a Session</span>
                    <Send className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={onFacilitatorLogin}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
                  >
                    <span>View Facilitator Portal</span>
                  </button>
                </div>
              </div>

              {/* Stat Block */}
              <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-slate-50 p-6">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                    Workshop Structure
                  </span>
                  <span className="text-xs font-black text-civic-700">90 Mins Total</span>
                </div>
                <div className="mt-4 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700">1. Onboarding & Ground Rules</span>
                    <span className="font-bold text-slate-500">10 mins</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700">2. City Exploration & Scenarios</span>
                    <span className="font-bold text-slate-500">45 mins</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700">3. Think–Vote–Explain Debrief</span>
                    <span className="font-bold text-slate-500">25 mins</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700">4. Post-Reflection & Takeaway</span>
                    <span className="font-bold text-slate-500">10 mins</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 8. IMPACT & EVALUATION (ILLUSTRATIVE DATA CHARTS)             */}
      {/* ------------------------------------------------------------- */}
      <section id="impact" className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-civic-600">
                Evaluation Metrics
              </span>
              <h2 className="mt-2 text-3xl font-black text-navy-950 sm:text-4xl">
                Measurable Behavioural Outcomes
              </h2>
              <p className="mt-2 text-sm text-slate-600 font-medium">
                Tracking five core dimensions of youth crime prevention and scam resilience.
              </p>
            </div>
            <PrototypeNotice text="Prototype / Illustrative Data" />
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-2xl border border-slate-200 p-5 bg-slate-50">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                Risk Recognition
              </span>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-black text-navy-950">+38%</span>
                <span className="text-xs font-bold text-emerald-600">Pre vs Post</span>
              </div>
              <p className="mt-2 text-xs text-slate-600">
                Identification of suspicious links, urgency triggers, and money mule requests.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 p-5 bg-slate-50">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                Decision Accuracy
              </span>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-black text-navy-950">84%</span>
                <span className="text-xs font-bold text-civic-600">Safe Choices</span>
              </div>
              <p className="mt-2 text-xs text-slate-600">
                Proportion of youths choosing verification over immediate high-risk compliance.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 p-5 bg-slate-50">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                Consequence Awareness
              </span>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-black text-navy-950">92%</span>
                <span className="text-xs font-bold text-teal-600">Legal Literacy</span>
              </div>
              <p className="mt-2 text-xs text-slate-600">
                Understanding statutory penalties for money muling and account lending.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 p-5 bg-slate-50">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                Peer Intervention
              </span>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-black text-navy-950">+46%</span>
                <span className="text-xs font-bold text-amber-600">Confidence</span>
              </div>
              <p className="mt-2 text-xs text-slate-600">
                Self-reported willingness to intervene when witnessing a peer being lured online.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 9. SAFETY, PRIVACY & RESPONSIBLE DESIGN                       */}
      {/* ------------------------------------------------------------- */}
      <section id="safety" className="py-20 bg-slate-900 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-400/40 bg-teal-500/20 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-teal-300">
              <Lock className="h-3.5 w-3.5" />
              <span>Privacy by Design</span>
            </div>
            <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">
              Safety, Privacy & Institutional Safeguards
            </h2>
            <p className="mt-3 text-slate-300 font-medium">
              ShieldQuest adheres strictly to privacy-first, non-punitive principles suitable for government presentation.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-400/20 text-teal-300">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-extrabold uppercase tracking-tight text-white">
                Zero Sensitive Data
              </h3>
              <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                No NRIC, no banking details, no phone numbers, and no home addresses are ever collected or stored.
              </p>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/20 text-amber-300">
                <Eye className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-extrabold uppercase tracking-tight text-white">
                Pseudonymous Codes
              </h3>
              <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                Sessions operate via temporary random room codes. Individual answers are never linked to real identity.
              </p>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-civic-400/20 text-civic-300">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-extrabold uppercase tracking-tight text-white">
                Aggregated Reporting
              </h3>
              <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                Facilitator and institutional reporting provides cohort-level insights only, ensuring a psychologically safe environment.
              </p>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-400/20 text-rose-300">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-extrabold uppercase tracking-tight text-white">
                Clear Escalation Paths
              </h3>
              <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                Every scenario concludes with legitimate helplines, official reporting avenues, and trusted adult escalation guidance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 10. PARTNERS / SUPPORTERS                                     */}
      {/* ------------------------------------------------------------- */}
      <section className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-extrabold uppercase tracking-widest text-slate-500">
            Collaborative Ecosystem
          </span>
          <h3 className="mt-1 text-sm font-bold text-slate-700">
            Participating / Supporting Partners (Illustrative Slots)
          </h3>
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div className="flex h-16 items-center justify-center rounded-xl border border-slate-200 bg-white p-4 font-bold text-slate-600 text-xs">
              Educational Institutions
            </div>
            <div className="flex h-16 items-center justify-center rounded-xl border border-slate-200 bg-white p-4 font-bold text-slate-600 text-xs">
              Youth Organisations
            </div>
            <div className="flex h-16 items-center justify-center rounded-xl border border-slate-200 bg-white p-4 font-bold text-slate-600 text-xs">
              Crime Prevention Partners
            </div>
            <div className="flex h-16 items-center justify-center rounded-xl border border-slate-200 bg-white p-4 font-bold text-slate-600 text-xs">
              Community Groups
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 11. FAQ ACCORDION                                             */}
      {/* ------------------------------------------------------------- */}
      <section id="faq" className="py-20 bg-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="text-xs font-extrabold uppercase tracking-widest text-civic-600">
              Frequently Asked Questions
            </span>
            <h2 className="mt-2 text-3xl font-black text-navy-950 sm:text-4xl">
              Common Enquiries
            </h2>
          </div>

          <div className="mt-12 space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-200 bg-slate-50/50 transition"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="flex w-full items-center justify-between p-5 text-left text-sm font-bold text-navy-950"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 transition-transform ${isOpen ? 'rotate-180 text-civic-600' : 'text-slate-400'}`}
                    />
                  </button>
                  {isOpen && (
                    <div className="border-t border-slate-200/80 p-5 text-xs leading-relaxed text-slate-600">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 12. INSTITUTIONAL PUBLIC FOOTER                               */}
      {/* ------------------------------------------------------------- */}
      <footer className="border-t border-slate-200 bg-navy-950 py-12 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-amber-400 fill-current" />
                <span className="text-lg font-black uppercase tracking-tight text-white">
                  Project SHIELD · ShieldQuest
                </span>
              </div>
              <p className="mt-3 text-xs text-slate-400 max-w-md leading-relaxed">
                An evidence-informed, scenario-based youth crime-prevention and scam-awareness platform designed for
                schools, youth organisations, and community facilitators.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-300">Quick Links</h4>
              <ul className="mt-3 space-y-2 text-xs text-slate-400">
                <li>
                  <a href="#about" className="hover:text-white">About ShieldQuest</a>
                </li>
                <li>
                  <a href="#framework" className="hover:text-white">S.H.I.E.L.D. Framework</a>
                </li>
                <li>
                  <a href="#schools" className="hover:text-white">For Schools & Partners</a>
                </li>
                <li>
                  <a href="#safety" className="hover:text-white">Safety & Privacy Policy</a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-300">Access Portals</h4>
              <ul className="mt-3 space-y-2 text-xs text-slate-400">
                <li>
                  <button type="button" onClick={onPlay} className="hover:text-white text-left">
                    Launch Player PWA
                  </button>
                </li>
                <li>
                  <button type="button" onClick={onFacilitatorLogin} className="hover:text-white text-left">
                    Facilitator Login Portal
                  </button>
                </li>
                <li>
                  <span className="text-slate-500">Preview 0.1 · Prototype</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
            <span>© Project SHIELD · Youth Crime Prevention Learning Prototype.</span>
            <div className="mt-2 sm:mt-0 flex gap-4">
              <span>Privacy by Design</span>
              <span>·</span>
              <span>Accessibility WCAG AA</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ------------------------------------------------------------- */}
      {/* 13. SESSION REQUEST ENQUIRY MODAL                             */}
      {/* ------------------------------------------------------------- */}
      {enquiryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/70 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setEnquiryOpen(false)}
              className="absolute right-5 top-5 text-slate-400 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>

            {enquirySubmitted ? (
              <div className="text-center py-8">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <CheckCircle className="h-8 w-8" />
                </div>
                <h3 className="mt-4 text-xl font-black text-navy-950">Session Request Received</h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  Thank you for your enquiry. In a full deployment, our facilitation team will contact your school or
                  organisation to review dates, learner bands, and room setup.
                </p>
                <button
                  type="button"
                  onClick={() => setEnquiryOpen(false)}
                  className="mt-6 inline-flex rounded-xl bg-navy-950 px-5 py-2.5 text-xs font-bold text-white"
                >
                  Close
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-civic-50 text-civic-600">
                    <Handshake className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black uppercase text-navy-950">Plan a ShieldQuest Session</h3>
                    <p className="text-[11px] text-slate-500 font-medium">
                      For schools, tertiary institutions, and youth partners
                    </p>
                  </div>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setEnquirySubmitted(true);
                  }}
                  className="mt-5 space-y-3.5"
                >
                  <div>
                    <label className="block text-xs font-bold text-slate-700">Full Name</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Tan Mei Ling"
                      className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:border-civic-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700">School / Organisation</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. West Coast Secondary School"
                      className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:border-civic-600 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700">Official Email</label>
                      <input
                        required
                        type="email"
                        placeholder="name@school.edu.sg"
                        className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:border-civic-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700">Learner Band</label>
                      <select className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:border-civic-600 focus:outline-none">
                        <option>Lower Secondary (13-14)</option>
                        <option>Upper Secondary (15-16)</option>
                        <option>Post-Secondary (ITE/Poly/JC)</option>
                        <option>Youth Community Group</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700">Estimated Cohort Size</label>
                    <input
                      type="number"
                      placeholder="e.g. 120 students"
                      className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:border-civic-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700">Additional Notes / Preferred Dates</label>
                    <textarea
                      rows={3}
                      placeholder="Share your preferred timeframe or specific crime-prevention focus..."
                      className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:border-civic-600 focus:outline-none"
                    />
                  </div>

                  <div className="mt-6 flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setEnquiryOpen(false)}
                      className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-xl bg-civic-600 px-5 py-2 text-xs font-black uppercase tracking-wider text-white shadow-md hover:bg-civic-700"
                    >
                      Submit Enquiry
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
