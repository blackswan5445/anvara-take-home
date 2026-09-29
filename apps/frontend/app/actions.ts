'use server';

import { api } from '@/lib/api';
import { text, toFormError } from '@/lib/form';
import type { FormState } from '@/lib/types';

export async function subscribeToNewsletter(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    const { message } = await api<{ message: string }>('/api/newsletter/subscribe', {
      method: 'POST',
      body: { email: text(formData, 'email') },
    });
    return { success: true, message };
  } catch (error) {
    return toFormError(error, formData);
  }
}
