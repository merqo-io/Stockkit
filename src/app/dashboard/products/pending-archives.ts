/**
 * Archives that were applied to the UI and are waiting out their Undo toast.
 * The registry is module-level so it survives a form remount: Restore and
 * Save cancel the pending archive, a second archive of the same product is
 * refused, and a page hide flushes every pending commit because a hidden or
 * closing tab may never see the toast settle.
 */
export interface PendingArchive {
  /** Set by Restore, Save or Undo; the commit must then be skipped. */
  cancelled: boolean;
  /** Set once the commit has started, so a later toast settle cannot repeat it. */
  settled: boolean;
  commit: () => Promise<void>;
  dismiss: () => void;
}

const pending = new Map<string, PendingArchive>();

function flushAll() {
  if (document.visibilityState === 'hidden') flushPendingArchives();
}

function onPageHide() {
  flushPendingArchives();
}

function syncListeners() {
  if (typeof document === 'undefined') return;
  document.removeEventListener('visibilitychange', flushAll);
  window.removeEventListener('pagehide', onPageHide);
  if (pending.size === 0) return;
  document.addEventListener('visibilitychange', flushAll);
  window.addEventListener('pagehide', onPageHide);
}

export function hasPendingArchive(productId: string): boolean {
  return pending.has(productId);
}

export function registerPendingArchive(productId: string, entry: PendingArchive) {
  pending.set(productId, entry);
  syncListeners();
}

export function clearPendingArchive(productId: string) {
  pending.delete(productId);
  syncListeners();
}

/** Stops a pending archive for good; its toast is dismissed without committing. */
export function cancelPendingArchive(productId: string) {
  const entry = pending.get(productId);
  if (!entry) return;
  entry.cancelled = true;
  clearPendingArchive(productId);
  entry.dismiss();
}

export function flushPendingArchives() {
  for (const [productId, entry] of [...pending]) {
    clearPendingArchive(productId);
    void entry.commit();
    entry.dismiss();
  }
}
