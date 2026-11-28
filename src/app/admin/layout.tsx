import { LogOut } from 'lucide-react';
import { redirect } from 'next/navigation';

import { AdminFrame } from '@/app/admin/admin-frame';
import { requireAdmin } from '@/lib/admin';
import { createServerClient } from '@/lib/supabase/server';
import { Button } from '@merqo/ui/primitives';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Gate every /admin route: non-admins get a 404 from requireAdmin.
  await requireAdmin();

  async function signOut() {
    'use server';
    const supabase = await createServerClient();
    await supabase.auth.signOut();
    redirect('/login');
  }

  return (
    <AdminFrame
      actions={
        <form action={signOut}>
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            className="text-muted-foreground rounded-lg"
          >
            <LogOut className="size-4" />
            <span className="hidden sm:inline">Sign out</span>
          </Button>
        </form>
      }
    >
      {children}
    </AdminFrame>
  );
}
