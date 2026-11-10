import React, { useState } from 'react';
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
} from 'lucide-react';

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
      'ShieldQuest is an interactive, scenario-based adventure game that helps young people explore risky situations, spot manipulation tactics, and practise safer decision-making.',
  },
  {
    id: 'faq-2',
    question: 'Who is it for?',
    answer:
      'The experience is designed for youths and students navigating digital communications and social pressure. It also supports educators, counsellors, and peer mentors running interactive discussions.',
  },
  {
    id: 'faq-3',
    question: 'How does the game work?',
    answer:
      'Players navigate City Board districts, inspect simulated messages or clues, and make choices under pressure. Decisions reveal immediate outcomes followed by realistic delayed consequences.',
  },
  {
    id: 'faq-4',
    question: 'What are Guardians?',
    answer:
      'The six Guardians embody core protective disciplines—such as verification, peer protection, and digital hygiene. They are unlocked solely through demonstrated reasoning in missions.',
  },
  {
    id: 'faq-5',
    question: 'Is the game available now?',
    answer:
      'The public website introduces the game world, principles, and interactive teaser. Full gameplay and squad multiplayer modes are currently in active development by Team SecurePi.',
  },
  {
    id: 'faq-6',
    question: 'Does ShieldQuest collect personal information?',
    answer:
      'No. This public website does not collect personal names, contact details, or identity data. Planned multiplayer rooms will use temporary room codes without persistent user tracking.',
  },
  {
    id: 'faq-7',
    question: 'Is ShieldQuest an official reporting service?',
    answer:
      'No. ShieldQuest is an educational simulation, not an official emergency or law enforcement tool. If you encounter active scams or urgent danger, contact the police or official hotlines immediately.',
  },
];

export const FaqPage: React.FC = () => {
  const [openId, setOpenId] = useState<string | null>('faq-1');

  const toggleAccordion = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      {/* Header */}
      <div className="max-w-3xl space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-shield-navy border border-shield-cardBorder text-xs font-mono font-semibold text-shield-cyan">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>FREQUENTLY ASKED QUESTIONS</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-heading font-black text-white tracking-tight leading-tight">
          Answers & Safety Principles
        </h1>
        <p className="text-base sm:text-lg text-shield-cream/90 leading-relaxed">
          Key questions about ShieldQuest’s purpose, gameplay, privacy, and safety principles.
        </p>
      </div>

      {/* Emergency Notice Banner */}
      <div className="p-5 sm:p-6 rounded-2xl bg-shield-void/90 border border-shield-cardBorder flex flex-col sm:flex-row items-start gap-4">
        <ShieldAlert className="w-5 h-5 text-shield-gold flex-shrink-0 mt-0.5" />
        <div className="space-y-1.5 text-xs sm:text-sm text-shield-muted leading-relaxed">
          <strong className="text-white block">Emergency & Reporting Notice</strong>
          <p>
            ShieldQuest is an educational simulation. For real-world emergencies or scams in Singapore, contact the Police at 999, the Anti-Scam Helpline at 1800-722-6688, or visit scamshield.gov.sg.
          </p>
        </div>
      </div>

      {/* Clean Accordion List */}
      <div className="space-y-3" role="region" aria-label="FAQ Accordion">
        {faqs.map((faq) => {
          const isOpen = openId === faq.id;
          return (
            <div
              key={faq.id}
              className={`game-panel border transition-colors overflow-hidden ${
                isOpen ? 'border-shield-cyan/50 bg-shield-surface/90' : 'border-shield-cardBorder'
              }`}
            >
              <button
                type="button"
                onClick={() => toggleAccordion(faq.id)}
                className="w-full px-5 sm:px-6 py-4 sm:py-5 text-left flex items-center justify-between gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-shield-cyan"
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${faq.id}`}
              >
                <span className="text-base sm:text-lg font-heading font-bold text-white">
                  {faq.question}
                </span>
                <div className="p-1 rounded-lg bg-shield-void border border-shield-cardBorder text-shield-cyan flex-shrink-0">
                  {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {isOpen && (
                <div
                  id={`faq-answer-${faq.id}`}
                  className="px-5 sm:px-6 pb-5 text-sm sm:text-base text-shield-cream/90 leading-relaxed border-t border-shield-cardBorder/40 pt-3"
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
