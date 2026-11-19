import type { AccountMenuProps } from '@merqo/ui';

import { submitFeedbackAction } from '@/app/actions/feedback';
import { submitSupportMessageAction } from '@/app/actions/support';
import { SUPPORT_CATEGORY_LABELS, type SupportMessageInput } from '@/lib/schemas';

const SUPPORT_CATEGORIES = (
  Object.keys(SUPPORT_CATEGORY_LABELS) as SupportMessageInput['category'][]
).map((value) => ({ value, label: SUPPORT_CATEGORY_LABELS[value] }));

/** Narrows the Get-help form's freeform category string to a real support
 *  category; anything else means no category was picked. */
function isSupportCategory(value: string | undefined): value is SupportMessageInput['category'] {
  return !!value && Object.hasOwn(SUPPORT_CATEGORY_LABELS, value);
}

/** Throw-adapters shared by the dashboard and landing account menus:
 *  the server actions return `{success, error}` but `AccountMenu` needs a
 *  rejected promise on failure. */
export const getHelp: AccountMenuProps['getHelp'] = {
  type: 'form',
  onSubmit: async ({ message, category }) => {
    const res = await submitSupportMessageAction({
      category: isSupportCategory(category) ? category : 'other',
      body: message,
    });
    if (!res.success) throw new Error(res.error);
  },
  categories: SUPPORT_CATEGORIES,
};

export const onFeedbackSubmit: AccountMenuProps['onFeedbackSubmit'] = async ({ message, nps }) => {
  const res = await submitFeedbackAction({ nps: nps ?? 0, message });
  if (!res.success) throw new Error(res.error);
};
