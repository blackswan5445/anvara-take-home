import { Router, type IRouter, type Request, type Response } from 'express';
import { prisma, type Prisma } from '../db.js';

const router: IRouter = Router();

// Publisher profiles are public marketplace info, minus contact email and auth linkage
const publicFields = {
  id: true,
  name: true,
  website: true,
  avatar: true,
  bio: true,
  category: true,
  monthlyViews: true,
  subscriberCount: true,
  isVerified: true,
} satisfies Prisma.PublisherSelect;

// GET /api/publishers - List active publishers
router.get('/', async (_req: Request, res: Response) => {
  const publishers = await prisma.publisher.findMany({
    where: { isActive: true },
    select: { ...publicFields, _count: { select: { adSlots: true } } },
    orderBy: { monthlyViews: 'desc' },
  });
  res.json(publishers);
});

// GET /api/publishers/:id - Single publisher with their ad slots
router.get('/:id', async (req: Request<{ id: string }>, res: Response) => {
  const publisher = await prisma.publisher.findUnique({
    where: { id: req.params.id, isActive: true },
    select: { ...publicFields, adSlots: { orderBy: { basePrice: 'desc' } } },
  });

  if (!publisher) {
    res.status(404).json({ error: 'Publisher not found' });
    return;
  }
  res.json(publisher);
});

export default router;
