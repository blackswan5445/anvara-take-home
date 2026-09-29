import Link from 'next/link';
import { api } from '@/lib/api';
import type { AdSlot, DashboardStats, Paginated } from '@/lib/types';
import { formatCompact } from '@/lib/utils';
import { ListingCard } from './marketplace/components/listing-card';

// The landing page must render even if the API is down; live data is a bonus, not a dependency
async function loadHomepageData() {
  const [stats, featured] = await Promise.allSettled([
    api<DashboardStats>('/api/dashboard/stats'),
    api<Paginated<AdSlot>>('/api/marketplace/ad-slots?available=true&pageSize=3'),
  ]);
  return {
    stats: stats.status === 'fulfilled' ? stats.value : null,
    featured: featured.status === 'fulfilled' ? featured.value.data : [],
  };
}

const SPONSOR_BENEFITS = [
  [
    'Real audience numbers',
    'Monthly reach, subscribers and effective CPM on every listing, before you talk to anyone.',
  ],
  ['Book in minutes', 'No media kits by email. Pick a slot, add a note, reserve it.'],
  ['Custom deals welcome', 'Need bundles or different dates? Request a quote from the listing.'],
];

const PUBLISHER_BENEFITS = [
  [
    'List once, sell continuously',
    'Your inventory is in front of active sponsors the moment you publish it.',
  ],
  ['Set your own price', 'Flat monthly pricing you control, updated whenever you like.'],
  ['Control availability', 'Mark slots booked or open with one click from your dashboard.'],
];

const STEPS = [
  ['Browse', 'Filter newsletters, podcasts, video and display slots by format, price and reach.'],
  ['Book or ask', 'Reserve an available slot instantly, or request a quote for custom terms.'],
  ['Launch', 'Confirm details with the publisher and go live. Nothing is charged at booking.'],
];

export default async function Home() {
  const { stats, featured } = await loadHomepageData();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Anvara',
    description: 'Sponsorship marketplace connecting sponsors with publishers.',
    url: process.env.BETTER_AUTH_URL || 'http://localhost:3847',
  };

  return (
    <div className="space-y-24 pb-8">
      <script
        type="application/ld+json"
        // Escape '<' so a value can never close the script tag (Next.js JSON-LD guidance)
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />

      {/* Hero */}
      <section className="grid items-center gap-12 pt-4 lg:grid-cols-2 lg:pt-10">
        <div className="animate-fade-in space-y-6">
          <p className="inline-flex rounded-full bg-primary-soft px-3 py-1 text-sm font-medium text-primary">
            The sponsorship marketplace
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            Sponsor the audiences your customers already trust.
          </h1>
          <p className="max-w-xl text-lg text-pretty text-muted">
            Anvara connects brands with newsletters, podcasts, video creators and publishers. Real
            audience numbers and transparent prices, so you can book a sponsorship in minutes
            instead of weeks of back-and-forth.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/marketplace" className="btn-primary px-6 text-base">
              Browse sponsorships
            </Link>
            <Link href="/login" className="btn-secondary px-6 text-base">
              List your inventory
            </Link>
          </div>
        </div>

        {stats && (
          <dl className="grid grid-cols-2 gap-4">
            {[
              ['Publishers', stats.publishers],
              ['Open ad slots', stats.availableAdSlots],
              ['Sponsors', stats.sponsors],
              ['Active campaigns', stats.activeCampaigns],
            ].map(([label, value]) => (
              // dt must precede dd; flex-col-reverse keeps the number visually on top
              <div key={label} className="card animate-fade-in flex flex-col-reverse p-6">
                <dt className="mt-1 text-sm text-muted">{label}</dt>
                <dd className="text-4xl font-bold tracking-tight text-primary tabular-nums">
                  {formatCompact(Number(value))}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </section>

      {/* Featured listings: real inventory is the most persuasive thing we can show */}
      {featured.length > 0 && (
        <section className="space-y-6" aria-labelledby="featured-heading">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 id="featured-heading" className="text-2xl font-bold tracking-tight sm:text-3xl">
                Available now
              </h2>
              <p className="mt-1 text-muted">A few of the slots sponsors are booking this week.</p>
            </div>
            <Link href="/marketplace" className="font-medium text-primary hover:underline">
              See all listings →
            </Link>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((adSlot, index) => (
              <li key={adSlot.id}>
                <ListingCard adSlot={adSlot} position={index + 1} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Benefits per side of the marketplace */}
      <section className="grid gap-6 md:grid-cols-2" aria-label="Benefits">
        {[
          { title: 'For sponsors', accent: 'text-primary', items: SPONSOR_BENEFITS },
          { title: 'For publishers', accent: 'text-secondary', items: PUBLISHER_BENEFITS },
        ].map(({ title, accent, items }) => (
          <div key={title} className="card p-8">
            <h2 className={`text-xl font-bold ${accent}`}>{title}</h2>
            <ul className="mt-6 space-y-5">
              {items.map(([heading, body]) => (
                <li key={heading} className="flex gap-3">
                  <span aria-hidden className={`mt-0.5 font-bold ${accent}`}>
                    ✓
                  </span>
                  <div>
                    <h3 className="font-semibold">{heading}</h3>
                    <p className="text-sm text-muted">{body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      {/* How it works */}
      <section className="space-y-8" aria-labelledby="how-heading">
        <h2 id="how-heading" className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
          How it works
        </h2>
        <ol className="grid gap-6 md:grid-cols-3">
          {STEPS.map(([title, body], index) => (
            <li key={title} className="text-center">
              <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-white dark:text-slate-950">
                {index + 1}
              </span>
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-muted">{body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Final CTA */}
      <section className="rounded-2xl bg-primary px-6 py-14 text-center text-white sm:px-12 dark:bg-primary-soft">
        <h2 className="text-3xl font-bold tracking-tight text-balance">
          Your next customers are already reading, listening and watching.
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-white/80">
          {stats
            ? `${stats.availableAdSlots} ad slots from ${stats.publishers} publishers are open right now.`
            : 'Find the right audience and book your first sponsorship today.'}
        </p>
        <Link
          href="/marketplace"
          className="btn mt-8 bg-white px-6 text-base text-primary hover:bg-white/90 dark:bg-primary dark:text-slate-950"
        >
          Find your audience
        </Link>
      </section>
    </div>
  );
}
