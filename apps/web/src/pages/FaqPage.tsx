import React, { useState } from 'react';
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Search,
  ShieldAlert,
} from 'lucide-react';

interface FaqItem {
  id: string;
  category: 'about' | 'privacy' | 'gameplay' | 'safety';
  question: string;
  answer: string;
}

const faqs: FaqItem[] = [
  {
    id: 'faq-1',
    category: 'about',
    question: 'What is ShieldQuest?',
    answer:
      'ShieldQuest is an interactive, scenario-based educational adventure game designed to help youths explore risky situations, recognise psychological manipulation, understand delayed consequences, and practise safer decision-making.',
  },
  {
    id: 'faq-2',
    category: 'about',
    question: 'Who is ShieldQuest designed for?',
    answer:
      'The platform is designed primarily for youths, secondary school students, and youth groups who navigate social pressure and digital channels. It is also tailored for educators, youth counsellors, and peer mentors to facilitate group discussions.',
  },
  {
    id: 'faq-3',
    category: 'about',
    question: 'Is it a game or an educational resource?',
    answer:
      'It is both. ShieldQuest uses game mechanics—an interactive City Board, branching consequences, secret squad voting, and Guardian progression—to deliver experiential crime-prevention learning without the dryness of traditional lectures.',
  },
  {
    id: 'faq-4',
    category: 'gameplay',
    question: 'What kinds of situations does the game explore?',
    answer:
      'Scenarios cover realistic digital and social dilemmas: e-commerce fake job traps, unauthorized parcel deliveries, phishing links and credential requests disguised as gaming tournament entries, group chat dares, and bystander situations where a friend is being coerced.',
  },
  {
    id: 'faq-5',
    category: 'gameplay',
    question: 'What are the Guardians?',
    answer:
      'The six Guardians (VeriFox, Echo, Beacon, Shieldfin, Cluepaw, and ByteBuddy) represent transferable crime-prevention disciplines: verification, consultation, reporting, peer protection, situational awareness, and digital hygiene. They are unlocked solely through demonstrated reasoning.',
  },
  {
    id: 'faq-6',
    category: 'privacy',
    question: 'Does ShieldQuest collect personal information?',
    answer:
      'No. In line with our strict data minimisation policy, this public website does not collect personal names, phone numbers, emails, or student IDs. For future squad multiplayer gameplay in Phase 2, sessions will rely on temporary random room codes rather than permanent user accounts or persistent profiles.',
  },
  {
    id: 'faq-7',
    category: 'about',
    question: 'Is the full game available yet?',
    answer:
      'The full game is currently in active development by Team SecurePi. This public website represents Phase 1: introducing the world, design framework, and interactive consequence preview. Core gameplay engine and multiplayer modules will follow in upcoming phases.',
  },
  {
    id: 'faq-8',
    category: 'safety',
    question: 'Does ShieldQuest replace official advice or reporting channels?',
    answer:
      'No. ShieldQuest is an educational simulation and is not a substitute for official law enforcement or emergency services. If you suspect you are being targeted by an active scam, contact the Singapore Police Force or visit the official ScamShield portal immediately.',
  },
];

export const FaqPage: React.FC = () => {
  const [openId, setOpenId] = useState<string | null>('faq-1');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const toggleAccordion = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesQuery =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">
      {/* Header */}
      <div className="max-w-3xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-shield-navy/90 border border-shield-cardBorder text-xs font-mono font-semibold text-shield-cyan shadow-sm">
          <HelpCircle className="w-3.5 h-3.5 text-shield-cyan" />
          <span>KNOWLEDGE BASE // FREQUENTLY ASKED QUESTIONS</span>
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-black text-white tracking-tight leading-tight">
          Answers & Safety Principles
        </h1>
        <p className="text-base sm:text-lg text-shield-cream/90 leading-relaxed">
          Find answers about ShieldQuest’s purpose, intended audience, privacy practices, and development roadmap.
        </p>
      </div>

      {/* Official Safety Notice Banner */}
      <div className="p-6 sm:p-7 rounded-2xl bg-shield-void/90 border border-shield-cardBorder/80 flex flex-col sm:flex-row items-start gap-4 shadow-xl">
        <ShieldAlert className="w-6 h-6 text-shield-gold flex-shrink-0 mt-1" />
        <div className="space-y-2 text-sm text-shield-muted leading-relaxed">
          <h3 className="text-base font-heading font-black text-white">Emergency & Reporting Notice</h3>
          <p className="text-shield-cream/90">
            ShieldQuest is an educational simulation and does not monitor or handle real crime reports. If you encounter
            real-world threats, fraud, or urgent emergencies in Singapore:
          </p>
          <div className="flex flex-wrap gap-4 pt-2 text-xs font-mono">
            <span className="text-white font-bold bg-shield-navy px-2.5 py-1 rounded border border-shield-cardBorder">
              Police Hotline: 999
            </span>
            <span className="text-white font-bold bg-shield-navy px-2.5 py-1 rounded border border-shield-cardBorder">
              Anti-Scam Helpline: 1800-722-6688
            </span>
            <span className="text-shield-cyan font-bold bg-shield-navy px-2.5 py-1 rounded border border-shield-cardBorder">
              Official Portal: scamshield.gov.sg
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1" role="tablist">
          {[
            { id: 'all', label: 'All FAQs' },
            { id: 'about', label: 'About' },
            { id: 'gameplay', label: 'Gameplay' },
            { id: 'privacy', label: 'Privacy' },
            { id: 'safety', label: 'Safety' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={selectedCategory === cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all focus-visible:ring-2 focus-visible:ring-shield-cyan ${
                selectedCategory === cat.id
                  ? 'bg-shield-blue text-white shadow-glow-blue font-bold border border-shield-cyan/50'
                  : 'bg-shield-void/80 text-shield-muted hover:text-white border border-shield-cardBorder'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative sm:w-64">
          <Search className="w-4 h-4 text-shield-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-shield-void/90 border border-shield-cardBorder text-xs text-white placeholder-shield-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-shield-cyan shadow-sm"
            aria-label="Search frequently asked questions"
          />
        </div>
      </div>

      {/* Accordion List */}
      <div className="space-y-4" role="region" aria-label="FAQ Accordion">
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className={`game-panel border transition-all duration-200 overflow-hidden ${
                  isOpen ? 'border-shield-cyan/50 bg-shield-surface/90 shadow-lg' : 'border-shield-cardBorder'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleAccordion(faq.id)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-shield-cyan"
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${faq.id}`}
                >
                  <span className="text-base sm:text-lg font-heading font-black text-white">
                    {faq.question}
                  </span>
                  <div className="p-1.5 rounded-lg bg-shield-void border border-shield-cardBorder text-shield-cyan flex-shrink-0">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {isOpen && (
                  <div
                    id={`faq-answer-${faq.id}`}
                    className="px-6 pb-6 text-sm sm:text-base text-shield-cream/90 leading-relaxed border-t border-shield-cardBorder/40 pt-4"
                  >
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="game-panel p-8 text-center text-shield-muted">
            <p>No questions matched your query. Try a different search term or category filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};
