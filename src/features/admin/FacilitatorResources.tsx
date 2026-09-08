import { Download, Printer } from 'lucide-react';
import { Button } from '../../design-system/DesignSystem';

export function FacilitatorResources() {
  const resources = [
    {
      title: 'ShieldQuest Master Facilitator Guide',
      desc: 'Complete 40-page guide with classroom management protocols, room layout advice, and discussion frameworks.',
      format: 'PDF (2.4 MB)',
      category: 'Core Curriculum',
      categoryColor: 'bg-civic-50 text-civic-700 border-civic-200',
    },
    {
      title: '90-Minute Workshop Session Checklist',
      desc: 'Step-by-step preparation checklist for computer labs, hall projections, and mobile connectivity testing.',
      format: 'PDF (420 KB)',
      category: 'Operations',
      categoryColor: 'bg-[var(--sq-surface-sunk)] text-[var(--sq-ink)] border-[var(--sq-line)]',
    },
    {
      title: 'Think–Vote–Explain Debrief Prompts & Facilitation Tips',
      desc: 'Guided inquiry scripts to steer lively debates without lecturing, focusing on empathy and legal clarity.',
      format: 'PDF (880 KB)',
      category: 'Pedagogy',
      categoryColor: 'bg-amber-50 text-amber-800 border-amber-200',
    },
    {
      title: 'Youth Safeguarding & Escalation Protocol',
      desc: 'Safety guidelines for handling disclosures, signs of ongoing victimization, and reporting avenues (ScamShield, SPF).',
      format: 'PDF (650 KB)',
      category: 'Safeguarding',
      categoryColor: 'bg-coral-50 text-coral-800 border-coral-200',
    },
    {
      title: 'Printable Offline Backup Decision Sheets',
      desc: 'Paper-based voting cards and scenario handouts for schools or community venues experiencing network dropouts.',
      format: 'Printable PDF (1.1 MB)',
      category: 'Offline Resilience',
      categoryColor: 'bg-teal-50 text-teal-800 border-teal-200',
    },
    {
      title: 'Parent & Guardian Information One-Pager',
      desc: 'Explaining Project SHIELD goals, Privacy by Design assurances, and follow-up home conversation prompts.',
      format: 'PDF (310 KB)',
      category: 'Community',
      categoryColor: 'bg-blue-50 text-blue-800 border-blue-200',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--sq-line)] pb-4">
        <div>
          <h2 className="text-xl font-black text-navy-950">Facilitator Resource Library</h2>
          <p className="text-xs text-[var(--sq-ink-muted)] mt-0.5">
            Download pedagogical guides, checklists, and printable emergency classroom backup forms.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => alert('Downloading complete Facilitator Toolkit (.zip)')}
          leftIcon={<Download className="h-4 w-4" />}
        >
          Download all (.zip)
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {resources.map((item, idx) => (
          <div
            key={idx}
            className="flex flex-col justify-between rounded-[16px] border border-[var(--sq-line)] bg-[var(--sq-surface)] p-5 shadow-sm transition hover:border-civic-300 hover:shadow-md"
          >
            <div>
              <div className="flex items-center justify-between text-xs">
                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${item.categoryColor}`}>
                  {item.category}
                </span>
                <span className="text-[var(--sq-ink-muted)] font-semibold">{item.format}</span>
              </div>
              <h3 className="mt-3 text-base font-extrabold text-navy-950">{item.title}</h3>
              <p className="mt-1.5 text-xs text-[var(--sq-ink-muted)] leading-relaxed">{item.desc}</p>
            </div>

            <div className="mt-5 border-t border-[var(--sq-line)] pt-3 flex items-center justify-between">
              <button
                type="button"
                onClick={() => alert(`Simulating print preview for: ${item.title}`)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--sq-ink-muted)] hover:text-navy-950 transition"
              >
                <Printer className="h-3.5 w-3.5 text-[var(--sq-ink-muted)]" />
                <span>Print Ready</span>
              </button>
              <button
                type="button"
                onClick={() => alert(`Downloading ${item.title}`)}
                className="inline-flex items-center gap-1.5 rounded-[6px] border border-[var(--sq-line)] bg-[var(--sq-surface)] px-3 py-1.5 text-xs font-bold text-[var(--sq-ink)] hover:bg-[var(--sq-surface-sunk)] shadow-sm transition"
              >
                <Download className="h-3.5 w-3.5 text-civic-600" />
                <span>Download</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
