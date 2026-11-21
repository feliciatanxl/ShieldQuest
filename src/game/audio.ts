/**
 * Lightweight Web Audio API Synthesizer for ShieldQuest
 * Zero external audio assets, works offline, immediate responsive feedback.
 */

class SoundSystem {
  private ctx: AudioContext | null = null
  private muted = false

  constructor() {
    try {
      const stored = localStorage.getItem('shieldquest.muted')
      if (stored === 'true') this.muted = true
    } catch {
      // ignore
    }
  }

  private getContext(): AudioContext | null {
    if (this.muted) return null
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (AudioCtx) {
        this.ctx = new AudioCtx()
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
    return this.ctx
  }

  setMuted(muted: boolean) {
    this.muted = muted
    try {
      localStorage.setItem('shieldquest.muted', String(muted))
    } catch {
      // ignore
    }
  }

  isMuted() {
    return this.muted
  }

  /** Soft UI click blip */
  playBlip() {
    const ctx = this.getContext()
    if (!ctx) return
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(440, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.04)
    gain.gain.setValueAtTime(0.08, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.04)
    osc.connect(gain).connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.05)
  }

  /** Time freeze whoosh with crystalline ice shimmer */
  playFreeze() {
    const ctx = this.getContext()
    if (!ctx) return
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(600, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.28)

    gain.gain.setValueAtTime(0.14, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.28)
    osc.connect(gain).connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.3)

    // Shimmer chord
    for (const freq of [1046.5, 1318.5, 1567.98]) {
      const sh = ctx.createOscillator()
      const shGain = ctx.createGain()
      sh.type = 'sine'
      sh.frequency.setValueAtTime(freq, ctx.currentTime + 0.05)
      shGain.gain.setValueAtTime(0.04, ctx.currentTime + 0.05)
      shGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35)
      sh.connect(shGain).connect(ctx.destination)
      sh.start(ctx.currentTime + 0.05)
      sh.stop(ctx.currentTime + 0.35)
    }
  }

  /** Time unfreeze resume chime */
  playUnfreeze() {
    const ctx = this.getContext()
    if (!ctx) return
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(220, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(587.33, ctx.currentTime + 0.18)

    gain.gain.setValueAtTime(0.12, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2)
    osc.connect(gain).connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.22)
  }

  /** Discovery bell chime (A5 -> E6) */
  playClueDiscovered() {
    const ctx = this.getContext()
    if (!ctx) return
    const now = ctx.currentTime
    const notes = [880, 1318.51]
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, now + idx * 0.08)
      gain.gain.setValueAtTime(0.12, now + idx * 0.08)
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.25)
      osc.connect(gain).connect(ctx.destination)
      osc.start(now + idx * 0.08)
      osc.stop(now + idx * 0.08 + 0.26)
    })
  }

  /** Pinboard string pluck / connection sound */
  playStringConnected() {
    const ctx = this.getContext()
    if (!ctx) return
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(329.63, now) // E4
    osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.03) // E5 pluck

    gain.gain.setValueAtTime(0.15, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22)
    osc.connect(gain).connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.23)
  }

  /** Escalation / alarm buzzer */
  playAlarm() {
    const ctx = this.getContext()
    if (!ctx) return
    const now = ctx.currentTime
    for (let i = 0; i < 2; i++) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(280, now + i * 0.14)
      gain.gain.setValueAtTime(0.12, now + i * 0.14)
      gain.gain.linearRampToValueAtTime(0, now + i * 0.14 + 0.1)
      osc.connect(gain).connect(ctx.destination)
      osc.start(now + i * 0.14)
      osc.stop(now + i * 0.14 + 0.11)
    }
  }

  /** Victorious case resolved fanfare */
  playSuccessFanfare() {
    const ctx = this.getContext()
    if (!ctx) return
    const now = ctx.currentTime
    const arpeggio = [523.25, 659.25, 783.99, 1046.50] // C5, E5, G5, C6
    arpeggio.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, now + i * 0.09)
      const duration = i === arpeggio.length - 1 ? 0.45 : 0.18
      gain.gain.setValueAtTime(0.15, now + i * 0.09)
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.09 + duration)
      osc.connect(gain).connect(ctx.destination)
      osc.start(now + i * 0.09)
      osc.stop(now + i * 0.09 + duration + 0.02)
    })
  }
}

export const sound = new SoundSystem()
