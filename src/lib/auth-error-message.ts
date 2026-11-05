type AuthErrorLike = { code?: string | null; message?: string | null };

const CODE_MESSAGES: Record<string, string> = {
  invalid_credentials: 'Email or password is wrong. Try again or reset your password.',
  email_not_confirmed: 'Confirm your email first. Check your inbox for the link.',
  user_already_exists: 'That email already has an account. Sign in instead.',
  email_exists: 'That email already has an account. Sign in instead.',
  weak_password: 'Pick a longer password.',
  over_request_rate_limit: 'Too many tries. Wait a minute and try again.',
  over_email_send_rate_limit: 'Too many tries. Wait a minute and try again.',
  mfa_verification_failed: "That code didn't work. Enter the latest code from your app.",
  mfa_challenge_expired: "That code didn't work. Enter the latest code from your app.",
};

// Older Supabase responses carry no `code`, so the message text is the only
// signal. Order matters: the first matching pattern wins.
const MESSAGE_PATTERNS: Array<[RegExp, string]> = [
  [/invalid login credentials/i, CODE_MESSAGES.invalid_credentials],
  [/email not confirmed/i, CODE_MESSAGES.email_not_confirmed],
  [/already registered|already exists/i, CODE_MESSAGES.user_already_exists],
  [/password should be at least|weak password/i, CODE_MESSAGES.weak_password],
  [/rate limit|too many requests|security purposes/i, CODE_MESSAGES.over_request_rate_limit],
  [/invalid.*(totp|mfa|code)|expired.*(totp|mfa|code)/i, CODE_MESSAGES.mfa_verification_failed],
];

/**
 * Plain-language copy for a Supabase auth error. The raw message is never
 * returned: unknown errors get the caller's action-specific fallback.
 */
export function authErrorMessage(
  error: AuthErrorLike | null | undefined,
  fallback: string
): string {
  if (!error) return fallback;
  if (error.code && error.code in CODE_MESSAGES) return CODE_MESSAGES[error.code];
  const text = error.message ?? '';
  for (const [pattern, message] of MESSAGE_PATTERNS) {
    if (pattern.test(text)) return message;
  }
  return fallback;
}
