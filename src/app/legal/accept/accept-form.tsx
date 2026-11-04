'use client';

import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { TermsAcceptanceCheckbox } from '@merqo/ui';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { acceptLegalTerms } from './actions';

export function AcceptForm({ next }: { next: string }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  // This page is the legal gate's redirect target, so without an exit a
  // vendor who declines the terms is stuck here.
  async function signOut() {
    setSigningOut(true);
    const { error } = await createClient().auth.signOut();
    if (error) {
      toast.error('Could not sign out. Try again.');
      setSigningOut(false);
      return;
    }
    router.replace('/login');
    router.refresh();
  }

  return (
    <form action={acceptLegalTerms} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <TermsAcceptanceCheckbox checked={checked} onCheckedChange={setChecked} />
      <Button
        type="submit"
        className="w-full"
        disabled={!checked}
        aria-describedby={checked ? undefined : 'accept-hint'}
      >
        Continue
      </Button>
      {!checked && (
        <p id="accept-hint" className="text-muted-foreground text-sm">
          Tick the box to continue.
        </p>
      )}
      <Button
        type="button"
        variant="ghost"
        className="w-full"
        onClick={signOut}
        disabled={signingOut}
      >
        Sign out
      </Button>
    </form>
  );
}
