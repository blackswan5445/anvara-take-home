import 'server-only';
import { cookies } from 'next/headers';
import {
  EXPERIMENTS,
  experimentCookie,
  isVariant,
  type Assignments,
  type ExperimentId,
  type Variant,
} from './experiments';

/** The visitor's variant (assigned by proxy.ts). Falls back to the first/control variant. */
export async function getVariant<Id extends ExperimentId>(id: Id): Promise<Variant<Id>> {
  const value = (await cookies()).get(experimentCookie(id))?.value;
  return isVariant(id, value) ? value : EXPERIMENTS[id].variants[0];
}

/** All of the visitor's assignments, handed to <ExperimentsProvider> for Client Components. */
export async function getAssignments(): Promise<Assignments> {
  const jar = await cookies();
  const ids = Object.keys(EXPERIMENTS) as ExperimentId[];
  return Object.fromEntries(ids.map((id) => [id, jar.get(experimentCookie(id))?.value]));
}
