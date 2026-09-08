import { Accessibility, EyeOff, HeartHandshake, ShieldCheck } from 'lucide-react';
import { Section, SectionHeading } from '../../../design-system/DesignSystem';

/**
 * Safety, privacy and safeguarding.
 *
 * The second and last `inverse` section. It sits near the end on purpose: by
 * this point a school reader has decided they like the idea and has started
 * worrying about data, consent and whether the content could hurt someone.
 * These are commitments the project has actually made, phrased as what we do
 * NOT collect — the only form of privacy claim a reader can verify.
 */
const COMMITMENTS = [
  {
    icon: EyeOff,
    title: 'We do not ask who you are',
    points: [
      'No names, NRIC numbers, phone numbers or banking details.',
      'Participation is anonymous or pseudonymous throughout.',
      'Pre and post responses are linked by a random session code, never by a name.',
    ],
  },
  {
    icon: ShieldCheck,
    title: 'Reporting stays aggregated',
    points: [
      'Facilitators see squad-level patterns, not individual profiles.',
      'Evaluation and reporting use aggregated results only.',
      'Aligned with the PDPA; no real Singpass or banking data is ever requested.',
    ],
  },
  {
    icon: HeartHandshake,
    title: 'Nobody has to disclose anything',
    points: [
      'No requirement to share personal experience of victimisation or offending.',
      'No competitive scoring based on personal disclosures.',
      'Scenarios centre the offender’s manipulation — feedback never implies a victim deserved harm.',
    ],
  },
  {
    icon: Accessibility,
    title: 'Designed to be usable',
    points: [
      'Readable language, adjustable text size and captions for multimedia.',
      'Status is never signalled by colour alone.',
      'Responsive across common phones, tablets and laptops, with low-bandwidth access in mind.',
    ],
  },
];

export function Safety() {
  return (
    <Section id="safety" tone="inverse">
      <SectionHeading
        inverse
        eyebrow="Safety, privacy & safeguarding"
        title="A crime-prevention tool should collect less, not more"
        lede="Youth participants are asked to think about risky situations. That only works if the tool itself is demonstrably safe to use."
      />

      <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2">
        {COMMITMENTS.map((block) => (
          <div
            key={block.title}
            className="rounded-[16px] border border-[var(--color-navy-800)] bg-[var(--color-navy-900)] p-6"
          >
            <div className="flex items-center gap-2.5">
              <block.icon className="h-5 w-5 shrink-0 text-[var(--color-teal-400)]" />
              <h3 className="text-base font-extrabold text-white">{block.title}</h3>
            </div>
            <ul className="mt-3.5 space-y-2">
              {block.points.map((point) => (
                <li
                  key={point}
                  className="flex gap-2.5 text-sm leading-relaxed text-[var(--color-navy-200)]"
                >
                  <span aria-hidden="true" className="mt-1.5 text-[var(--color-teal-400)]">
                    —
                  </span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <p className="mx-auto mt-10 max-w-2xl text-center text-sm leading-relaxed text-[var(--color-navy-200)]">
        Where a scenario touches something a participant may need help with, the app points towards
        a trusted adult and reviewed official support channels — not towards a score.
      </p>
    </Section>
  );
}
