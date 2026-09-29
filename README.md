<div align="left" style="margin-bottom: 2rem;">
  <img src="https://anvara-production.nyc3.cdn.digitaloceanspaces.com/anvarabluetext.png" alt="Anvara" width="500" />
</div>

# Anvara Take-Home Test

```
## ⚠️ Important: Do NOT Fork This Repository

This is a take-home assessment. Please:

1. **Clone** (not fork) this repository
2. Work on it locally
3. Create your own **new public repository**
4. Push your work there
5. Send us the link to YOUR repository

Do not open pull requests to the original repo.
```

## Table of Contents

- [Anvara Take-Home Test](#anvara-take-home-test)
  - [Table of Contents](#table-of-contents)
  - [tl;dr](#tldr)
  - [Submission notes](#submission-notes)
  - [About This Assessment](#about-this-assessment)
  - [Tech Stack](#tech-stack)
  - [Assumptions](#assumptions)
  - [Project Structure](#project-structure)
  - [Quick Start](#quick-start)
    - [Clone Repository](#clone-repository)
    - [Automated Setup (Recommended)](#automated-setup-recommended)
    - [Manual Setup](#manual-setup)
  - [Development](#development)
  - [Database](#database)
  - [Authentication](#authentication)
  - [Documentation](#documentation)
    - [Individual Challenges](#individual-challenges)
    - [Bonus Challenges](#bonus-challenges)
  - [Resources](#resources)
  - [Need Help?](#need-help)

## tl;dr

- **�  New here? [Setup the Project](#quick-start)**
- **🎯 Ready to code? [Start the Challenges](#individual-challenges)**
- **❓ Need help? [Check the Docs](docs/README.md)**
- **📤 Done? [Submit Your Work](docs/submission.md)**

## Submission notes

All 5 core challenges are done, plus every bonus challenge. `pnpm typecheck`, `pnpm lint` (0 errors, 0 warnings) and `pnpm test` (37 tests) pass. Commits are split by challenge.

| Challenge            | Where to look                                                                                        |
| -------------------- | ---------------------------------------------------------------------------------------------------- |
| 1. TypeScript        | `ba9ff8d`. Also repaired the lint toolchain, which couldn't run at all (`b5e0995`)                   |
| 2. Server Components | `apps/frontend/app/dashboard/*/page.tsx`, `lib/api.ts`, `lib/session.ts`, `loading.tsx`, `error.tsx` |
| 3. API security      | `apps/backend/src/auth.ts` (`requireAuth`, `requireRole`, `requireOwnership`)                        |
| 4. CRUD              | `apps/backend/src/routes/{campaigns,adSlots}.ts`, `src/validation.ts`, `src/api.test.ts`             |
| 5. Server Actions    | `apps/frontend/app/dashboard/*/actions.ts` and `components/*-form.tsx`                               |
| Bonuses              | [docs/BONUS.md](docs/BONUS.md): conversion analysis, measurement, analytics and A/B notes            |

**How it fits together.** The browser only talks to Next.js. Server Components and Server Actions call the Express API with the user's Better Auth cookie. The API verifies that cookie itself (same database and secret) and scopes every query to the caller's sponsor or publisher. Its zod schemas are the single source of validation; their per-field errors flow back through the actions into the forms.

**Problems I found beyond the brief** (the "maybe there's more than five?" hint):

- `pnpm lint` crashed before linting anything: typescript-eslint rejects TypeScript 7, and eslint-plugin-react's version detection calls an API that ESLint 10 removed.
- Every themed Tailwind class used v3 syntax (`bg-[--color-primary]`), which v4 compiles to invalid CSS, so no brand colors rendered and primary buttons were white on white.
- `GET /api/auth/role/:userId` exposed any user's role and ids without auth. Booking trusted `sponsorId` from the request body. `/unbook` let anyone free anyone's slot. Better Auth ran with CSRF checks disabled and a hardcoded fallback secret.
- `api()` spread `options` after `headers`, silently dropping `Content-Type` whenever a caller passed headers.
- `z.coerce` turned blank dates into 1970-01-01 (accepted as valid). React 19 wiped form input after every failed submit.
- `setup-project` broke on paths containing spaces, generated a 128-bit auth secret that Better Auth flags as weak, and `init.sql` seeded a `sponsorships` table in a database the app never reads (the stubbed tests targeted that nonexistent API).
- Public endpoints returned publisher and sponsor emails and `userId`s.

**Deliberate trade-offs**

- **403 vs 404**: the checklists ask for 403 on other users' resources, so the API returns 404 (missing) then 403 (not yours). Returning 404 for both would hide which ids exist; with cuid ids the leak is negligible.
- **Rate limiting**: every API call arrives from the Next.js server, so Next forwards the client IP in `X-Forwarded-For` and Express trusts that header only from loopback. The limits are 300 req/min per client API-wide and 10 per 10 min on the public forms (newsletter, quotes). Sign-in is rate-limited by Better Auth (on by default in production).
- **Booking** only flips availability, as the original did. Persisting a `Placement` needs a creative and campaign picker, which is out of scope.
- **Newsletter and quote endpoints** validate but don't persist, per the brief.

**Env change**: the frontend reads `API_URL` (server-only) instead of `NEXT_PUBLIC_API_URL`; the default `http://localhost:4291` means older `.env` files still work. Optional `NEXT_PUBLIC_GA_ID` turns on GA4.

## About This Assessment

This take-home test is designed to evaluate your skills across multiple areas of full-stack development. **Complete as many challenges as you can** - you don't need to finish everything!

**Take your time.** Work at your own pace, and submit when you feel you've shown us your best work. Where you stop tells us about your current skill level, and that's perfectly okay. We'd rather see quality work on fewer challenges than rushed attempts at all of them.
A sponsorship marketplace connecting sponsors with publishers, built with modern best practices.

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS v4
- **Backend**: Express.js, Prisma ORM, PostgreSQL
- **Auth**: Better Auth
- **Monorepo**: PNPM workspaces
- **Testing**: Vitest
- **Linting**: ESLint 9

## Assumptions

- Node.js v20+
- PNPM v8+
- Docker installed and running

If not confident, see the [Setup Guide](docs/setup.md)

## Project Structure

```
apps/
├── frontend/                 # Next.js app (port 3847)
│   ├── app/
│   │   ├── components/       # Shared UI (nav, dialog, fields, toaster, ...)
│   │   ├── api/auth/         # Better Auth routes
│   │   ├── dashboard/        # Role-based dashboards (Server Components + Server Actions)
│   │   │   ├── sponsor/
│   │   │   └── publisher/
│   │   └── marketplace/      # Public marketplace, listing detail, booking, quotes
│   ├── lib/
│   │   ├── api.ts            # Server-only API client (forwards the session cookie)
│   │   ├── session.ts        # getCurrentUser / requireRole
│   │   ├── analytics.ts      # Typed GA4 event tracking
│   │   ├── experiments.ts    # A/B test definitions
│   │   ├── types.ts          # API response types
│   │   └── utils.ts          # Formatting helpers
│   └── proxy.ts              # Auth redirect + A/B assignment (Next 16's middleware)
│
├── backend/                  # Express API (port 4291)
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── src/
│       ├── app.ts            # Express app, CORS, error handler
│       ├── index.ts          # Server startup
│       ├── auth.ts           # Session verification, role + ownership middleware
│       ├── validation.ts     # zod helpers, per-field error responses
│       ├── routes/           # One router per resource
│       ├── api.test.ts       # Integration tests (vitest + supertest)
│       └── db.ts             # Prisma client
│
└── packages/
    ├── config/               # Shared TypeScript config
    ├── eslint-config/        # Shared ESLint rules
    └── prettier-config/      # Shared Prettier config

scripts/
├── setup.ts                  # Automated setup script
└── tsconfig.json             # Scripts TypeScript config
```

## Quick Start

### Clone Repository

```bash
git clone https://github.com/anvara-project/take-home.git
cd take-home
```

### Automated Setup (Recommended)

```bash
pnpm setup-project
```

This runs the **complete setup** including dependency installation, Docker initialization, database setup, and seeding.

---

### Manual Setup

See the [Setup Guide](docs/setup.md) for detailed manual setup instructions.

## Development

```bash
# Start all services
pnpm dev

# Run tests
pnpm test

# Lint code
pnpm lint

# Format code with Prettier
pnpm format

# Open Prisma Studio
pnpm --filter @anvara/backend db:studio
```

## Database

PostgreSQL runs in Docker on port 5498:

```bash
# Start database
docker-compose up -d

# Stop database
docker-compose down

# View Prisma Studio
pnpm --filter @anvara/backend db:studio
```

## Authentication

Better Auth is configured for role-based access:

- **Sponsors**: View campaigns, create placements
- **Publishers**: View ad slots, manage availability

**Demo accounts:**

- `sponsor@example.com` / `password`
- `publisher@example.com` / `password`

See the [setup guide](docs/setup.md) for configuration details.

## Documentation

| Document                                         | Description                     |
| ------------------------------------------------ | ------------------------------- |
| [Setup Guide](docs/setup.md)                     | Installation and configuration  |
| [Challenges Overview](docs/challenges/README.md) | All challenges and requirements |
| [Submission Guide](docs/submission.md)           | How to submit your work         |

### Individual Challenges

- [Challenge 1: Fix TypeScript Errors](docs/challenges/01-typescript.md)
- [Challenge 2: Server-Side Data Fetching](docs/challenges/02-server-components.md)
- [Challenge 3: Secure API Endpoints](docs/challenges/03-api-security.md)
- [Challenge 4: Complete CRUD Operations](docs/challenges/04-crud-operations.md)
- [Challenge 5: Dashboards with Server Actions](docs/challenges/05-server-actions.md)

### Bonus Challenges

Explore [all bonus challenges](docs/bonus-challenges/README.md) organized by category:

**🛒 Product & Business**

- [Improve Marketplace Conversions](docs/bonus-challenges/business/01-marketplace-conversions.md)
- [Newsletter Signup Form](docs/bonus-challenges/business/02-newsletter-signup.md)
- [Request a Quote Feature](docs/bonus-challenges/business/03-request-quote.md)

**🎨 Design & UX**

- [Marketing Landing Page](docs/bonus-challenges/design/01-landing-page.md)
- [Dashboard Redesign](docs/bonus-challenges/design/02-dashboard.md)
- [Campaign Builder Flow](docs/bonus-challenges/design/03-campaign-builder.md)
- [Mobile-First Experience](docs/bonus-challenges/design/04-mobile-responsive.md)
- [Dark Mode Support](docs/bonus-challenges/design/05-dark-mode.md)
- [Component Library](docs/bonus-challenges/design/06-component-library.md)
- [Data Table Pagination](docs/bonus-challenges/design/07-pagination.md)

**📊 Analytics & Testing**

- [Google Analytics Setup](docs/bonus-challenges/analytics/01-google-analytics.md)
- [Conversion Tracking](docs/bonus-challenges/analytics/02-conversion-tracking.md)
- [A/B Testing Framework](docs/bonus-challenges/analytics/03-ab-testing.md)

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Express.js Guide](https://expressjs.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Better Auth Documentation](https://www.better-auth.com/docs)

## Need Help?

- **Setup issues?** Check the [Setup Guide](docs/setup.md)
- **Challenge questions?** Review the [individual challenge pages](docs/challenges/README.md)
- **Submission questions?** See the [Submission Guide](docs/submission.md)
