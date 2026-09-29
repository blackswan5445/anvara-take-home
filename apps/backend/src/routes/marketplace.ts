import { Router, type IRouter, type Request, type Response } from 'express';
import { z } from 'zod';
import { requireAuth, requireRole, roleIdOf } from '../auth.js';
import { AdSlotType, prisma, type Prisma } from '../db.js';
import { optionalText, parseOr400 } from '../validation.js';

const router: IRouter = Router();

// Public publisher fields only: no email, no userId
const publicPublisher = {
  select: {
    id: true,
    name: true,
    website: true,
    bio: true,
    category: true,
    monthlyViews: true,
    subscriberCount: true,
    isVerified: true,
  },
} satisfies Prisma.PublisherDefaultArgs;

const sortSchema = z.enum(['featured', 'price_asc', 'price_desc', 'newest']);
const sortOrders: Record<z.infer<typeof sortSchema>, Prisma.AdSlotOrderByWithRelationInput[]> = {
  featured: [{ isAvailable: 'desc' }, { publisher: { monthlyViews: 'desc' } }],
  price_asc: [{ basePrice: 'asc' }],
  price_desc: [{ basePrice: 'desc' }],
  newest: [{ createdAt: 'desc' }],
};

const listQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
  type: z.enum(AdSlotType).optional(),
  available: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .optional(),
  sort: sortSchema.default('featured'),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(12),
});

// GET /api/marketplace/ad-slots - Public, filterable, paginated listing
router.get('/ad-slots', async (req: Request, res: Response) => {
  const query = parseOr400(listQuerySchema, req.query, res);
  if (!query) return;

  const where: Prisma.AdSlotWhereInput = {
    type: query.type,
    isAvailable: query.available,
    ...(query.q && {
      OR: [
        { name: { contains: query.q, mode: 'insensitive' } },
        { description: { contains: query.q, mode: 'insensitive' } },
        { publisher: { name: { contains: query.q, mode: 'insensitive' } } },
      ],
    }),
  };

  const [data, total] = await prisma.$transaction([
    prisma.adSlot.findMany({
      where,
      include: { publisher: publicPublisher },
      orderBy: [...sortOrders[query.sort], { id: 'asc' }], // id tiebreak keeps pages stable
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
    prisma.adSlot.count({ where }),
  ]);

  res.json({
    data,
    meta: {
      total,
      page: query.page,
      pageSize: query.pageSize,
      totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
    },
  });
});

// GET /api/marketplace/ad-slots/:id - Public listing detail
router.get('/ad-slots/:id', async (req: Request<{ id: string }>, res: Response) => {
  const adSlot = await prisma.adSlot.findUnique({
    where: { id: req.params.id },
    include: { publisher: publicPublisher },
  });
  if (!adSlot) {
    res.status(404).json({ error: 'Ad slot not found' });
    return;
  }
  res.json(adSlot);
});

const bookingSchema = z.object({ message: optionalText(1000) });

// POST /api/marketplace/ad-slots/:id/book - Sponsor books an available slot
router.post(
  '/ad-slots/:id/book',
  requireAuth,
  requireRole('sponsor'),
  async (req: Request<{ id: string }>, res: Response) => {
    const body = parseOr400(bookingSchema, req.body, res);
    if (!body) return;
    const { id } = req.params;

    // Conditional update is atomic: two sponsors racing for one slot can't both win
    const { count } = await prisma.adSlot.updateMany({
      where: { id, isAvailable: true },
      data: { isAvailable: false },
    });
    if (count === 0) {
      const exists = await prisma.adSlot.count({ where: { id } });
      res
        .status(exists ? 409 : 404)
        .json({ error: exists ? 'This ad slot has already been booked' : 'Ad slot not found' });
      return;
    }

    // ponytail: booking only flips availability; persisting a Placement needs a creative + campaign picker
    console.info(`Ad slot ${id} booked by sponsor ${roleIdOf(req, 'sponsor')}`);
    const adSlot = await prisma.adSlot.findUniqueOrThrow({
      where: { id },
      include: { publisher: publicPublisher },
    });
    res.json({ success: true, message: 'Ad slot booked successfully!', adSlot });
  }
);

export default router;
