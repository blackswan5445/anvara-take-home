'use server';

import { revalidatePath } from 'next/cache';
import { api } from '@/lib/api';
import { number, text, toFormError } from '@/lib/form';
import type { FormState } from '@/lib/types';

// The API owns validation (zod, per-field messages); these actions translate FormData
// into its JSON shape and hand its field errors back to the form.

function campaignPayload(formData: FormData) {
  return {
    name: text(formData, 'name'),
    description: text(formData, 'description'),
    budget: number(formData, 'budget'),
    startDate: text(formData, 'startDate'),
    endDate: text(formData, 'endDate'),
    status: text(formData, 'status') ?? undefined,
  };
}

export async function createCampaign(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    await api('/api/campaigns', { method: 'POST', body: campaignPayload(formData) });
  } catch (error) {
    return toFormError(error, formData);
  }
  revalidatePath('/dashboard/sponsor');
  return { success: true, message: 'Campaign created' };
}

export async function updateCampaign(
  id: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    await api(`/api/campaigns/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: campaignPayload(formData),
    });
  } catch (error) {
    return toFormError(error, formData);
  }
  revalidatePath('/dashboard/sponsor');
  return { success: true, message: 'Campaign updated' };
}

export async function deleteCampaign(id: string): Promise<FormState> {
  try {
    await api(`/api/campaigns/${encodeURIComponent(id)}`, { method: 'DELETE' });
  } catch (error) {
    return toFormError(error);
  }
  revalidatePath('/dashboard/sponsor');
  return { success: true, message: 'Campaign deleted' };
}
