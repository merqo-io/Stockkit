import { PageHeader } from '@/components/page-header';
import { getOrCreateVendorProfile } from '@/lib/merqo-vendor-profile';
import { createServerClient } from '@/lib/supabase/server';
import { BackButton } from '@merqo/ui';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ProfileForm } from './profile-form';

export const revalidate = 0;

export default async function ProfilePage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // Defense in depth — proxy.ts already redirects unauthenticated requests
  // to /login before this page renders.
  if (!user) redirect('/login');

  // Local stall-name column stays as a signup-time default only — the shared
  // merqo.vendor_profile row (fetched below) is the source of truth once it
  // exists. This overlays the shared value on top of it rather than a second
  // fetch, per the profile settings standard's §3.3.
  const { data: vendor } = await supabase
    .from('vendors')
    .select('name')
    .eq('id', user.id)
    .maybeSingle();

  const profile = await getOrCreateVendorProfile(supabase, user.id, vendor?.name ?? null);

  // display_name and avatar_url are arbitrary JSON on the auth user — read
  // defensively, per the profile settings standard's §3.1 (kit-local,
  // auth.users.user_metadata, never the shared table).
  const rawDisplayName = user.user_metadata?.display_name;
  const displayName = typeof rawDisplayName === 'string' ? rawDisplayName : '';
  const rawAvatarUrl = user.user_metadata?.avatar_url;
  const avatarUrl = typeof rawAvatarUrl === 'string' ? rawAvatarUrl : null;

  return (
    <div className="mx-auto max-w-2xl space-y-7 md:max-w-4xl">
      <div className="space-y-6">
        <BackButton LinkComponent={Link} href="/dashboard" label="Overview" />
        <header>
          <PageHeader eyebrow="Your account" title="Profile">
            Your business name and social links are shared with every Merqo kit you use.
          </PageHeader>
        </header>
      </div>
      <ProfileForm
        vendorId={user.id}
        stallName={profile.stall_name}
        socialLinks={profile.social_links}
        displayName={displayName}
        email={user.email ?? ''}
        avatarUrl={avatarUrl}
      />
    </div>
  );
}
