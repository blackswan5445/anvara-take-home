// Simple API client
import type { AdSlot, Campaign, DashboardStats, Placement } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4291';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function api<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    // Merge after spreading options so a caller's headers don't drop Content-Type
    headers: { 'Content-Type': 'application/json', ...options.headers },
    credentials: 'include',
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new ApiError(body?.error ?? `Request failed (${res.status})`, res.status);
  }
  return (res.status === 204 ? undefined : await res.json()) as T;
}

// Campaigns
export const getCampaigns = (sponsorId?: string) =>
  api<Campaign[]>(sponsorId ? `/api/campaigns?sponsorId=${sponsorId}` : '/api/campaigns');
export const getCampaign = (id: string) => api<Campaign>(`/api/campaigns/${id}`);
export const createCampaign = (data: Partial<Campaign>) =>
  api<Campaign>('/api/campaigns', { method: 'POST', body: JSON.stringify(data) });

// Ad Slots
export const getAdSlots = (publisherId?: string) =>
  api<AdSlot[]>(publisherId ? `/api/ad-slots?publisherId=${publisherId}` : '/api/ad-slots');
export const getAdSlot = (id: string) => api<AdSlot>(`/api/ad-slots/${id}`);
export const createAdSlot = (data: Partial<AdSlot>) =>
  api<AdSlot>('/api/ad-slots', { method: 'POST', body: JSON.stringify(data) });

// Placements
export const getPlacements = () => api<Placement[]>('/api/placements');
export const createPlacement = (data: Partial<Placement>) =>
  api<Placement>('/api/placements', { method: 'POST', body: JSON.stringify(data) });

// Dashboard
export const getStats = () => api<DashboardStats>('/api/dashboard/stats');
