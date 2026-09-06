import { Sparkles } from 'lucide-react';

export function ConsequenceCard({ message }: { message: string }) {
  return (
    <div className="reflection-card">
      <Sparkles size={24} />
      <div>
        <span className="eyebrow">LATER IN THE STORY</span>
        <h3>Small choices ripple outward.</h3>
        <p>{message}</p>
      </div>
    </div>
  );
}
