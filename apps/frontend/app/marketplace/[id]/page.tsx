import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { AdSlotTypeBadge } from '@/app/components/ad-slot-type-badge';
import { TrackEvent } from '@/app/components/track-event';
import { VerifiedBadge } from '@/app/components/verified-badge';
import { api, ApiError } from '@/lib/api';
import { getVariant } from '@/lib/experiments.server';
import { effectiveCpm } from '@/lib/pricing';
import { getCurrentUser } from '@/lib/session';
import type { AdSlot } from '@/lib/types';
import { formatCompact, formatPrice, formatPriceWithCents, humanize } from '@/lib/utils';
import { BookingPanel } from './components/booking-panel';

interface AdSlotPageProps {
  params: Promise<{ id: string }>;
}

// Shared by generateMetadata and the page, so the API is called once per request
const getAdSlot = cache(async (id: string): Promise<AdSlot> => {
  try {
    return await api<AdSlot>(`/api/marketplace/ad-slots/${encodeURIComponent(id)}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
});

export async function generateMetadata({ params }: AdSlotPageProps): Promise<Metadata> {
  const adSlot = await getAdSlot((await params).id);
  const title = `${adSlot.name} · ${adSlot.publisher?.name ?? 'Sponsorship'}`;
  const description =
    adSlot.description ??
    `${humanize(adSlot.type)} sponsorship, ${formatPrice(adSlot.basePrice)}/mo.`;
  return { title, description, openGraph: { title, description }, twitter: { title, description } };
}

const CTA_COPY = { control: 'Book this placement', outcome: 'Reserve your spot' } as const;

export default async function AdSlotPage({ params }: AdSlotPageProps) {
  const { id } = await params;
  const [adSlot, user, ctaVariant] = await Promise.all([
    getAdSlot(id),
    getCurrentUser().catch(() => null),
    getVariant('booking-cta'),
  ]);
  const { publisher } = adSlot;
  const cpm = effectiveCpm(adSlot);
  const showsBookingCta = adSlot.isAvailable && user?.role === 'sponsor';

  const facts = [
    publisher?.monthlyViews
      ? { label: 'Monthly reach', value: formatCompact(publisher.monthlyViews) }
      : null,
    publisher?.subscriberCount
      ? { label: 'Subscribers', value: formatCompact(publisher.subscriberCount) }
      : null,
    cpm !== null ? { label: 'Effective CPM', value: formatPriceWithCents(cpm) } : null,
    adSlot.width && adSlot.height
      ? { label: 'Size', value: `${adSlot.width}×${adSlot.height}` }
      : null,
    adSlot.position
      ? { label: 'Placement', value: humanize(adSlot.position.replaceAll('-', '_')) }
      : null,
  ].filter((fact) => fact !== null);

  return (
    <div className="space-y-6">
      <Link
        href="/marketplace"
        className="inline-flex min-h-11 items-center text-sm font-medium text-primary hover:underline"
      >
        ← Back to marketplace
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <article className="space-y-8">
          <header className="space-y-3">
            <AdSlotTypeBadge type={adSlot.type} />
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{adSlot.name}</h1>
            {publisher && (
              <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-muted">
                <span>
                  by <span className="font-medium text-foreground">{publisher.name}</span>
                </span>
                {publisher.isVerified && <VerifiedBadge />}
                {publisher.category && <span>· {publisher.category}</span>}
              </p>
            )}
          </header>

          {adSlot.description && <p className="text-lg leading-relaxed">{adSlot.description}</p>}

          {facts.length > 0 && (
            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {facts.map((fact) => (
                <div key={fact.label} className="card p-4">
                  <dt className="text-xs text-muted">{fact.label}</dt>
                  <dd className="mt-1 text-xl font-semibold tabular-nums">{fact.value}</dd>
                </div>
              ))}
            </dl>
          )}

          {publisher && (
            <section className="card space-y-2 p-5">
              <h2 className="font-semibold">About {publisher.name}</h2>
              {publisher.bio && <p className="text-sm text-muted">{publisher.bio}</p>}
              {publisher.website && (
                <a
                  href={publisher.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center text-sm font-medium text-primary hover:underline"
                >
                  {publisher.website.replace(/^https?:\/\//, '')} ↗
                </a>
              )}
            </section>
          )}

          <section className="space-y-3">
            <h2 className="font-semibold">How booking works</h2>
            <ol className="grid gap-3 sm:grid-cols-3">
              {[
                ['Reserve', 'Book instantly, or request a quote for custom terms.'],
                ['Confirm', 'The publisher confirms dates and creative specs with you.'],
                ['Go live', 'Send your creative. Nothing is charged at booking.'],
              ].map(([title, body], i) => (
                <li key={title} className="rounded-xl bg-surface p-4">
                  <span className="text-sm font-semibold text-primary">
                    {i + 1}. {title}
                  </span>
                  <p className="mt-1 text-sm text-muted">{body}</p>
                </li>
              ))}
            </ol>
          </section>
        </article>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <BookingPanel
            adSlot={adSlot}
            viewer={user && { role: user.role, name: user.name, email: user.email }}
            ctaLabel={CTA_COPY[ctaVariant]}
            ctaVariant={ctaVariant}
          />
        </aside>
      </div>

      <TrackEvent
        event="view_item"
        params={{
          item_id: adSlot.id,
          item_name: adSlot.name,
          item_category: adSlot.type,
          value: Number(adSlot.basePrice),
        }}
      />
      {showsBookingCta && (
        <TrackEvent
          event="experiment_exposure"
          params={{ experiment: 'booking-cta', variant: ctaVariant }}
        />
      )}
    </div>
  );
}
