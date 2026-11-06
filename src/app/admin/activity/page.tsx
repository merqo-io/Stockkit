import type { AuditLogEntry } from '@merqo/ui';

import { AdminActivityLog } from '@/app/admin/activity/activity-log';
import { PageHeader } from '@/components/page-header';
import { requireAdmin } from '@/lib/admin';
import { auditLog } from '@/lib/admin-data';

export const revalidate = 0;

export default async function AdminActivityPage() {
  await requireAdmin();

  const rows = await auditLog(100);
  const entries: AuditLogEntry[] = rows.map((row) => ({
    id: row.id,
    actor: row.actor,
    action: row.action,
    target: row.target,
    detail: row.detail,
    createdAt: row.created_at,
  }));

  return (
    <main className="mx-auto max-w-5xl px-5 py-7">
      <div className="mb-7">
        <PageHeader eyebrow="Internal" title="Activity">
          The most recent admin- and vendor-initiated actions worth reconstructing later.
        </PageHeader>
      </div>

      <AdminActivityLog entries={entries} />
    </main>
  );
}
