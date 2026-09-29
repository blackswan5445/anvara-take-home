'use server';

import { revalidatePath } from 'next/cache';
import { api } from '@/lib/api';
import { number, text, toFormError } from '@/lib/form';
import type { FormState } from '@/lib/types';

// The API owns validation (zod, per-field messages); these actions translate FormData
// into its JSON shape and hand its field errors back to the form.

function adSlotPayload(formData: FormData) {
  return {
    name: text(formData, 'name'),
    description: text(formData, 'description'),
    type: text(formData, 'type'),
    position: text(formData, 'position'),
    width: number(formData, 'width'),
    height: number(formData, 'height'),
    basePrice: number(formData, 'basePrice'),
    isAvailable: formData.get('isAvailable') === 'on',
  };
}

function revalidate() {
  revalidatePath('/dashboard/publisher');
  revalidatePath('/marketplace', 'layout'); // listings and detail pages show this data too
}

export async function createAdSlot(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    await api('/api/ad-slots', { method: 'POST', body: adSlotPayload(formData) });
  } catch (error) {
    return toFormError(error, formData);
  }
  revalidate();
  return { success: true, message: 'Ad slot created' };
}

export async function updateAdSlot(
  id: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    await api(`/api/ad-slots/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: adSlotPayload(formData),
    });
  } catch (error) {
    return toFormError(error, formData);
  }
  revalidate();
  return { success: true, message: 'Ad slot updated' };
}

export async function setAdSlotAvailability(id: string, isAvailable: boolean): Promise<FormState> {
  try {
    await api(`/api/ad-slots/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: { isAvailable },
    });
  } catch (error) {
    return toFormError(error);
  }
  revalidate();
  return { success: true, message: isAvailable ? 'Listed as available' : 'Marked as booked' };
}

export async function deleteAdSlot(id: string): Promise<FormState> {
  try {
    await api(`/api/ad-slots/${encodeURIComponent(id)}`, { method: 'DELETE' });
  } catch (error) {
    return toFormError(error);
  }
  revalidate();
  return { success: true, message: 'Ad slot deleted' };
}
