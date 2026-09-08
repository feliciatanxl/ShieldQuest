import { ArrowRight, School, Sparkles } from 'lucide-react';
import { Button } from '../../../design-system/DesignSystem';

/**
 * Closing statement.
 *
 * The proposal's own closing argument, because it is the sharpest sentence in
 * the whole document and it frames what the product is for: prevention happens
 * at the moment of the decision, not in the assembly hall afterwards.
 */
export function ClosingCta({
  onPlay,
  onEnquiry,
}: {
  onPlay: () => void;
  onEnquiry: () => void;
}) {
  return (
    <section className="bg-[var(--color-navy-950)] py-20 text-center">
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--color-amber-400)]">
          Choose right. Protect together.
        </p>

        <h2 className="mt-4 text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl">
          Crime prevention happens before an offence takes place.
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-[var(--color-navy-200)]">
          It happens at the exact moment a young person decides whether to follow a dare, accept
          suspicious money, lend an account, or step in when a friend is walking into something.
          ShieldQuest is where they get to practise that moment first.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Button
            size="lg"
            variant="gold"
            onClick={onPlay}
            leftIcon={<Sparkles className="h-4 w-4" />}
            rightIcon={<ArrowRight className="h-4 w-4" />}
          >
            Try ShieldQuest
          </Button>
          <Button
            size="lg"
            variant="secondary"
            onClick={onEnquiry}
            leftIcon={<School className="h-4 w-4" />}
          >
            Request a session
          </Button>
        </div>

        <p className="mt-8 text-sm font-semibold text-[var(--color-navy-200)]/70">
          Recognise the risk. Make the choice. Protect your people.
        </p>
      </div>
    </section>
  );
}
