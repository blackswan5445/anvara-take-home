import { Router, type IRouter, type Request, type Response } from 'express';
import { z } from 'zod';
import { requireAuth, requireOwnership, requireRole, roleIdOf } from '../auth.js';
import { CampaignStatus, prisma } from '../db.js';
import { money, optionalText, parseOr400, requiredText, sendFieldError } from '../validation.js';

const router: IRouter = Router();

// Every campaign route is sponsor-only and scoped to the caller's own sponsor
router.use(requireAuth, requireRole('sponsor'));

const requireOwnCampaign = requireOwnership('Campaign', 'sponsor', async (id) => {
  const campaign = await prisma.campaign.findUnique({ where: { id }, select: { sponsorId: true } });
  return campaign?.sponsorId;
});

// PENDING_REVIEW and APPROVED are platform review states, not something a sponsor sets
const sponsorStatuses = [
  CampaignStatus.DRAFT,
  CampaignStatus.ACTIVE,
  CampaignStatus.PAUSED,
  CampaignStatus.COMPLETED,
  CampaignStatus.CANCELLED,
] as const;

// sponsorId and spent are deliberately absent: zod strips them, so clients can't set them
const campaignFields = z.object({
  name: requiredText('Name'),
  description: optionalText(2000),
  budget: money('Budget'),
  cpmRate: money('CPM rate').nullish(),
  cpcRate: money('CPC rate').nullish(),
  startDate: z.coerce.date({ error: 'Start date is required' }),
  endDate: z.coerce.date({ error: 'End date is required' }),
  targetCategories: z.array(z.string().trim().min(1).max(50)).max(20).optional(),
  targetRegions: z.array(z.string().trim().min(1).max(50)).max(20).optional(),
  status: z.enum(sponsorStatuses).optional(),
});

const endAfterStart = ({ startDate, endDate }: { startDate: Date; endDate: Date }) =>
  endDate >= startDate;
const END_BEFORE_START = 'End date must be on or after the start date';

const createCampaignSchema = campaignFields.refine(endAfterStart, {
  path: ['endDate'],
  message: END_BEFORE_START,
});
const updateCampaignSchema = campaignFields.partial();

const listQuerySchema = z.object({ status: z.enum(CampaignStatus).optional() });

// GET /api/campaigns - The caller's campaigns
router.get('/', async (req: Request, res: Response) => {
  const query = parseOr400(listQuerySchema, req.query, res);
  if (!query) return;

  const campaigns = await prisma.campaign.findMany({
    where: { sponsorId: roleIdOf(req, 'sponsor'), status: query.status },
    include: { _count: { select: { creatives: true, placements: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(campaigns);
});

// GET /api/campaigns/:id - Single campaign with creatives and placements
router.get('/:id', requireOwnCampaign, async (req: Request<{ id: string }>, res: Response) => {
  const campaign = await prisma.campaign.findUnique({
    where: { id: req.params.id },
    include: {
      creatives: true,
      placements: {
        include: {
          adSlot: true,
          publisher: { select: { id: true, name: true, category: true } },
        },
      },
    },
  });
  res.json(campaign);
});

// POST /api/campaigns - Create a campaign for the caller's sponsor
router.post('/', async (req: Request, res: Response) => {
  const data = parseOr400(createCampaignSchema, req.body, res);
  if (!data) return;

  const campaign = await prisma.campaign.create({
    data: { ...data, sponsorId: roleIdOf(req, 'sponsor') },
  });
  res.status(201).json(campaign);
});

// PUT /api/campaigns/:id - Update any subset of fields
router.put('/:id', requireOwnCampaign, async (req: Request<{ id: string }>, res: Response) => {
  const data = parseOr400(updateCampaignSchema, req.body, res);
  if (!data) return;

  // A partial update can move one date past the other stored one, so check the merged pair
  if (data.startDate || data.endDate) {
    const current = await prisma.campaign.findUniqueOrThrow({
      where: { id: req.params.id },
      select: { startDate: true, endDate: true },
    });
    const merged = {
      startDate: data.startDate ?? current.startDate,
      endDate: data.endDate ?? current.endDate,
    };
    if (!endAfterStart(merged)) return sendFieldError(res, 'endDate', END_BEFORE_START);
  }

  const campaign = await prisma.campaign.update({ where: { id: req.params.id }, data });
  res.json(campaign);
});

// DELETE /api/campaigns/:id
router.delete('/:id', requireOwnCampaign, async (req: Request<{ id: string }>, res: Response) => {
  await prisma.campaign.delete({ where: { id: req.params.id } });
  res.status(204).end();
});

export default router;
