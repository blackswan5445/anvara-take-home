// Minimal A/B testing: server-side assignment in proxy.ts, persisted in a cookie,
// read by Server Components (no flicker, SEO-safe), exposure + outcome sent to analytics.

interface Experiment<V extends string> {
  variants: readonly V[];
  /** Percent per variant, same order; must sum to 100. */
  weights: readonly number[];
}

export const EXPERIMENTS = {
  // Does outcome-framed CTA copy lift bookings over the literal action?
  'booking-cta': { variants: ['control', 'outcome'], weights: [50, 50] },
  // Does naming the benefit get more quote requests than the generic label? (client-side via useABTest)
  'quote-cta': { variants: ['control', 'pricing'], weights: [50, 50] },
} as const satisfies Record<string, Experiment<string>>;

export type ExperimentId = keyof typeof EXPERIMENTS;
export type Variant<Id extends ExperimentId> = (typeof EXPERIMENTS)[Id]['variants'][number];

/** Raw cookie values per experiment; validate with isVariant before use. */
export type Assignments = Partial<Record<ExperimentId, string>>;

export const experimentCookie = (id: ExperimentId) => `ab_${id}`;

/** Weighted random pick. `roll` is injectable for tests. */
export function pickVariant<Id extends ExperimentId>(
  id: Id,
  roll = Math.random() * 100
): Variant<Id> {
  const { variants, weights } = EXPERIMENTS[id];
  let cumulative = 0;
  for (let i = 0; i < variants.length; i++) {
    cumulative += weights[i];
    if (roll < cumulative) return variants[i];
  }
  return variants[variants.length - 1];
}

export function isVariant<Id extends ExperimentId>(id: Id, value: unknown): value is Variant<Id> {
  return (EXPERIMENTS[id].variants as readonly unknown[]).includes(value);
}
