import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ShieldAlert } from 'lucide-react';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const faqs: FaqItem[] = [
  {
    id: 'faq-1',
    question: 'What is ShieldQuest?',
    answer:
      'ShieldQuest is a cooperative 3D crime-prevention adventure game in development by SecurePi. Its initial pilot focuses on shop-theft prevention in a virtual Retail District.',
  },
  {
    id: 'faq-2',
    question: 'Who is it for?',
    answer:
      'It is designed for young people, with educators, counsellors and peer mentors able to use it to guide discussion. The longer-term vision is an adventure that Singaporeans more widely can enjoy.',
  },
  {
    id: 'faq-3',
    question: 'How does the game work?',
    answer:
      'Players explore a stylised 3D world with their own avatar, team up in private squads of up to five, investigate cases, complete mini-games and make decisions through Think–Vote–Explain. Choices lead to immediate and delayed consequences.',
  },
  {
    id: 'faq-4',
    question: 'What are Guardians?',
    answer:
      'Guardians are six companion characters that players are planned to unlock as they progress and build their S.H.I.E.L.D. competencies.',
  },
  {
    id: 'faq-5',
    question: 'Is the game available now?',
    answer:
      'Not yet. This website is a preview of the game world and its ideas. The game, including squad play and wider public multiplayer, is still in development.',
  },
  {
    id: 'faq-6',
    question: 'Does ShieldQuest collect personal information?',
    answer:
      'This preview website does not ask you for your name, contact details or an account. How the full game will handle data is still being designed.',
  },
  {
    id: 'faq-7',
    question: 'Is ShieldQuest an official reporting service?',
    answer:
      'No. ShieldQuest is an educational game, not a police or emergency reporting service. If you see a crime or someone is in danger, contact the police directly.',
  },
];

export const FaqPage: React.FC = () => {
  const [openId, setOpenId] = useState<string | null>('faq-1');

  const toggleAccordion = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-6">
        <div className="flex-1 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-shield-navy border border-shield-cardBorder text-xs font-mono font-semibold text-shield-cyan">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>FREQUENTLY ASKED QUESTIONS</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-heading font-black text-shield-cream tracking-tight leading-tight">
            Answers & Safety Principles
          </h1>
          <p className="text-base sm:text-lg text-shield-cream/90 leading-relaxed">
            Quick answers about the game, the preview and staying safe.
          </p>
        </div>
        <div className="hidden sm:flex relative h-28 w-28 flex-shrink-0 items-center justify-center" aria-hidden="true">
          <span className="absolute inset-0 rounded-3xl bg-gradient-to-br from-shield-cyan/30 to-shield-violet/30 blur-xl" />
          <span className="relative flex h-24 w-24 rotate-6 items-center justify-center rounded-3xl bg-gradient-to-br from-shield-blue to-shield-violet text-white shadow-glow-blue">
            <HelpCircle className="w-12 h-12 -rotate-6" />
          </span>
        </div>
      </div>

      {/* Emergency Notice Banner */}
      <div className="p-5 sm:p-6 rounded-2xl border border-shield-gold/40 bg-shield-gold/10 flex items-start gap-4" role="note">
        <span className="p-2 rounded-xl bg-shield-gold/20 text-shield-gold flex-shrink-0">
          <ShieldAlert className="w-5 h-5" aria-hidden="true" />
        </span>
        <div className="space-y-1 text-xs sm:text-sm text-shield-cream/90 leading-relaxed">
          <strong className="text-shield-cream block font-heading">Emergency & Reporting Notice</strong>
          <p>
            ShieldQuest is an educational game, not a reporting service. In an emergency in Singapore, call the Police at
            999. For scams, call the Anti-Scam Helpline at 1800-722-6688.
          </p>
        </div>
      </div>

      {/* Accordion */}
      <div className="space-y-3" role="region" aria-label="FAQ Accordion">
        {faqs.map((faq, idx) => {
          const isOpen = openId === faq.id;
          return (
            <div
              key={faq.id}
              className={`game-panel overflow-hidden border transition-all duration-200 ${
                isOpen ? 'border-shield-cyan/60 shadow-glow-cyan' : 'border-shield-cardBorder hover:border-shield-cyan/40'
              }`}
            >
              <h2>
                <button
                  type="button"
                  onClick={() => toggleAccordion(faq.id)}
                  className="w-full px-5 sm:px-6 py-4 sm:py-5 text-left flex items-center gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-shield-cyan"
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${faq.id}`}
                >
                  <span
                    className={`hidden sm:flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold transition-colors ${
                      isOpen ? 'bg-shield-cyan text-shield-void' : 'bg-shield-void border border-shield-cardBorder text-shield-muted'
                    }`}
                    aria-hidden="true"
                  >
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span className="flex-1 text-base sm:text-lg font-heading font-bold text-shield-cream">{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 flex-shrink-0 text-shield-cyan transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    aria-hidden="true"
                  />
                </button>
              </h2>

              {isOpen && (
                <div
                  id={`faq-answer-${faq.id}`}
                  className="px-5 sm:px-6 sm:pl-[4.5rem] pb-5 text-sm sm:text-base text-shield-cream/90 leading-relaxed animate-fadeIn"
                >
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
