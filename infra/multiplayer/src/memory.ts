import type { Entity, Mutation, Store } from './model'

// Local process storage only. It models the production adapter's all-or-nothing writes.
export class MemoryStore implements Store {
  private records = new Map<string, Entity>()
  private counters = new Map<string, number>()
  private window = 0

  async get(pk: string) {
    const item = this.records.get(pk)
    return item && structuredClone(item)
  }

  async commit(mutations: Mutation[]) {
    if (mutations.some(({ pk, before }) => this.records.get(pk)?.rev !== before?.rev)) return false
    for (const { pk, after } of mutations) {
      if (after) this.records.set(pk, structuredClone(after))
    }
    return true
  }

  async allow(key: string, now: number, limit: number) {
    const window = Math.floor(now / 60_000)
    if (window !== this.window) {
      this.window = window
      this.counters.clear()
    }
    const count = this.counters.get(key) ?? 0
    if (count >= limit) return false
    this.counters.set(key, count + 1)
    return true
  }
}
