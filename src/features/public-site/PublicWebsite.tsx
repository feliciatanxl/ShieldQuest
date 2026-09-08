import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle,
  ChevronDown,
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
import { PrototypeNotice, BrandMark } from '../../design-system/DesignSystem';

interface PublicWebsiteProps {
  onPlay?: () => void;
  onFacilitatorLogin?: () => void;
}

export function PublicWebsite({ onPlay, onFacilitatorLogin }: PublicWebsiteProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [enquirySubmitted, setEnquirySubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showAllFaqs, setShowAllFaqs] = useState(false);

  const handlePlay = () => {
    if (onPlay) onPlay();
    navigate('/board');
  };

  const handleFacilitatorLogin = () => {
    if (onFacilitatorLogin) onFacilitatorLogin();
    navigate('/admin');
  };

  const handleSchoolsCta = () => {
    setEnquiryOpen(true);
    setEnquirySubmitted(false);
  };

  // 6 S.H.I.E.L.D. Guardians
  const guardians = [
    {
      name: 'VeriFox',
      competency: 'SPOT',
      description: 'Detects unverified senders, spoofed URLs & urgency cues.',
      bg: 'from-amber-500/20 to-amber-600/10',
      border: 'border-amber-400/40',
      badge: 'bg-amber-400 text-navy-950',
    },
    {
      name: 'Echo',
      competency: 'HOLD',
      description: 'Pauses before fast clicks, payment transfers, or sharing OTPs.',
      bg: 'from-teal-500/20 to-teal-600/10',
      border: 'border-teal-400/40',
      badge: 'bg-teal-400 text-navy-950',
    },
    {
      name: 'Cluepaw',
      competency: 'IDENTIFY',
      description: 'Audits seller ratings, marketplace listings & bank requests.',
      bg: 'from-blue-500/20 to-blue-600/10',
      border: 'border-blue-400/40',
      badge: 'bg-blue-400 text-navy-950',
    },
    {
      name: 'ByteBuddy',
      competency: 'EVALUATE',
      description: 'Analyzes suspicious job perks, commissions & app permissions.',
      bg: 'from-indigo-500/20 to-indigo-600/10',
      border: 'border-indigo-400/40',
      badge: 'bg-indigo-400 text-navy-950',
    },
    {
      name: 'Beacon',
      competency: 'LEAD',
      description: 'Models constructive bystander support & peer intervention.',
      bg: 'from-rose-500/20 to-rose-600/10',
      border: 'border-rose-400/40',
      badge: 'bg-rose-400 text-navy-950',
    },
    {
      name: 'Shieldfin',
      competency: 'DEFEND',
      description: 'Shields personal bank accounts, Singpass & confidential data.',
      bg: 'from-emerald-500/20 to-emerald-600/10',
      border: 'border-emerald-400/40',
      badge: 'bg-emerald-400 text-navy-950',
    },
  ];

  // 3 Featured Scenarios for the Homepage
  const featuredScenarios = [
    {
      title: 'Easy Money',
      subtitle: 'Money-mule recruitment',
      desc: 'Attractive commission offers for simple bank transfers or deliveries lead directly to criminal liability under anti-money laundering laws.',
      category: 'Financial Crime',
      risk: 'High Risk',
      guardian: 'ByteBuddy · EVALUATE',
    },
    {
      title: 'Urgent Account Alert',
      subtitle: 'Phishing & impersonation',
      desc: 'High-pressure security warnings, fake login portals, and immediate credential verification designed to hijack banking and gaming profiles.',
      category: 'Cyber Hygiene',
      risk: 'High Risk',
      guardian: 'VeriFox · SPOT',
    },
    {
      title: 'Friend in Trouble',
      subtitle: 'Peer intervention',
      desc: 'Witnessing a friend being dared into retail theft or lured into lending their bank account. Learn constructive bystander actions without escalating conflict.',
      category: 'Peer Safety',
      risk: 'High Risk',
      guardian: 'Beacon · LEAD',
    },
  ];

  // All FAQs
  const allFaqs = [
    {
      q: 'What age groups is ShieldQuest designed for?',
      a: 'ShieldQuest is designed for youths aged approximately 10–24. The initial pilot prioritises secondary and post-secondary cohorts, with age-banded language, clues, choices, and debrief prompts.',
    },
    {
      q: 'Do participants need to install an app or create an account?',
      a: 'No installation is needed. ShieldQuest is a Progressive Web App (PWA) that loads instantly in any modern web browser via a 6-digit session code or QR scan. No personal accounts or app store downloads are required.',
    },
    {
      q: 'Is personal information or student data collected?',
      a: 'No. ShieldQuest employs Privacy by Design: zero NRICs, zero banking details, and zero phone numbers. Sessions use anonymous pseudonyms to compare pre/post learning outcomes at an aggregated cohort level.',
    },
    {
      q: 'What devices are supported?',
      a: 'Any smartphone, tablet, Chromebook, laptop, or desktop computer running Chrome, Safari, Edge, or Firefox. The interface dynamically adapts between mobile hand-held and desktop layouts.',
    },
    {
      q: 'Can schools and organisations facilitate their own sessions?',
      a: 'Yes. School educators, school counsellors, student development officers, and youth workers can use the Facilitator Portal to generate sessions, monitor live squad debates, and access structured debrief guides.',
    },
    {
      q: 'How long does a typical learning workshop take?',
      a: 'A standard workshop is designed for 90 minutes: 15 minutes of onboarding and briefing, 45 minutes of gameplay, 20 minutes of facilitated debrief and peer reflection, and 10 minutes of evaluation.',
    },
  ];

  const visibleFaqs = showAllFaqs ? allFaqs : allFaqs.slice(0, 3);

  // Check if we are viewing a dedicated subpage
  const isSubpage = location.pathname !== '/' && location.pathname !== '/website';
  const subpageType = location.pathname.replace(/^\//, '');

  return (
    <div className="min-h-screen bg-canvas font-sans text-slate-800 antialiased selection:bg-civic-500 selection:text-white">
      {/* ------------------------------------------------------------- */}
      {/* 1. INSTITUTIONAL HEADER & NAVIGATION                          */}
      {/* ------------------------------------------------------------- */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          {/* Logo */}
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center text-left focus:outline-none"
          >
            <BrandMark variant="light" subtitle="Project SHIELD · Youth Learning" />
          </button>

          {/* Desktop Nav Links */}
          <nav className="hidden items-center gap-7 lg:flex">
            <button
              type="button"
              onClick={() => {
                if (location.pathname === '/') {
                  document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                } else {
                  navigate('/how-it-works');
                }
              }}
              className="text-sm font-bold text-slate-600 transition hover:text-navy-950"
            >
              How It Works
            </button>
            <button
              type="button"
              onClick={() => {
                if (location.pathname === '/') {
                  document.getElementById('schools')?.scrollIntoView({ behavior: 'smooth' });
                } else {
                  navigate('/for-schools');
                }
              }}
              className="text-sm font-bold text-slate-600 transition hover:text-navy-950"
            >
              For Schools
            </button>
            <button
              type="button"
              onClick={() => {
                if (location.pathname === '/') {
                  document.getElementById('safety')?.scrollIntoView({ behavior: 'smooth' });
                } else {
                  navigate('/safety');
                }
              }}
              className="text-sm font-bold text-slate-600 transition hover:text-navy-950"
            >
              Safety
            </button>
            <button
              type="button"
              onClick={() => {
                if (location.pathname === '/') {
                  document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
                } else {
                  navigate('/about');
                }
              }}
              className="text-sm font-bold text-slate-600 transition hover:text-navy-950"
            >
              About
            </button>
          </nav>

          {/* Right Action CTA */}
          <div className="hidden items-center gap-3 sm:flex">
            <button
              type="button"
              onClick={handleFacilitatorLogin}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 hover:text-navy-950 active:scale-95"
            >
              <span>Admin Portal</span>
            </button>
            <button
              type="button"
              onClick={handlePlay}
              className="inline-flex items-center gap-2 rounded-xl bg-civic-600 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-sm transition hover:bg-civic-700 active:scale-95"
            >
              <Sparkles className="h-4 w-4" />
              <span>Try ShieldQuest</span>
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
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (location.pathname === '/') {
                    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    navigate('/how-it-works');
                  }
                }}
                className="text-left rounded-lg px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                How It Works
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (location.pathname === '/') {
                    document.getElementById('schools')?.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    navigate('/for-schools');
                  }
                }}
                className="text-left rounded-lg px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                For Schools
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (location.pathname === '/') {
                    document.getElementById('safety')?.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    navigate('/safety');
                  }
                }}
                className="text-left rounded-lg px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                Safety
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (location.pathname === '/') {
                    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    navigate('/about');
                  }
                }}
                className="text-left rounded-lg px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                About
              </button>
              <div className="mt-4 flex flex-col gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleFacilitatorLogin();
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 active:scale-95"
                >
                  Admin Portal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handlePlay();
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-civic-600 px-4 py-2.5 text-sm font-black text-white active:scale-95"
                >
                  <Sparkles className="h-4 w-4" />
                  Try ShieldQuest
                </button>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* ------------------------------------------------------------- */}
      {/* SUBPAGE VIEW                                                  */}
      {/* ------------------------------------------------------------- */}
      {isSubpage ? (
        <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="mb-8 inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-civic-700 hover:underline"
          >
            ← Back to Overview
          </button>

          {subpageType === 'how-it-works' && (
            <div className="space-y-12">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-civic-600">
                  Pedagogical Architecture
                </span>
                <h1 className="mt-2 text-3xl font-black text-navy-950 sm:text-4xl">
                  How ShieldQuest Works: The Six-Stage Learning Loop
                </h1>
                <p className="mt-3 text-base text-slate-600 leading-relaxed font-medium">
                  ShieldQuest uses experiential learning and peer deliberation rather than passive
                  lecturing. Here is the complete end-to-end framework connecting individual
                  reflection, anonymous squad voting, facilitator-guided debrief, and delayed
                  consequence evaluation.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    num: '01',
                    title: 'Explore',
                    desc: 'Navigate the hybrid 2.5D city board and encounter risks in familiar school, retail, digital, and community settings.',
                  },
                  {
                    num: '02',
                    title: 'Investigate',
                    desc: 'Inspect chats, images, offers, and environmental clues before choosing a response.',
                  },
                  {
                    num: '03',
                    title: 'Discuss',
                    desc: 'Think privately, vote anonymously, then explain the reasoning behind each choice.',
                  },
                  {
                    num: '04',
                    title: 'Decide',
                    desc: 'Choose a response under urgency, temptation, uncertainty, or peer pressure.',
                  },
                  {
                    num: '05',
                    title: 'Experience',
                    desc: 'See immediate outcomes and delayed legal, financial, and social consequences.',
                  },
                  {
                    num: '06',
                    title: 'Protect',
                    desc: 'Apply the learning through Peer Shield practice and support a friend safely.',
                  },
                ].map((step) => (
                  <div
                    key={step.num}
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
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

              <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center">
                <h3 className="text-xl font-black text-navy-950">Ready to test the experience?</h3>
                <p className="mt-2 text-xs text-slate-600 max-w-md mx-auto">
                  Experience the interactive board directly in your browser.
                </p>
                <button
                  type="button"
                  onClick={handlePlay}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-navy-950 px-6 py-3 text-xs font-black uppercase text-white shadow-lg"
                >
                  <Sparkles className="h-4 w-4 text-amber-400" />
                  <span>Launch ShieldQuest</span>
                </button>
              </div>
            </div>
          )}

          {subpageType === 'for-schools' && (
            <div className="space-y-10">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-civic-600">
                  School & Partner Deployment
                </span>
                <h1 className="mt-2 text-3xl font-black text-navy-950 sm:text-4xl">
                  Facilitated 90-Minute Youth Learning Workshops
                </h1>
                <p className="mt-3 text-base text-slate-600 leading-relaxed font-medium">
                  ShieldQuest is designed for straightforward deployment in school classrooms,
                  computer labs, or multi-purpose halls. Facilitators receive real-time cohort
                  dashboards and structured debrief guides.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <h3 className="text-base font-extrabold text-navy-950 uppercase">
                    Workshop Agenda
                  </h3>
                  <div className="mt-4 space-y-3 text-xs font-medium text-slate-600">
                    <div className="flex justify-between border-b pb-2">
                      <span className="font-bold text-slate-800">1. Onboarding & Ground Rules</span>
                      <span>15 mins</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="font-bold text-slate-800">
                        2. City Exploration & Scenarios
                      </span>
                      <span>45 mins</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="font-bold text-slate-800">
                        3. Think–Vote–Explain Squad Debrief
                      </span>
                      <span>20 mins</span>
                    </div>
                    <div className="flex justify-between pb-2">
                      <span className="font-bold text-slate-800">4. Reflection & Evaluation</span>
                      <span>10 mins</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <h3 className="text-base font-extrabold text-navy-950 uppercase">
                    Technical Requirements
                  </h3>
                  <ul className="mt-4 space-y-2.5 text-xs font-medium text-slate-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>Zero software installation (100% browser-based PWA)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>Runs on school Chromebooks, iPads, laptops, or smartphones</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>Lightweight payload (&lt; 2MB) suited for campus Wi-Fi</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>Zero personal data or student accounts required</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-8">
                <h3 className="text-lg font-black text-navy-950 uppercase">
                  Request a Facilitated Session
                </h3>
                <p className="mt-1 text-xs text-slate-600">
                  Contact our facilitation team to plan a workshop session for your cohort.
                </p>
                <button
                  type="button"
                  onClick={handleSchoolsCta}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-civic-600 px-6 py-3 text-xs font-black uppercase text-white shadow-md"
                >
                  <Send className="h-4 w-4" />
                  <span>Open Session Request Form</span>
                </button>
              </div>
            </div>
          )}

          {subpageType === 'safety' && (
            <div className="space-y-10">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-civic-600">
                  Safeguarding & Governance
                </span>
                <h1 className="mt-2 text-3xl font-black text-navy-950 sm:text-4xl">
                  Safety, Privacy & Institutional Safeguards
                </h1>
                <p className="mt-3 text-base text-slate-600 leading-relaxed font-medium">
                  ShieldQuest adheres strictly to privacy-first, non-punitive principles suitable
                  for presentation to government agencies, school leadership, and grant evaluators.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600 mb-4">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-extrabold text-navy-950">
                    Zero Sensitive Data Collection
                  </h3>
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                    No NRICs, no banking numbers, no phone numbers, and no home addresses are ever
                    requested, processed, or stored.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 mb-4">
                    <Eye className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-extrabold text-navy-950">
                    Pseudonymous Cohort Evaluation
                  </h3>
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                    Participants enter sessions via temporary random codes. All pre/post learning
                    outcomes are aggregated at cohort level.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 mb-4">
                    <Users className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-extrabold text-navy-950">
                    Facilitated & Non-Punitive Ethos
                  </h3>
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                    Mistakes made during scenario play are treated as constructive learning moments,
                    not infractions.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 mb-4">
                    <ShieldAlert className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-extrabold text-navy-950">
                    Legitimate Escalation Pathways
                  </h3>
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                    Every scenario connects to official Singapore resources: National Crime
                    Prevention Council (NCPC), ScamShield, and school counselling.
                  </p>
                </div>
              </div>
            </div>
          )}

          {(subpageType === 'about' ||
            subpageType === 'faq' ||
            subpageType === 'accessibility') && (
            <div className="space-y-8">
              <h1 className="text-3xl font-black text-navy-950">
                {subpageType === 'about' && 'About Project SHIELD & ShieldQuest'}
                {subpageType === 'faq' && 'Frequently Asked Questions'}
                {subpageType === 'accessibility' && 'Accessibility & Inclusivity Standards'}
              </h1>
              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                ShieldQuest is a youth-focused crime-prevention and scam-awareness learning platform
                that uses an interactive city-board experience, scenario-based decision-making, peer
                discussion and delayed consequences to help youths practise safer choices.
              </p>
              <div className="pt-4">
                <button
                  type="button"
                  onClick={handlePlay}
                  className="rounded-xl bg-navy-950 px-6 py-3 text-xs font-black uppercase text-white shadow-md"
                >
                  Explore ShieldQuest Board
                </button>
              </div>
            </div>
          )}
        </main>
      ) : (
        /* ------------------------------------------------------------- */
        /* MAIN HOMEPAGE                                                 */
        /* ------------------------------------------------------------- */
        <main>
          {/* ----------------------------------------------------------- */}
          {/* 1. HERO SECTION                                             */}
          {/* ----------------------------------------------------------- */}
          <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50 to-slate-100 py-12 sm:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
                {/* Left Pitch */}
                <div className="lg:col-span-7">
                  <div className="inline-flex items-center gap-2 rounded-full border border-civic-200 bg-civic-50 px-3.5 py-1.5 text-xs font-extrabold uppercase tracking-wider text-civic-700">
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
                    ShieldQuest turns crime-prevention education into interactive decisions,
                    consequences and peer discussion — helping youths practise what they would do
                    before facing the situation in real life.
                  </p>

                  {/* Hero CTAs */}
                  <div className="mt-8 flex flex-wrap items-center gap-4">
                    <button
                      type="button"
                      onClick={handlePlay}
                      className="inline-flex items-center gap-2 rounded-xl bg-navy-950 px-6 py-3.5 text-sm font-extrabold uppercase tracking-wider text-white shadow-xl shadow-navy-950/20 transition hover:bg-navy-900 active:scale-95"
                    >
                      <Sparkles className="h-4 w-4 text-amber-400" />
                      <span>Try ShieldQuest</span>
                      <ArrowRight className="h-4 w-4 text-slate-300" />
                    </button>

                    <button
                      type="button"
                      onClick={handleSchoolsCta}
                      className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
                    >
                      <School className="h-4 w-4 text-civic-600" />
                      <span>Bring ShieldQuest to Your School</span>
                    </button>
                  </div>



                  {/* Trust Micro-Badge */}
                  <div className="mt-8 flex items-center gap-3 border-t border-slate-200/80 pt-5">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                    <p className="text-xs font-semibold text-slate-500">
                      Built with Privacy by Design: zero app downloads, zero NRICs, and anonymous
                      cohort evaluation.
                    </p>
                  </div>
                </div>

                {/* Right Visual: Prominent 2.5D City Board & Interactive Game Showcase */}
                <div className="lg:col-span-5">
                  <div className="relative rounded-3xl border-4 border-white bg-gradient-to-br from-navy-900 via-navy-950 to-slate-900 p-6 text-white shadow-2xl">
                    {/* Device Bar */}
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                        <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                        <span className="ml-2 text-xs font-bold text-white/70">
                          ShieldQuest City · Live Experience
                        </span>
                      </div>
                      <PrototypeNotice text="Hybrid 2.5D + 3D PWA" />
                    </div>

                    {/* 2.5D Diamond Stage Representation */}
                    <div className="relative my-4 overflow-hidden rounded-2xl border border-white/15 bg-navy-950/90 p-5">
                      {/* Top District Bar */}
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 pb-2 border-b border-white/10">
                        <span className="flex items-center gap-1.5 text-amber-300">
                          <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                          District 1: School Street
                        </span>
                        <span>16 Perimeter Spaces</span>
                      </div>

                      {/* Diamond Board Mockup Graphic */}
                      <div className="relative my-6 flex items-center justify-center py-4">
                        <div
                          className="relative h-44 w-44 rounded-2xl border-2 border-amber-400/40 bg-gradient-to-br from-teal-500/20 via-indigo-500/20 to-amber-500/20 shadow-inner flex items-center justify-center"
                          style={{ transform: 'rotateX(55deg) rotateZ(-45deg)' }}
                        >
                          {/* 4 Corner Markers */}
                          <div className="absolute -top-3 -left-3 h-7 w-7 rounded-lg bg-amber-400 text-navy-950 flex items-center justify-center font-black text-[9px] shadow-md">
                            GO
                          </div>
                          <div className="absolute -top-3 -right-3 h-7 w-7 rounded-lg bg-teal-400 text-navy-950 flex items-center justify-center font-black text-[9px] shadow-md">
                            SAFE
                          </div>
                          <div className="absolute -bottom-3 -right-3 h-7 w-7 rounded-lg bg-rose-500 text-white flex items-center justify-center font-black text-[9px] shadow-md">
                            TRAP
                          </div>
                          <div className="absolute -bottom-3 -left-3 h-7 w-7 rounded-lg bg-indigo-400 text-navy-950 flex items-center justify-center font-black text-[9px] shadow-md">
                            LORE
                          </div>

                          {/* Central Landmark */}
                          <div className="flex flex-col items-center justify-center rounded-xl bg-navy-950/90 border border-white/20 p-2 shadow-lg">
                            <Shield className="h-7 w-7 text-amber-400 fill-current" />
                            <span className="text-[8px] font-black uppercase text-white mt-1">
                              School
                            </span>
                          </div>

                          {/* Pawn Token */}
                          <div
                            className="absolute -top-1 left-12 h-6 w-6 rounded-full bg-civic-500 border-2 border-white shadow-lg flex items-center justify-center animate-bounce"
                            style={{ animationDuration: '2s' }}
                          >
                            <span className="text-[9px] font-black text-white">P1</span>
                          </div>
                        </div>

                        {/* Interactive Dice Overlay */}
                        <div className="absolute bottom-1 right-2 flex items-center gap-2 rounded-xl bg-white/10 backdrop-blur-md px-3 py-1.5 border border-white/20">
                          <div className="h-6 w-6 rounded-lg bg-white text-navy-950 font-black text-xs flex items-center justify-center shadow">
                            ⚄ 5
                          </div>
                          <span className="text-[10px] font-bold text-slate-200">
                            Roll to Explore
                          </span>
                        </div>
                      </div>

                      {/* Floating Active Scenario Prompt */}
                      <div className="rounded-xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-md">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-extrabold uppercase tracking-wider text-amber-400">
                            Scenario in Progress
                          </span>
                          <span className="rounded bg-teal-500/30 px-1.5 py-0.5 font-bold text-teal-300">
                            Squad: 4 Peers Voting
                          </span>
                        </div>
                        <h4 className="mt-1 text-xs font-black text-white">
                          "The Group Chat Job — Quick $300 for receiving a parcel?"
                        </h4>
                        <div className="mt-2 grid grid-cols-2 gap-2 text-[10px]">
                          <div className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-center text-slate-300">
                            A: Ask what's inside
                          </div>
                          <div className="rounded-lg border border-emerald-400/40 bg-emerald-500/20 p-1.5 text-center font-bold text-emerald-200">
                            B: Step out & report
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Feature Micro-Pills */}
                    <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-extrabold uppercase tracking-wider text-slate-300">
                      <div className="rounded-lg border border-white/10 bg-white/5 py-2">
                        <span className="text-amber-300 block text-xs">4</span>
                        Districts
                      </div>
                      <div className="rounded-lg border border-white/10 bg-white/5 py-2">
                        <span className="text-teal-300 block text-xs">6</span>
                        Guardians
                      </div>
                      <div className="rounded-lg border border-white/10 bg-white/5 py-2">
                        <span className="text-civic-300 block text-xs">PWA</span>
                        Zero Install
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ----------------------------------------------------------- */}
          {/* 2. THE PROBLEM → THE DIFFERENCE                             */}
          {/* ----------------------------------------------------------- */}
          <section id="about" className="py-16 bg-white border-y border-slate-200/80">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-3xl mx-auto">
                <span className="text-xs font-extrabold uppercase tracking-widest text-civic-600">
                  The Learning Difference
                </span>
                <h2 className="mt-2 text-3xl font-black text-navy-950 sm:text-4xl">
                  Crime-prevention education should be experienced, not just explained.
                </h2>
                <p className="mt-3 text-slate-600 font-medium text-base">
                  Traditional awareness material can tell youths what the safer choice is.
                  ShieldQuest lets them make the choice, discuss it with peers and see what happens
                  next.
                </p>
              </div>

              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Card 1: PRACTISE */}
                <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-7 shadow-sm transition hover:shadow-md">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-md shadow-amber-500/25">
                    <Zap className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-xl font-black uppercase tracking-tight text-navy-950">
                    PRACTISE
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 font-medium leading-relaxed">
                    Make decisions in realistic scenarios before real-world stakes occur. Youths
                    experience authentic chat offers, marketplace listings, and urgent requests.
                  </p>
                </div>

                {/* Card 2: DISCUSS */}
                <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-7 shadow-sm transition hover:shadow-md">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-md shadow-teal-600/25">
                    <MessageSquare className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-xl font-black uppercase tracking-tight text-navy-950">
                    DISCUSS
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 font-medium leading-relaxed">
                    Compare reasoning with peers using structured Think–Vote–Explain mechanics.
                    Anonymous squad voting sparks deep dialogue on underlying risk cues.
                  </p>
                </div>

                {/* Card 3: REFLECT */}
                <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-7 shadow-sm transition hover:shadow-md">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-civic-600 text-white shadow-md shadow-civic-600/25">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-xl font-black uppercase tracking-tight text-navy-950">
                    REFLECT
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 font-medium leading-relaxed">
                    Experience both immediate outcomes and delayed consequences. Learn how a single
                    shared password or bank transfer can compound over time.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ----------------------------------------------------------- */}
          {/* 3. SHOW THE PRODUCT (Enter ShieldQuest City)                */}
          {/* ----------------------------------------------------------- */}
          <section className="py-16 bg-slate-100">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-2xl mx-auto">
                <span className="text-xs font-extrabold uppercase tracking-widest text-civic-600">
                  Interactive Platform
                </span>
                <h2 className="mt-2 text-3xl font-black text-navy-950 sm:text-4xl">
                  Enter ShieldQuest City
                </h2>
                <p className="mt-3 text-slate-600 font-medium">
                  Explore districts, encounter realistic scenarios, meet S.H.I.E.L.D. Guardians and
                  build safer decision-making skills.
                </p>
              </div>

              {/* 4-Stage Product Cycle Cards */}
              <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 font-black">
                      1
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      Stage 1
                    </span>
                  </div>
                  <h3 className="mt-4 text-base font-extrabold uppercase tracking-tight text-navy-950">
                    City Board
                  </h3>
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                    Navigate four themed districts on ShieldQuest's original isometric city track
                    using dice rolls and purposeful stops.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 font-black">
                      2
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      Stage 2
                    </span>
                  </div>
                  <h3 className="mt-4 text-base font-extrabold uppercase tracking-tight text-navy-950">
                    Scenario
                  </h3>
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                    Encounter authentic situations: fast-cash job offers, marketplace deals,
                    phishing alerts, and peer dares.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 font-black">
                      3
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      Stage 3
                    </span>
                  </div>
                  <h3 className="mt-4 text-base font-extrabold uppercase tracking-tight text-navy-950">
                    Decision
                  </h3>
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                    Think privately, cast an anonymous squad vote, and defend your perspective using
                    structured Think–Vote–Explain.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-civic-500/10 text-civic-600 font-black">
                      4
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      Stage 4
                    </span>
                  </div>
                  <h3 className="mt-4 text-base font-extrabold uppercase tracking-tight text-navy-950">
                    Consequence
                  </h3>
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                    Uncover immediate fallout and delayed consequences to understand compounding
                    risk over time.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ----------------------------------------------------------- */}
          {/* 4. HOW IT WORKS — ONLY 4 STEPS                              */}
          {/* ----------------------------------------------------------- */}
          <section id="how-it-works" className="py-16 bg-white">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-2xl mx-auto">
                <span className="text-xs font-extrabold uppercase tracking-widest text-civic-600">
                  Facilitated Flow
                </span>
                <h2 className="mt-2 text-3xl font-black text-navy-950 sm:text-4xl">
                  How ShieldQuest Works
                </h2>
                <p className="mt-3 text-slate-600 font-medium">
                  The six-stage learning loop from the proposal, with Think–Vote–Explain inside the
                  Discuss stage.
                </p>
              </div>

              <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    step: '01',
                    title: 'EXPLORE',
                    desc: 'Enter the city and encounter familiar school, retail, digital, and community settings.',
                  },
                  {
                    step: '02',
                    title: 'INVESTIGATE',
                    desc: 'Inspect messages, offers, images, and environmental clues before acting.',
                  },
                  {
                    step: '03',
                    title: 'DISCUSS',
                    desc: 'Think privately, vote anonymously, and explain choices with your squad.',
                  },
                  {
                    step: '04',
                    title: 'DECIDE',
                    desc: 'Choose a response under urgency, temptation, uncertainty, or peer pressure.',
                  },
                  {
                    step: '05',
                    title: 'EXPERIENCE',
                    desc: 'See immediate results and delayed legal, financial, and social consequences.',
                  },
                  {
                    step: '06',
                    title: 'PROTECT',
                    desc: 'Practise safe peer intervention and connect the choice to trusted help.',
                  },
                ].map((item) => (
                  <div
                    key={item.step}
                    className="relative rounded-2xl border border-slate-200 bg-slate-50 p-6 transition hover:shadow-sm"
                  >
                    <span className="text-3xl font-black text-civic-600/30">{item.step}</span>
                    <h3 className="mt-2 text-base font-extrabold uppercase text-navy-950">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-xs text-slate-600 font-medium leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-8 text-center">
                <button
                  type="button"
                  onClick={() => navigate('/how-it-works')}
                  className="inline-flex items-center gap-1.5 text-xs font-extrabold text-civic-600 hover:text-civic-800 transition"
                >
                  <span>See the full 9-step learning approach</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </section>

          {/* ----------------------------------------------------------- */}
          {/* 5. FEATURED MISSIONS (3 Featured Scenarios)                  */}
          {/* ----------------------------------------------------------- */}
          <section className="py-16 bg-slate-50 border-t border-slate-200/80">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-widest text-civic-600">
                    Authored Content
                  </span>
                  <h2 className="mt-2 text-3xl font-black text-navy-950 sm:text-4xl">
                    Real situations. Safer choices.
                  </h2>
                  <p className="mt-2 text-slate-600 font-medium max-w-xl">
                    Three featured scenarios calibrated directly to youth digital vulnerabilities in
                    Singapore.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handlePlay}
                  className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-civic-700 hover:underline"
                >
                  <span>Explore More Scenarios</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
                {featuredScenarios.map((s, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition hover:shadow-md"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-civic-700 uppercase tracking-wider">
                          {s.category}
                        </span>
                        <span className="rounded-md bg-rose-50 px-2 py-0.5 font-extrabold text-rose-700 border border-rose-200">
                          {s.risk}
                        </span>
                      </div>
                      <h3 className="mt-4 text-lg font-black text-navy-950 uppercase tracking-tight">
                        {s.title}
                      </h3>
                      <p className="text-xs font-bold text-slate-400 mt-0.5">{s.subtitle}</p>
                      <p className="mt-3 text-xs text-slate-600 font-medium leading-relaxed">
                        {s.desc}
                      </p>
                    </div>

                    <div className="mt-6 border-t border-slate-100 pt-4 flex items-center justify-between text-xs font-bold text-slate-500">
                      <span className="text-civic-600 font-extrabold">{s.guardian}</span>
                      <button
                        type="button"
                        onClick={handlePlay}
                        className="inline-flex items-center gap-1 text-slate-700 hover:text-civic-600"
                      >
                        <span>Try Mission</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ----------------------------------------------------------- */}
          {/* 6. S.H.I.E.L.D. GUARDIANS (Sleek Dark Section)              */}
          {/* ----------------------------------------------------------- */}
          <section id="framework" className="py-16 bg-navy-950 text-white">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-3xl mx-auto">
                <span className="text-xs font-extrabold uppercase tracking-widest text-amber-400">
                  Behavioural Competencies
                </span>
                <h2 className="mt-2 text-3xl font-black text-white sm:text-4xl">
                  Six skills. One stronger S.H.I.E.L.D.
                </h2>
                <p className="mt-2 text-xs font-extrabold uppercase tracking-widest text-slate-300">
                  SPOT · HOLD · IDENTIFY · EVALUATE · LEAD · DEFEND
                </p>
              </div>

              <div className="mt-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {guardians.map((g) => (
                  <div
                    key={g.name}
                    className={`rounded-2xl border bg-gradient-to-br p-4 backdrop-blur-md transition hover:scale-105 ${g.border} ${g.bg}`}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-black text-white uppercase tracking-tight">
                        {g.name}
                      </h3>
                    </div>
                    <div className="mt-2">
                      <span
                        className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${g.badge}`}
                      >
                        {g.competency}
                      </span>
                    </div>
                    <p className="mt-2 text-[11px] font-medium leading-snug text-slate-300">
                      {g.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ----------------------------------------------------------- */}
          {/* 7. FOR SCHOOLS / PARTNERS (Strong Conversion Section)        */}
          {/* ----------------------------------------------------------- */}
          <section id="schools" className="py-16 bg-white border-b border-slate-200">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-8 sm:p-12 shadow-sm">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                  <div className="lg:col-span-7">
                    <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-civic-600">
                      <School className="h-4 w-4" />
                      <span>School & Facilitator Deployment</span>
                    </span>
                    <h2 className="mt-2 text-3xl font-black text-navy-950 sm:text-4xl">
                      Bring ShieldQuest to your students
                    </h2>
                    <p className="mt-3 text-sm font-medium leading-relaxed text-slate-600">
                      Designed as a facilitated 90-minute youth learning experience that works with
                      phones, tablets or computers.
                    </p>

                    {/* 4 Compact Facts */}
                    <div className="mt-8 grid grid-cols-2 gap-4">
                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="text-lg font-black text-navy-950">20–30 participants</div>
                        <div className="text-xs font-semibold text-slate-500">
                          Typical controlled session
                        </div>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="text-lg font-black text-navy-950">4–5 per squad</div>
                        <div className="text-xs font-semibold text-slate-500">
                          Collaborative learning
                        </div>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="text-lg font-black text-navy-950">90 minutes</div>
                        <div className="text-xs font-semibold text-slate-500">
                          Facilitated experience
                        </div>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="text-lg font-black text-navy-950">No installation</div>
                        <div className="text-xs font-semibold text-slate-500">
                          Browser-based PWA
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 flex flex-wrap gap-4">
                      <button
                        type="button"
                        onClick={handleSchoolsCta}
                        className="inline-flex items-center gap-2 rounded-xl bg-civic-600 px-6 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-civic-600/25 transition hover:bg-civic-700 active:scale-95"
                      >
                        <Send className="h-4 w-4" />
                        <span>Plan a ShieldQuest Session</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate('/for-schools')}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                      >
                        <span>See How a Session Works</span>
                      </button>
                    </div>
                  </div>

                  {/* Visual Session Snapshot */}
                  <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                        Workshop Breakdown
                      </span>
                      <span className="text-xs font-black text-civic-700">90 Mins Total</span>
                    </div>
                    <div className="mt-4 space-y-3 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-700">
                          1. Onboarding & Ground Rules
                        </span>
                        <span className="font-bold text-slate-400">15 mins</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-700">
                          2. City Exploration & Scenarios
                        </span>
                        <span className="font-bold text-slate-400">45 mins</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-700">
                          3. Think–Vote–Explain Debrief
                        </span>
                        <span className="font-bold text-slate-400">20 mins</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-700">
                          4. Post-Reflection & Takeaways
                        </span>
                        <span className="font-bold text-slate-400">10 mins</span>
                      </div>
                    </div>
                    <div className="mt-5 rounded-xl bg-slate-50 p-3 text-[11px] text-slate-500 font-medium">
                      Includes facilitator slides, discussion rubrics, and aggregated cohort
                      learning summaries.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ----------------------------------------------------------- */}
          {/* 8. WHAT WE MEASURE                                          */}
          {/* ----------------------------------------------------------- */}
          <section className="py-16 bg-slate-50">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-3xl mx-auto">
                <span className="text-xs font-extrabold uppercase tracking-widest text-civic-600">
                  Evaluation Framework
                </span>
                <h2 className="mt-2 text-3xl font-black text-navy-950 sm:text-4xl">
                  Designed to Measure Real Learning Outcomes
                </h2>
                <p className="mt-3 text-slate-600 font-medium text-sm">
                  More than engagement — we want to measure learning. ShieldQuest uses pre/post
                  learning checks and, where feasible, follow-up evaluation to understand whether
                  participants retain safer decision-making skills.
                </p>
              </div>

              <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                    <Eye className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-base font-extrabold text-navy-950 uppercase">
                    Risk Recognition
                  </h3>
                  <p className="mt-2 text-xs text-slate-600 font-medium leading-relaxed">
                    Can youths identify warning signs, urgency triggers, and suspicious commission
                    offers?
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-base font-extrabold text-navy-950 uppercase">
                    Decision Accuracy
                  </h3>
                  <p className="mt-2 text-xs text-slate-600 font-medium leading-relaxed">
                    Can they choose safer actions and independent verification under realistic peer
                    pressure?
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-base font-extrabold text-navy-950 uppercase">
                    Consequence Awareness
                  </h3>
                  <p className="mt-2 text-xs text-slate-600 font-medium leading-relaxed">
                    Do they understand what can happen next legally, financially, and socially?
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
                    <Users className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-base font-extrabold text-navy-950 uppercase">
                    Peer Intervention Confidence
                  </h3>
                  <p className="mt-2 text-xs text-slate-600 font-medium leading-relaxed">
                    Can they step in constructively and help a friend make a safer choice?
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-base font-extrabold text-navy-950 uppercase">
                    Retention
                  </h3>
                  <p className="mt-2 text-xs text-slate-600 font-medium leading-relaxed">
                    Do participants recall key statutory definitions and safe habits weeks after
                    workshop completion?
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-base font-extrabold text-navy-950 uppercase">
                    Engagement
                  </h3>
                  <p className="mt-2 text-xs text-slate-600 font-medium leading-relaxed">
                    Sustained participation, uncoerced squad debates, and voluntary replay of
                    alternative branches.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ----------------------------------------------------------- */}
          {/* 9. TRUST & PRIVACY                                          */}
          {/* ----------------------------------------------------------- */}
          <section id="safety" className="py-14 bg-navy-950 text-white">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-teal-400/40 bg-teal-500/20 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-teal-300">
                    <Lock className="h-3.5 w-3.5" />
                    <span>Privacy by Design</span>
                  </div>
                  <h2 className="mt-3 text-2xl font-black text-white sm:text-3xl">
                    Designed with youth safety and privacy in mind
                  </h2>
                  <p className="mt-2 text-xs font-extrabold uppercase tracking-wider text-slate-300">
                    Data minimisation · Pseudonymous evaluation · Facilitated debriefs · Moderated
                    content
                  </p>
                  <p className="mt-2 text-xs text-slate-400 max-w-2xl leading-relaxed">
                    Zero NRICs, zero banking details, and zero phone numbers collected. Sessions use
                    temporary room codes to protect learner identities during and after workshops.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/safety')}
                  className="shrink-0 inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-xs font-extrabold uppercase tracking-wider text-white hover:bg-white/20 transition"
                >
                  <span>Read Safety & Privacy Approach</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </section>

          {/* ----------------------------------------------------------- */}
          {/* 10. FAQ ACCORDION (3 Common FAQs by default)                */}
          {/* ----------------------------------------------------------- */}
          <section className="py-16 bg-white">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <span className="text-xs font-extrabold uppercase tracking-widest text-civic-600">
                  Common Enquiries
                </span>
                <h2 className="mt-2 text-3xl font-black text-navy-950 sm:text-4xl">
                  Frequently Asked Questions
                </h2>
              </div>

              <div className="mt-10 space-y-4">
                {visibleFaqs.map((faq, index) => {
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

              {/* View All FAQs toggle */}
              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => setShowAllFaqs(!showAllFaqs)}
                  className="inline-flex items-center gap-1.5 text-xs font-extrabold text-civic-600 hover:text-civic-800"
                >
                  <span>{showAllFaqs ? 'Show Fewer Questions' : 'View All FAQs'}</span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform ${showAllFaqs ? 'rotate-180' : ''}`}
                  />
                </button>
              </div>
            </div>
          </section>

          {/* ----------------------------------------------------------- */}
          {/* 11. FINAL CTA                                               */}
          {/* ----------------------------------------------------------- */}
          <section className="py-20 bg-gradient-to-br from-navy-950 via-slate-900 to-navy-900 text-white text-center">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-amber-400 text-navy-950 shadow-lg shadow-amber-400/20 mb-6">
                <Shield className="h-8 w-8 fill-current" />
              </div>
              <h2 className="text-3xl font-black uppercase tracking-tight text-white sm:text-5xl">
                Ready to enter ShieldQuest?
              </h2>
              <p className="mt-4 text-base text-slate-300 max-w-2xl mx-auto font-medium">
                Experience the platform or explore how ShieldQuest could support youth learning in
                your organisation.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={handlePlay}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-civic-600 to-civic-700 px-7 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-civic-600/30 transition hover:brightness-110 active:scale-95"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Try ShieldQuest</span>
                </button>
                <button
                  type="button"
                  onClick={handleSchoolsCta}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3.5 text-xs font-black uppercase tracking-wider text-white hover:bg-white/20 transition"
                >
                  <School className="h-4 w-4" />
                  <span>For Schools & Partners</span>
                </button>
              </div>
            </div>
          </section>
        </main>
      )}

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
                An evidence-informed, scenario-based youth crime-prevention and scam-awareness
                platform designed for schools, youth organisations, and community facilitators.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-300">
                Quick Links
              </h4>
              <ul className="mt-3 space-y-2 text-xs text-slate-400">
                <li>
                  <button
                    type="button"
                    onClick={() => navigate('/how-it-works')}
                    className="hover:text-white"
                  >
                    How It Works
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigate('/for-schools')}
                    className="hover:text-white"
                  >
                    For Schools & Partners
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigate('/safety')}
                    className="hover:text-white"
                  >
                    Safety & Privacy
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigate('/about')}
                    className="hover:text-white"
                  >
                    About Project SHIELD
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-300">
                Access Portals
              </h4>
              <ul className="mt-3 space-y-2 text-xs text-slate-400">
                <li>
                  <button type="button" onClick={handlePlay} className="hover:text-white text-left">
                    Launch Player PWA
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={handleFacilitatorLogin}
                    className="hover:text-white text-left"
                  >
                    Facilitator Login Portal
                  </button>
                </li>
                <li>
                  <span className="text-slate-500">Release Preview 1.0</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
            <span>© Project SHIELD · Youth Crime Prevention Learning Platform.</span>
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
                  Thank you for your enquiry. In a full deployment, our facilitation team will
                  contact your school or organisation to review dates, learner bands, and room
                  setup.
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
                    <h3 className="text-lg font-black uppercase text-navy-950">
                      Plan a ShieldQuest Session
                    </h3>
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
                    <label className="block text-xs font-bold text-slate-700">
                      School / Organisation
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. West Coast Secondary School"
                      className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:border-civic-600 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700">
                        Official Email
                      </label>
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
                    <label className="block text-xs font-bold text-slate-700">
                      Estimated Cohort Size
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 120 students"
                      className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:border-civic-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700">
                      Additional Notes / Preferred Dates
                    </label>
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
