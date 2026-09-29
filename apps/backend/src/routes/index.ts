import { Router, type IRouter } from 'express';
import adSlotsRoutes from './adSlots.js';
import authRoutes from './auth.js';
import campaignsRoutes from './campaigns.js';
import dashboardRoutes from './dashboard.js';
import healthRoutes from './health.js';
import marketplaceRoutes from './marketplace.js';
import newsletterRoutes from './newsletter.js';
import placementsRoutes from './placements.js';
import publishersRoutes from './publishers.js';
import quotesRoutes from './quotes.js';
import sponsorsRoutes from './sponsors.js';

const router: IRouter = Router();

router.use('/auth', authRoutes);
router.use('/sponsors', sponsorsRoutes);
router.use('/publishers', publishersRoutes);
router.use('/campaigns', campaignsRoutes);
router.use('/ad-slots', adSlotsRoutes);
router.use('/marketplace', marketplaceRoutes);
router.use('/placements', placementsRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/newsletter', newsletterRoutes);
router.use('/quotes', quotesRoutes);
router.use('/health', healthRoutes);

export default router;
