import type { AdSlotType } from '@/lib/types';
import { humanize } from '@/lib/utils';

const typeStyles: Record<AdSlotType, string> = {
  DISPLAY: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
  VIDEO: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
  NATIVE: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300',
  NEWSLETTER: 'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300',
  PODCAST: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
};

export function AdSlotTypeBadge({ type }: { type: AdSlotType }) {
  return (
    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${typeStyles[type]}`}>
      {humanize(type)}
    </span>
  );
}
