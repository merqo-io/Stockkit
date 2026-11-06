// merqo and loopkit write the auth cookies on the shared domain; a host-only
// copy from this app mixes with their chunks and getUser() returns null.
// Unset on localhost keeps host-only cookies. The env reference stays literal
// so Next inlines it into the browser bundle.
export function authCookieOptions(): { domain: string } | undefined {
  const domain = process.env.NEXT_PUBLIC_AUTH_COOKIE_DOMAIN;
  return domain ? { domain } : undefined;
}
