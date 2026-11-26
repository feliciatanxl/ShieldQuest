import { Check, Lock, Sparkles } from 'lucide-react'
import { guardians, type GuardianId } from '../state/guardians'
import type { Save } from '../state/saveGame'
import { Button } from './ui'

export function GuardianCollection({ save, onCollect }: { save: Save; onCollect: (id: GuardianId) => void }) {
  return <>
    <div className="guardian-intro">
      <strong role="status">{save.collectedGuardians.length} of {guardians.length} collected</strong>
      <p>Submit a SHIELD challenge, then collect its Guardian here.</p>
    </div>
    <ul className="guardian-grid">
      {guardians.map(({ id, name, competency, challenge }) => {
        const collected = save.collectedGuardians.includes(id)
        const unlocked = !!save.shield[competency]
        return <li key={id} className={`guardian-card ${unlocked ? '' : 'guardian-locked'}`}>
          <img src={`${import.meta.env.BASE_URL}assets/guardians/${id}.svg`} width={76} height={76} alt="" />
          <h3>{name}</h3>
          <p>{competency} · {challenge}</p>
          {unlocked
            ? <Button className={collected ? 'guardian-collected' : 'primary'} aria-disabled={collected || undefined}
                aria-label={collected ? `${name} collected` : `Collect ${name}`}
                onClick={() => { if (!collected) onCollect(id) }}>
                {collected ? <><Check size={16} aria-hidden="true" /> Collected</> : <><Sparkles size={16} aria-hidden="true" /> Collect</>}
              </Button>
            : <span className="guardian-status"><Lock size={15} aria-hidden="true" /> Locked</span>}
        </li>
      })}
    </ul>
  </>
}
