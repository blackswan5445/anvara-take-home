'use client';

import { createContext, use, type ReactNode } from 'react';
import {
  EXPERIMENTS,
  isVariant,
  type Assignments,
  type ExperimentId,
  type Variant,
} from '@/lib/experiments';

// Assignments are read from cookies on the server and passed down, so Client Components render
// the right variant in the server HTML too: no flicker, no hydration mismatch.
const ExperimentsContext = createContext<Assignments>({});

export function ExperimentsProvider({
  assignments,
  children,
}: {
  assignments: Assignments;
  children: ReactNode;
}) {
  return <ExperimentsContext value={assignments}>{children}</ExperimentsContext>;
}

/** The visitor's variant for a Client Component. Falls back to the first/control variant. */
export function useABTest<Id extends ExperimentId>(id: Id): Variant<Id> {
  const value = use(ExperimentsContext)[id];
  return isVariant(id, value) ? value : EXPERIMENTS[id].variants[0];
}
