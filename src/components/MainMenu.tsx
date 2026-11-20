import { BookOpen, Database, MapPin, Play, Sparkles } from 'lucide-react'
import { Button, ShieldMark } from './ui'

export function MainMenu({ canContinue, storageAvailable, onStart, onContinue }: {
  canContinue: boolean; storageAvailable: boolean; onStart: () => void; onContinue: () => void
}) {
  return <main className="main-menu">
    <header className="menu-masthead">
      <div className="product-mark"><ShieldMark /><span>PROJECT SHIELD<small>NEIGHBOURHOOD ADVENTURES</small></span></div>
      <div className="estate-marker"><MapPin size={16} /> SUNSHINE ESTATE <span>·</span> SINGAPORE</div>
    </header>
    <div className="menu-centre">
      <section className="menu-card" aria-labelledby="game-title">
        <ShieldMark large />
        <div className="menu-eyebrow"><span /> PROJECT SHIELD PRESENTS <span /></div>
        <h1 id="game-title">SHIELD<span>QUEST</span></h1>
        <div className="menu-divider" aria-hidden="true"><span /><Sparkles size={15} /><span /></div>
        <p className="menu-description">A neighbourhood adventure about choices, courage and looking out for one another.</p>
        <div className="menu-actions">
          <Button className="primary" onClick={onStart}><Play size={18} fill="currentColor" /> Start new game</Button>
          <Button className="outline" disabled={!canContinue} onClick={onContinue}><BookOpen size={17} /> Continue</Button>
        </div>
        <p className="save-note"><Database size={14} /> {storageAvailable ? 'Prototype progress is stored in this browser.' : 'Browser storage is unavailable.'}</p>
      </section>
    </div>
    <footer className="menu-footer">PHASE 1 PROTOTYPE</footer>
  </main>
}
