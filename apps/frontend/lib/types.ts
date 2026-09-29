// API response types, matching the Prisma schema as serialized to JSON.
// Prisma Decimal fields arrive as strings (e.g. "1500.00"); dates as ISO strings.

export type UserRole = 'sponsor' | 'publisher';

export interface CurrentUser {
  id: string;
  email: string;
  name: string;
  role: UserRole | null;
  sponsorId: string | null;
  publisherId: string | null;
}

export type FieldErrors = Record<string, string>;

/** What every server action returns to useActionState. */
export interface FormState {
  success?: boolean;
  message?: string;
  error?: string;
  fieldErrors?: FieldErrors;
  /** Submitted values, echoed back on error: React resets the form after an action runs. */
  values?: Record<string, string>;
}

export interface Paginated<T> {
  data: T[];
  meta: { total: number; page: number; pageSize: number; totalPages: number };
}

export type CampaignStatus =
  'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';

export const AD_SLOT_TYPES = ['DISPLAY', 'VIDEO', 'NATIVE', 'NEWSLETTER', 'PODCAST'] as const;
export type AdSlotType = (typeof AD_SLOT_TYPES)[number];

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
  publisher?: PublicPublisher;
}

export interface PublicPublisher {
  id: string;
  name: string;
  website: string | null;
  bio: string | null;
  category: string | null;
  monthlyViews: number;
  subscriberCount: number;
  isVerified: boolean;
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
  availableAdSlots: number;
  metrics: {
    totalImpressions: number;
    totalClicks: number;
    totalConversions: number;
    avgCtr: number;
  };
}
