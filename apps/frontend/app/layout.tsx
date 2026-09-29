import { GoogleAnalytics } from '@next/third-parties/google';
import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import { GA_ID } from '@/lib/analytics';
import { Nav } from './components/nav';
import { NewsletterForm } from './components/newsletter-form';
import { Toaster } from './components/toaster';
import './globals.css';

const SITE_URL = process.env.BETTER_AUTH_URL || 'http://localhost:3847';
const DESCRIPTION =
  'The sponsorship marketplace connecting brands with newsletters, podcasts, video creators and publishers. Transparent pricing, verified audiences, book in minutes.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'Anvara · Sponsorship Marketplace', template: '%s · Anvara' },
  description: DESCRIPTION,
  applicationName: 'Anvara',
  keywords: [
    'sponsorships',
    'newsletter ads',
    'podcast sponsorship',
    'ad marketplace',
    'creator sponsorships',
  ],
  openGraph: {
    type: 'website',
    siteName: 'Anvara',
    title: 'Anvara · Sponsorship Marketplace',
    description: DESCRIPTION,
    url: '/',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Anvara · Sponsorship Marketplace',
    description: DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0b1120' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <Nav />
        <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:py-10">
          {children}
        </main>
        <footer className="border-t border-border bg-surface">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-2 md:items-center">
            <div>
              <p className="font-semibold">New inventory, every Tuesday</p>
              <p className="mt-1 text-sm text-muted">
                The best new sponsorship slots in your inbox. One email a week, unsubscribe anytime.
              </p>
            </div>
            <NewsletterForm source="footer" />
          </div>
          <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-2 border-t border-border px-4 py-6 text-sm text-muted">
            <p>© {new Date().getFullYear()} Anvara</p>
            <Link href="/marketplace" className="hover:text-foreground">
              Browse the marketplace
            </Link>
          </div>
        </footer>
        <Toaster />
      </body>
      {GA_ID && <GoogleAnalytics gaId={GA_ID} />}
    </html>
  );
}
