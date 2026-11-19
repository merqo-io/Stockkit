'use server';
import { redirect } from 'next/navigation';

import { createServerClient } from '@/lib/supabase/server';

/**
 * Ends the session server-side so the auth cookies are cleared on the
 * response, then sends the vendor to /login. The destination is hardcoded:
 * this runs from a public menu and must never follow a caller-supplied path.
 * Throws on failure because `AccountMenu` shows a rejected promise's message
 * inline; the message is fixed because Next masks server error text anyway.
 */
export async function signOutAction(): Promise<void> {
  const supabase = await createServerClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error('Could not sign out. Please try again.');
  redirect('/login');
}
