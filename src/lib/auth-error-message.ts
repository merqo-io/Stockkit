type AuthErrorLike = {
  code?: string | null;
  message?: string | null;
  reasons?: string[] | null;
};

type WeakPasswordInput = { reasons?: string[] | null; message?: string | null };

export const PASSWORD_REQUIREMENTS_HINT =
  'Use at least 8 characters, with a lowercase letter, an uppercase letter, a number and a symbol.';

const CODE_MESSAGES: Record<string, string> = {
  invalid_credentials: 'Email or password is wrong. Try again or reset your password.',
  email_not_confirmed: 'Confirm your email first. Check your inbox for the link.',
  user_already_exists: 'That email already has an account. Sign in instead.',
  email_exists: 'That email already has an account. Sign in instead.',
  over_request_rate_limit: 'Too many tries. Wait a minute and try again.',
  over_email_send_rate_limit: 'Too many tries. Wait a minute and try again.',
  mfa_verification_failed: "That code didn't work. Enter the latest code from your app.",
  mfa_challenge_expired: "That code didn't work. Enter the latest code from your app.",
};

const WEAK_PASSWORD_PATTERN =
  /password should be at least|password should contain|known to be weak|weak password/i;

// Older Supabase responses carry no `code`, so the message text is the only
// signal. Order matters: the first matching pattern wins.
const MESSAGE_PATTERNS: Array<[RegExp, string]> = [
  [/invalid login credentials/i, CODE_MESSAGES.invalid_credentials],
  [/email not confirmed/i, CODE_MESSAGES.email_not_confirmed],
  [/already registered|already exists/i, CODE_MESSAGES.user_already_exists],
  [/rate limit|too many requests|security purposes/i, CODE_MESSAGES.over_request_rate_limit],
  [/invalid.*(totp|mfa|code)|expired.*(totp|mfa|code)/i, CODE_MESSAGES.mfa_verification_failed],
];

const WEAK_FALLBACK = 'That password is too weak. Choose a longer, less common one.';
const CHARACTERS_FALLBACK =
  'Password needs a wider mix of characters, such as upper and lower case letters, numbers and symbols.';
const KNOWN_REASONS = ['length', 'characters', 'pwned'];

function lengthSentence(message: string): string {
  const min = /at least (\d+)/i.exec(message)?.[1];
  return min
    ? `Password is too short. Use at least ${min} characters.`
    : 'Password is too short. Use a longer one.';
}

function charactersSentence(message: string): string {
  const sets = /of each:([\s\S]*)$/i.exec(message)?.[1];
  if (!sets) return CHARACTERS_FALLBACK;
  const missing: string[] = [];
  if (sets.includes('abcdefghijklmnopqrstuvwxyz')) missing.push('a lowercase letter');
  if (sets.includes('ABCDEFGHIJKLMNOPQRSTUVWXYZ')) missing.push('an uppercase letter');
  if (sets.includes('0123456789')) missing.push('a number');
  const symbols = sets
    .replace('abcdefghijklmnopqrstuvwxyz', '')
    .replace('ABCDEFGHIJKLMNOPQRSTUVWXYZ', '')
    .replace('0123456789', '')
    .replace(/[\s,]/g, '');
  if (symbols) missing.push('a symbol');
  const last = missing.pop();
  if (!last) return CHARACTERS_FALLBACK;
  const list = missing.length ? [missing.join(', '), last].join(' and ') : last;
  return `Password needs ${list}.`;
}

function inferReasons(message: string): string[] {
  const reasons: string[] = [];
  if (/at least \d+ characters?/i.test(message)) reasons.push('length');
  if (/character of each/i.test(message)) reasons.push('characters');
  if (/known to be weak|pwned|breach/i.test(message)) reasons.push('pwned');
  return reasons;
}

/**
 * Names the rule a rejected password broke. Reasons come from Supabase's
 * `weak_password` error; policy numbers are read from its message so this copy
 * never drifts from the project's configured policy.
 */
export function weakPasswordMessage({ reasons, message }: WeakPasswordInput): string {
  const text = message ?? '';
  const known = (reasons ?? []).filter((reason) => KNOWN_REASONS.includes(reason));
  const found = known.length > 0 ? known : inferReasons(text);
  if (found.length === 0) return WEAK_FALLBACK;
  return found
    .map((reason) => {
      if (reason === 'length') return lengthSentence(text);
      if (reason === 'characters') return charactersSentence(text);
      return 'This password has appeared in a data breach. Choose a different one.';
    })
    .join(' ');
}

/**
 * Plain-language copy for a Supabase auth error. The raw message is never
 * returned: unknown errors get the caller's action-specific fallback.
 */
export function authErrorMessage(
  error: AuthErrorLike | null | undefined,
  fallback: string
): string {
  if (!error) return fallback;
  if (error.code === 'weak_password') return weakPasswordMessage(error);
  if (error.code && error.code in CODE_MESSAGES) return CODE_MESSAGES[error.code];
  const text = error.message ?? '';
  if (WEAK_PASSWORD_PATTERN.test(text)) return weakPasswordMessage(error);
  for (const [pattern, message] of MESSAGE_PATTERNS) {
    if (pattern.test(text)) return message;
  }
  return fallback;
}
