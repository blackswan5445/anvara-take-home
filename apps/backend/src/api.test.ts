// Integration tests: run against the seeded dev database (pnpm setup-project).
// Each test that writes data cleans up after itself.
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import app from './app.js';
import { auth } from './auth.js';
import { prisma } from './db.js';

async function sessionCookie(email: string): Promise<string> {
  const { headers } = await auth.api.signInEmail({
    body: { email, password: 'password' },
    returnHeaders: true,
  });
  const setCookie = headers.get('set-cookie');
  if (!setCookie) throw new Error(`No session cookie for ${email}`);
  return setCookie.split(';')[0];
}

let sponsor: string;
let publisher: string;
let otherSponsorsCampaignId: string;
let otherPublishersAdSlotId: string;

beforeAll(async () => {
  [sponsor, publisher] = await Promise.all([
    sessionCookie('sponsor@example.com'),
    sessionCookie('publisher@example.com'),
  ]);
  const otherCampaign = await prisma.campaign.findFirstOrThrow({
    where: { sponsor: { userId: null } },
  });
  const otherSlot = await prisma.adSlot.findFirstOrThrow({
    where: { publisher: { userId: null } },
  });
  otherSponsorsCampaignId = otherCampaign.id;
  otherPublishersAdSlotId = otherSlot.id;
});

afterAll(() => prisma.$disconnect());

const validCampaign = {
  name: 'Test Campaign',
  budget: 5000,
  startDate: '2026-10-01',
  endDate: '2026-12-31',
};

const validAdSlot = { name: 'Test Slot', type: 'DISPLAY', basePrice: 250 };

