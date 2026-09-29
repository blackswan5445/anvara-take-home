import { Router, type IRouter, type Request, type Response } from 'express';
import { z } from 'zod';
import { requireAuth, requireOwnership, requireRole } from '../auth.js';
import { prisma } from '../db.js';
import { optionalText, parseOr400, requiredText } from '../validation.js';

const router: IRouter = Router();

// Sponsor records hold contact and billing details, so nothing here is public
router.use(requireAuth);

const requireOwnSponsor = requireOwnership('Sponsor', 'sponsor', async (id) => {
  const sponsor = await prisma.sponsor.findUnique({ where: { id }, select: { id: true } });
  return sponsor?.id;
});

const profileFields = z.object({
  name: requiredText('Company name'),
  website: z.url('Enter a valid URL').nullish(),
  logo: z.url('Enter a valid URL').nullish(),
  description: optionalText(2000),
  industry: optionalText(100),
});
const updateProfileSchema = profileFields.partial();

// GET /api/sponsors/:id - Own sponsor profile with campaigns and recent payments
router.get(
  '/:id',
  requireRole('sponsor'),
  requireOwnSponsor,
  async (req: Request<{ id: string }>, res: Response) => {
    const sponsor = await prisma.sponsor.findUnique({
      where: { id: req.params.id },
      include: {
        campaigns: { include: { _count: { select: { placements: true } } } },
        payments: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    });
    res.json(sponsor);
  }
);

// POST /api/sponsors - Onboard the signed-in user as a sponsor
router.post('/', async (req: Request, res: Response) => {
  const data = parseOr400(profileFields, req.body, res);
  if (!data) return;

  const { id: userId, email, role } = req.user!;
  if (role) {
    res.status(409).json({ error: `This account is already registered as a ${role}` });
    return;
  }

  const sponsor = await prisma.sponsor.create({ data: { ...data, userId, email } });
  res.status(201).json(sponsor);
});

// PUT /api/sponsors/:id - Update own sponsor profile
router.put(
  '/:id',
  requireRole('sponsor'),
  requireOwnSponsor,
  async (req: Request<{ id: string }>, res: Response) => {
    const data = parseOr400(updateProfileSchema, req.body, res);
    if (!data) return;

    const sponsor = await prisma.sponsor.update({ where: { id: req.params.id }, data });
    res.json(sponsor);
  }
);

export default router;
