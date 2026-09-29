import { Router, type IRouter, type Request, type Response } from 'express';
import { z } from 'zod';
import { requireAuth, requireOwnership, requireRole, roleIdOf } from '../auth.js';
import { AdSlotType, prisma } from '../db.js';
import { money, optionalText, parseOr400, requiredText } from '../validation.js';

const router: IRouter = Router();

// Publisher-owned inventory management. Public browsing lives in routes/marketplace.ts.
router.use(requireAuth, requireRole('publisher'));

const requireOwnAdSlot = requireOwnership('Ad slot', 'publisher', async (id) => {
  const adSlot = await prisma.adSlot.findUnique({ where: { id }, select: { publisherId: true } });
  return adSlot?.publisherId;
});

const pixels = (label: string) =>
  z.coerce
    .number({ error: `${label} must be a number` })
    .int(`${label} must be a whole number`)
    .positive(`${label} must be greater than 0`)
    .max(10_000, `${label} is too large`)
    .nullish();

// publisherId is deliberately absent: it always comes from the session
const adSlotFields = z.object({
  name: requiredText('Name'),
  description: optionalText(2000),
  type: z.enum(AdSlotType, { error: 'Choose a valid ad slot type' }),
  position: optionalText(100),
  width: pixels('Width'),
  height: pixels('Height'),
  basePrice: money('Base price'),
  cpmFloor: money('CPM floor').nullish(),
  isAvailable: z.boolean().optional(),
});
const updateAdSlotSchema = adSlotFields.partial();

const listQuerySchema = z.object({
  type: z.enum(AdSlotType).optional(),
  available: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .optional(),
});

// GET /api/ad-slots - The caller's ad slots
router.get('/', async (req: Request, res: Response) => {
  const query = parseOr400(listQuerySchema, req.query, res);
  if (!query) return;

  const adSlots = await prisma.adSlot.findMany({
    where: {
      publisherId: roleIdOf(req, 'publisher'),
      type: query.type,
      isAvailable: query.available,
    },
    include: { _count: { select: { placements: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(adSlots);
});

// GET /api/ad-slots/:id - Single ad slot with its placements
router.get('/:id', requireOwnAdSlot, async (req: Request<{ id: string }>, res: Response) => {
  const adSlot = await prisma.adSlot.findUnique({
    where: { id: req.params.id },
    include: {
      placements: { include: { campaign: { select: { id: true, name: true, status: true } } } },
    },
  });
  res.json(adSlot);
});

// POST /api/ad-slots - Create an ad slot for the caller's publisher
router.post('/', async (req: Request, res: Response) => {
  const data = parseOr400(adSlotFields, req.body, res);
  if (!data) return;

  const adSlot = await prisma.adSlot.create({
    data: { ...data, publisherId: roleIdOf(req, 'publisher') },
  });
  res.status(201).json(adSlot);
});

// PUT /api/ad-slots/:id - Update any subset of fields (including availability)
router.put('/:id', requireOwnAdSlot, async (req: Request<{ id: string }>, res: Response) => {
  const data = parseOr400(updateAdSlotSchema, req.body, res);
  if (!data) return;

  const adSlot = await prisma.adSlot.update({ where: { id: req.params.id }, data });
  res.json(adSlot);
});

// DELETE /api/ad-slots/:id
router.delete('/:id', requireOwnAdSlot, async (req: Request<{ id: string }>, res: Response) => {
  await prisma.adSlot.delete({ where: { id: req.params.id } });
  res.status(204).end();
});

export default router;
