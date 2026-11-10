const DEFAULT_MERQO_BASE_URL = 'https://www.merqo.io';

// Read per call, not at import, so tests and per-environment env changes apply.
export function merqoBaseUrl(): string {
  return process.env.MERQO_BASE_URL ?? DEFAULT_MERQO_BASE_URL;
}
