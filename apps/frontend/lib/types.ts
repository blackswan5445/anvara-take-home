// API response types, matching the Prisma schema as serialized to JSON.
// Prisma Decimal fields arrive as strings (e.g. "1500.00"); dates as ISO strings.

export type UserRole = 'sponsor' | 'publisher';

export type CampaignStatus =
  'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';

export type AdSlotType = 'DISPLAY' | 'VIDEO' | 'NATIVE' | 'NEWSLETTER' | 'PODCAST';

export type PlacementStatus =
  'PENDING' | 'APPROVED' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'REJECTED';

export interface Campaign {
  id: string;
  name: string;
  description: string | null;
  budget: string;
  spent: string;
  cpmRate: string | null;
  cpcRate: string | null;
  status: CampaignStatus;
  startDate: string;
  endDate: string;
  targetCategories: string[];
  targetRegions: string[];
  sponsorId: string;
  sponsor?: { id: string; name: string };
}

export interface AdSlot {
  id: string;
  name: string;
  description: string | null;
  type: AdSlotType;
  position: string | null;
  width: number | null;
  height: number | null;
  basePrice: string;
  cpmFloor: string | null;
  isAvailable: boolean;
  publisherId: string;
  publisher?: {
    id: string;
    name: string;
    website?: string | null;
    category?: string | null;
    monthlyViews?: number;
  };
}

export interface Placement {
  id: string;
  impressions: number;
  clicks: number;
  status: PlacementStatus;
  campaignId: string;
  adSlotId: string;
}

export interface DashboardStats {
  sponsors: number;
  publishers: number;
  activeCampaigns: number;
  totalPlacements: number;
  metrics: {
    totalImpressions: number;
    totalClicks: number;
    totalConversions: number;
    avgCtr: string | number;
  };
}
