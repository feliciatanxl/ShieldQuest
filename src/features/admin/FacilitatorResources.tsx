import { Download, Printer } from 'lucide-react';

export function FacilitatorResources() {
  const resources = [
    {
      title: 'ShieldQuest Master Facilitator Guide',
      desc: 'Complete 40-page guide with classroom management protocols, room layout advice, and discussion frameworks.',
      format: 'PDF (2.4 MB)',
      category: 'Core Curriculum',
    },
    {
      title: '90-Minute Workshop Session Checklist',
      desc: 'Step-by-step preparation checklist for computer labs, hall projections, and mobile connectivity testing.',
      format: 'PDF (420 KB)',
      category: 'Operations',
    },
    {
      title: 'Think–Vote–Explain Debrief Prompts & Facilitation Tips',
      desc: 'Guided inquiry scripts to steer lively debates without lecturing, focusing on empathy and legal clarity.',
      format: 'PDF (880 KB)',
      category: 'Pedagogy',
    },
    {
      title: 'Youth Safeguarding & Escalation Protocol',
      desc: 'Safety guidelines for handling disclosures, signs of ongoing victimization, and reporting avenues (ScamShield, SPF).',
      format: 'PDF (650 KB)',
      category: 'Safeguarding',
    },
    {
      title: 'Printable Offline Backup Decision Sheets',
      desc: 'Paper-based voting cards and scenario handouts for schools or community venues experiencing network dropouts.',
      format: 'Printable PDF (1.1 MB)',
      category: 'Offline Resilience',
    },
    {
      title: 'Parent & Guardian Information One-Pager',
      desc: 'Explaining Project SHIELD goals, Privacy by Design assurances, and follow-up home conversation prompts.',
      format: 'PDF (310 KB)',
      category: 'Community',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-black text-white">Facilitator Resource Library</h2>
          <p className="text-xs text-slate-400">
            Download pedagogical guides, checklists, and printable emergency classroom backup forms.
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert('Downloading complete Facilitator Toolkit (.zip)')}
          className="inline-flex items-center gap-2 rounded-xl bg-civic-600 px-4 py-2 text-xs font-black uppercase tracking-wider text-white shadow hover:bg-civic-500"
        >
          <Download className="h-4 w-4" />
          <span>Download All (.ZIP)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {resources.map((item, idx) => (
          <div
            key={idx}
            className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/70 p-5 transition hover:border-slate-700 hover:bg-slate-900"
          >
            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold uppercase tracking-wider text-civic-400">
                  {item.category}
                </span>
                <span className="text-slate-500 font-bold">{item.format}</span>
              </div>
              <h3 className="mt-2.5 text-base font-extrabold text-white">{item.title}</h3>
              <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">{item.desc}</p>
            </div>

            <div className="mt-5 border-t border-slate-800/80 pt-3 flex items-center justify-between">
              <button
                type="button"
                onClick={() => alert(`Simulating print preview for: ${item.title}`)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-200"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print Ready</span>
              </button>
              <button
                type="button"
                onClick={() => alert(`Downloading ${item.title}`)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-200 hover:bg-slate-700"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
