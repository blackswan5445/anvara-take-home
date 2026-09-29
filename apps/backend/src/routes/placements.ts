import { Router, type IRouter, type Request, type Response } from 'express';
import { z } from 'zod';
import { requireAuth, requireRole, roleIdOf } from '../auth.js';
import { PlacementStatus, PricingModel, prisma, type Prisma } from '../db.js';
import { money, parseOr400, requiredDate } from '../validation.js';

const router: IRouter = Router();

router.use(requireAuth);

const listQuerySchema = z.object({
  campaignId: z.string().optional(),
  status: z.enum(PlacementStatus).optional(),
});

// GET /api/placements - Sponsors see placements on their campaigns; publishers, on their slots
router.get('/', async (req: Request, res: Response) => {
  const query = parseOr400(listQuerySchema, req.query, res);
  if (!query) return;

  const { sponsorId, publisherId } = req.user!;
  const scope: Prisma.PlacementWhereInput | null = sponsorId
    ? { campaign: { sponsorId } }
    : publisherId
      ? { publisherId }
      : null;
  if (!scope) {
    res.json([]);
    return;
  }

  const placements = await prisma.placement.findMany({
    where: { ...scope, campaignId: query.campaignId, status: query.status },
    include: {
      campaign: { select: { id: true, name: true } },
      creative: { select: { id: true, name: true, type: true } },
      adSlot: { select: { id: true, name: true, type: true } },
      publisher: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(placements);
});

const createPlacementSchema = z
  .object({
    campaignId: z.string().min(1, 'Campaign is required'),
    creativeId: z.string().min(1, 'Creative is required'),
    adSlotId: z.string().min(1, 'Ad slot is required'),
    agreedPrice: money('Agreed price'),
    pricingModel: z.enum(PricingModel).default(PricingModel.CPM),
    startDate: requiredDate('Start date'),
    endDate: requiredDate('End date'),
  })
  .refine(({ startDate, endDate }) => endDate >= startDate, {
    path: ['endDate'],
    message: 'End date must be on or after the start date',
  });

// POST /api/placements - Sponsor places one of their creatives on an ad slot
router.post('/', requireRole('sponsor'), async (req: Request, res: Response) => {
  const data = parseOr400(createPlacementSchema, req.body, res);
  if (!data) return;

  const [creative, adSlot] = await Promise.all([
    prisma.creative.findUnique({
      where: { id: data.creativeId },
      select: { campaignId: true, campaign: { select: { sponsorId: true } } },
    }),
    prisma.adSlot.findUnique({ where: { id: data.adSlotId }, select: { publisherId: true } }),
  ]);

  if (!creative || !adSlot) {
    res.status(404).json({ error: creative ? 'Ad slot not found' : 'Creative not found' });
    return;
  }
  if (
    creative.campaignId !== data.campaignId ||
    creative.campaign.sponsorId !== roleIdOf(req, 'sponsor')
  ) {
    res.status(403).json({ error: 'That creative does not belong to one of your campaigns' });
    return;
  }

  // publisherId is derived from the slot, never trusted from the client
  const placement = await prisma.placement.create({
    data: { ...data, publisherId: adSlot.publisherId },
    include: {
      campaign: { select: { name: true } },
      publisher: { select: { name: true } },
    },
  });
  res.status(201).json(placement);
});

export default router;
