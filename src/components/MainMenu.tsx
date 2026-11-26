import { BookOpen, MapPin, Play, ShieldCheck } from 'lucide-react'
import { Button, ShieldMark } from './ui'

export function MainMenu({ canContinue, storageAvailable, onStart, onContinue }: {
  canContinue: boolean; storageAvailable: boolean; onStart: () => void; onContinue: () => void
}) {
  return <main className="main-menu">
    <header className="menu-masthead">
      <div className="product-mark"><ShieldMark /><span>TEAM SECUREPI<small>PROJECT SHIELD</small></span></div>
      <div className="estate-marker"><MapPin size={16} /> SUNSHINE ESTATE</div>
    </header>
    <div className="menu-centre">
      <section className="menu-card estate-ticket" aria-labelledby="game-title">
        <div className="estate-ticket-location">A Singapore heartland adventure</div>
        <h1 id="game-title">SHIELD<span>QUEST</span></h1>
        <p className="menu-description">Explore Sunshine Estate, talk to the neighbours, and decide how to respond when a friend asks you to watch the minimart door.</p>
        <div className="estate-ticket-mission"><ShieldCheck size={21} aria-hidden="true" /><span><strong>The Lookout Dilemma</strong><small>Shop-theft prevention · Single player</small></span></div>
        <div className="menu-actions">
          <Button className="primary" onClick={onStart}><Play size={18} fill="currentColor" /> Start new game</Button>
          {canContinue && <Button className="outline" onClick={onContinue}><BookOpen size={17} /> Continue</Button>}
        </div>
        {!storageAvailable && <p className="save-note">Browser storage is unavailable.</p>}
      </section>
    </div>
    <footer className="menu-footer">PLAYABLE PROTOTYPE</footer>
  </main>
}
