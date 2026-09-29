'use client';

import Link from 'next/link';
import { useEffect, useRef, type ComponentProps } from 'react';
import { track, type AnalyticsEvent, type AnalyticsParams } from '@/lib/analytics';

/** Fires an analytics event once when a Server Component's output mounts (views, exposures). */
export function TrackEvent({ event, params }: { event: AnalyticsEvent; params?: AnalyticsParams }) {
  const key = `${event}:${JSON.stringify(params)}`;
  // Guards against StrictMode's dev-only double effect run; still re-fires when params change
  const lastFired = useRef<string>(null);
  useEffect(() => {
    if (lastFired.current === key) return;
    lastFired.current = key;
    track(event, params);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- key captures event + params
  }, [key]);
  return null;
}

interface TrackedLinkProps extends ComponentProps<typeof Link> {
  event: AnalyticsEvent;
  params?: AnalyticsParams;
}

/** A Link that records a click event before client-side navigation. */
export function TrackedLink({ event, params, onClick, ...props }: TrackedLinkProps) {
  return (
    <Link
      {...props}
      onClick={(e) => {
        track(event, params);
        onClick?.(e);
      }}
    />
  );
}
