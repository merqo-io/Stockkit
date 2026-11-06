import { VendorsTable } from '@/app/admin/vendors/vendors-table';
import { requireAdmin } from '@/lib/admin';
import { listVendors } from '@/lib/admin-data';
import { PageHeader } from '@merqo/ui';

export const revalidate = 0;

export default async function AdminVendorsPage() {
  await requireAdmin();

  const vendors = await listVendors();

  return (
    <main className="mx-auto max-w-5xl px-5 py-7">
      <PageHeader eyebrow="Internal" title="Vendors">
        Each vendor&apos;s plan comes from Merqo.
      </PageHeader>

      <div className="border-border bg-card overflow-hidden rounded-xl border">
        <VendorsTable rows={vendors} />
      </div>
    </main>
  );
}
