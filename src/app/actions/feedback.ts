'use server';
import type { ActionResult } from '@/lib/action-result';
import { submitVendorFeedback } from '@/lib/merqo-vendor-feedback';
import { checkLimits, LIMITS, RATE_LIMIT_MESSAGE, userAndIpSpecs } from '@/lib/rate-limit';
import { feedbackSchema, type FeedbackInput } from '@/lib/schemas';
import { createServerClient } from '@/lib/supabase/server';

/**
 * Submit vendor NPS feedback for stockkit into the shared cross-kit
 * merqo.vendor_feedback table via merqo.submit_vendor_feedback — the
 * SECURITY DEFINER function is the authorization boundary (it writes
 * auth.uid() as vendor_id itself, never a passed-in value).
 */
export async function submitFeedbackAction(input: FeedbackInput): Promise<ActionResult> {
  const parsed = feedbackSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Invalid feedback',
    };
  }

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Please sign in first' };

  // Fails closed: the write lands in a shared cross-kit inbox, so a degraded
  // limiter must not open it to spam.
  const outcome = await checkLimits(
    userAndIpSpecs('feedback', user.id, null, { user: LIMITS.feedbackUser })
  );
  if (outcome !== 'allowed') return { success: false, error: RATE_LIMIT_MESSAGE };

  try {
    await submitVendorFeedback(supabase, 'stockkit', parsed.data.nps, parsed.data.message ?? null);
  } catch (err) {
    console.error('submitFeedbackAction failed', err instanceof Error ? err.message : err);
    return { success: false, error: 'Could not send feedback' };
  }
  return { success: true };
}