describe('GET /api/health', () => {
  it('returns health status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('authentication', () => {
  it.each(['/api/campaigns', '/api/ad-slots', '/api/placements', '/api/auth/me'])(
    'GET %s returns 401 without a session',
    async (path) => {
      expect((await request(app).get(path)).status).toBe(401);
    }
  );

  it('returns 401 for a forged session cookie', async () => {
    const res = await request(app)
      .get('/api/campaigns')
      .set('Cookie', 'better-auth.session_token=forged.token');
    expect(res.status).toBe(401);
  });

  it('GET /api/auth/me returns the role and owner id', async () => {
    const res = await request(app).get('/api/auth/me').set('Cookie', sponsor);
    expect(res.body).toMatchObject({ role: 'sponsor', email: 'sponsor@example.com' });
    expect(res.body.sponsorId).toEqual(expect.any(String));
  });

  it('returns 403 when a publisher calls sponsor routes', async () => {
    expect((await request(app).get('/api/campaigns').set('Cookie', publisher)).status).toBe(403);
  });
});

describe('campaigns', () => {
  it('lists only the caller’s campaigns', async () => {
    const me = await request(app).get('/api/auth/me').set('Cookie', sponsor);
    const res = await request(app).get('/api/campaigns').set('Cookie', sponsor);
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    for (const campaign of res.body) expect(campaign.sponsorId).toBe(me.body.sponsorId);
  });

  it('returns 403 for another sponsor’s campaign on GET, PUT and DELETE', async () => {
    const path = `/api/campaigns/${otherSponsorsCampaignId}`;
    expect((await request(app).get(path).set('Cookie', sponsor)).status).toBe(403);
    expect((await request(app).put(path).set('Cookie', sponsor).send({ name: 'x' })).status).toBe(
      403
    );
    expect((await request(app).delete(path).set('Cookie', sponsor)).status).toBe(403);
  });

  it('returns 404 for a campaign that does not exist', async () => {
    const res = await request(app).get('/api/campaigns/does-not-exist').set('Cookie', sponsor);
    expect(res.status).toBe(404);
  });

  it('returns 400 with field errors for invalid input', async () => {
    const res = await request(app)
      .post('/api/campaigns')
      .set('Cookie', sponsor)
      .send({ ...validCampaign, name: '', budget: -5, endDate: '2026-01-01' });
    expect(res.status).toBe(400);
    expect(Object.keys(res.body.fieldErrors)).toEqual(
      expect.arrayContaining(['name', 'budget', 'endDate'])
    );
  });

  it('treats blank values as missing, not as 0 or 1970-01-01', async () => {
    const res = await request(app)
      .post('/api/campaigns')
      .set('Cookie', sponsor)
      .send({ name: 'Blank fields', budget: null, startDate: '', endDate: null });
    expect(res.status).toBe(400);
    expect(res.body.fieldErrors).toMatchObject({
      budget: 'Budget is required',
      startDate: 'Start date is required',
      endDate: 'End date is required',
    });
  });

  it('creates, updates and deletes a campaign, ignoring a spoofed sponsorId', async () => {
    const created = await request(app)
      .post('/api/campaigns')
      .set('Cookie', sponsor)
      .send({ ...validCampaign, sponsorId: 'someone-else', spent: 999 });
    expect(created.status).toBe(201);
    expect(created.body.sponsorId).not.toBe('someone-else');
    expect(Number(created.body.spent)).toBe(0);

    const path = `/api/campaigns/${created.body.id}`;
    const updated = await request(app)
      .put(path)
      .set('Cookie', sponsor)
      .send({ name: 'Renamed', budget: 7500 });
    expect(updated.status).toBe(200);
    expect(updated.body).toMatchObject({ name: 'Renamed', budget: '7500' });

    const badDates = await request(app)
      .put(path)
      .set('Cookie', sponsor)
      .send({ endDate: '2026-09-01' }); // before the stored startDate
    expect(badDates.status).toBe(400);
    expect(badDates.body.fieldErrors.endDate).toBeDefined();

    expect((await request(app).delete(path).set('Cookie', sponsor)).status).toBe(204);
    expect((await request(app).get(path).set('Cookie', sponsor)).status).toBe(404);
  });
});

describe('ad slots', () => {
  it('returns 403 for another publisher’s ad slot', async () => {
    const res = await request(app)
      .put(`/api/ad-slots/${otherPublishersAdSlotId}`)
      .set('Cookie', publisher)
      .send({ basePrice: 1 });
    expect(res.status).toBe(403);
  });

  it('rejects unknown types and non-positive prices', async () => {
    const res = await request(app)
      .post('/api/ad-slots')
      .set('Cookie', publisher)
      .send({ ...validAdSlot, type: 'BILLBOARD', basePrice: 0 });
    expect(res.status).toBe(400);
    expect(Object.keys(res.body.fieldErrors)).toEqual(
      expect.arrayContaining(['type', 'basePrice'])
    );
  });

  it('creates, updates and deletes an ad slot', async () => {
    const created = await request(app)
      .post('/api/ad-slots')
      .set('Cookie', publisher)
      .send({
        ...validAdSlot,
        width: 300,
        height: 250,
      });
    expect(created.status).toBe(201);

    const path = `/api/ad-slots/${created.body.id}`;
    const updated = await request(app)
      .put(path)
      .set('Cookie', publisher)
      .send({ isAvailable: false });
    expect(updated.body.isAvailable).toBe(false);

    expect((await request(app).delete(path).set('Cookie', publisher)).status).toBe(204);
  });
});

describe('marketplace', () => {
  it('is public and paginated', async () => {
    const res = await request(app).get('/api/marketplace/ad-slots?pageSize=5&page=2');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(5);
    expect(res.body.meta).toMatchObject({ page: 2, pageSize: 5 });
  });

  it('never exposes publisher emails', async () => {
    const res = await request(app).get('/api/marketplace/ad-slots');
    for (const slot of res.body.data) expect(slot.publisher.email).toBeUndefined();
  });

  it('books a slot once and rejects a second booking with 409', async () => {
    const slot = await prisma.adSlot.create({
      data: { ...validAdSlot, type: 'DISPLAY', publisherId: await publisherId() },
    });
    const path = `/api/marketplace/ad-slots/${slot.id}/book`;
    try {
      expect((await request(app).post(path).send({})).status).toBe(401);
      expect((await request(app).post(path).set('Cookie', publisher).send({})).status).toBe(403);
      expect((await request(app).post(path).set('Cookie', sponsor).send({})).status).toBe(200);
      expect((await request(app).post(path).set('Cookie', sponsor).send({})).status).toBe(409);
    } finally {
      await prisma.adSlot.delete({ where: { id: slot.id } });
    }
  });
});

describe('newsletter and quotes', () => {
  it('validates newsletter emails', async () => {
    const bad = await request(app).post('/api/newsletter/subscribe').send({ email: 'nope' });
    expect(bad.status).toBe(400);
    const good = await request(app).post('/api/newsletter/subscribe').send({ email: 'a@b.co' });
    expect(good.body.success).toBe(true);
  });

  it('returns a quote id for a valid request', async () => {
    const res = await request(app).post('/api/quotes/request').send({
      adSlotId: otherPublishersAdSlotId,
      companyName: 'Acme',
      email: 'buyer@acme.com',
      message: 'Interested in Q4',
    });
    expect(res.status).toBe(201);
    expect(res.body.quoteId).toEqual(expect.any(String));
  });
});

describe('error handling', () => {
  it('returns 400 for malformed JSON instead of 500', async () => {
    const res = await request(app)
      .post('/api/newsletter/subscribe')
      .set('Content-Type', 'application/json')
      .send('{"email":');
    expect(res.status).toBe(400);
  });

  it('returns JSON 404 for unknown routes', async () => {
    const res = await request(app).get('/api/nope');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Not found');
  });
});

async function publisherId(): Promise<string> {
  const publisherRecord = await prisma.publisher.findFirstOrThrow({
    where: { email: 'publisher@example.com' },
  });
  return publisherRecord.id;
}
