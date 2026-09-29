import { Router, type IRouter, type Request, type Response } from 'express';
import { prisma } from '../db.js';

const router: IRouter = Router();

// GET /api/dashboard/stats - Public, aggregate-only platform stats
router.get('/stats', async (_req: Request, res: Response) => {
  const [sponsors, publishers, activeCampaigns, totalPlacements, adSlots, placementMetrics] =
    await Promise.all([
      prisma.sponsor.count({ where: { isActive: true } }),
      prisma.publisher.count({ where: { isActive: true } }),
      prisma.campaign.count({ where: { status: 'ACTIVE' } }),
      prisma.placement.count(),
      prisma.adSlot.count({ where: { isAvailable: true } }),
      prisma.placement.aggregate({ _sum: { impressions: true, clicks: true, conversions: true } }),
    ]);

  const impressions = placementMetrics._sum.impressions ?? 0;
  const clicks = placementMetrics._sum.clicks ?? 0;

  res.json({
    sponsors,
    publishers,
    activeCampaigns,
    totalPlacements,
    availableAdSlots: adSlots,
    metrics: {
      totalImpressions: impressions,
      totalClicks: clicks,
      totalConversions: placementMetrics._sum.conversions ?? 0,
      // Always a number (was a string or 0 depending on data)
      avgCtr: impressions ? Math.round((clicks / impressions) * 10_000) / 100 : 0,
    },
  });
});

export default router;
