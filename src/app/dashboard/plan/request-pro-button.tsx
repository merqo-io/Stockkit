'use client';

import { submitSupportMessageAction } from '@/app/actions/support';
import { Button } from '@/components/ui/button';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';

// Merqo owns billing and stockkit has no checkout, so an upgrade is a support
// message that a person acts on by hand.
export function RequestProButton() {
  const [pending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);

  function request() {
    startTransition(async () => {
      const res = await submitSupportMessageAction({
        category: 'account',
        body: 'Please upgrade my stockkit account to Pro.',
      });
      if (res.success) {
        setSent(true);
        toast.success("Request sent. We'll email you when Pro is on.");
      } else {
        toast.error('Could not send your request. Try again.');
      }
    });
  }

  let label = 'Request Pro';
  if (sent) label = 'Request sent';
  else if (pending) label = 'Sending…';

  return (
    <div className="space-y-2">
      <Button type="button" onClick={request} disabled={pending || sent}>
        {label}
      </Button>
      <p className="text-muted-foreground text-sm">
        We&apos;ll upgrade your account by hand and email you.
      </p>
    </div>
  );
}
