'use server';

import { revalidatePath } from 'next/cache';
import { api } from '@/lib/api';
import { number, text, toFormError } from '@/lib/form';
import type { FormState } from '@/lib/types';

export async function bookAdSlot(
  adSlotId: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    await api(`/api/marketplace/ad-slots/${encodeURIComponent(adSlotId)}/book`, {
      method: 'POST',
      body: { message: text(formData, 'message') },
    });
  } catch (error) {
    return toFormError(error, formData);
  }
  revalidatePath('/marketplace', 'layout');
  return { success: true, message: 'Placement booked!' };
}

export async function requestQuote(
  adSlotId: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    const { quoteId } = await api<{ quoteId: string }>('/api/quotes/request', {
      method: 'POST',
      body: {
        adSlotId,
        companyName: text(formData, 'companyName'),
        email: text(formData, 'email'),
        phone: text(formData, 'phone'),
        budget: number(formData, 'budget'),
        timeline: text(formData, 'timeline'),
        message: text(formData, 'message'),
      },
    });
    return { success: true, message: `Your reference is ${quoteId.slice(0, 8).toUpperCase()}.` };
  } catch (error) {
    return toFormError(error, formData);
  }
}
