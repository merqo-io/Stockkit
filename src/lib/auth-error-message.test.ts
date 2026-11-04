import { describe, expect, it } from 'vitest';

import { authErrorMessage } from './auth-error-message';

const FALLBACK = 'Could not sign in. Try again.';

describe('authErrorMessage', () => {
  it.each([
    ['invalid_credentials', 'Email or password is wrong. Try again or reset your password.'],
    ['email_not_confirmed', 'Confirm your email first. Check your inbox for the link.'],
    ['user_already_exists', 'That email already has an account. Sign in instead.'],
    ['email_exists', 'That email already has an account. Sign in instead.'],
    ['weak_password', 'Pick a longer password.'],
    ['over_request_rate_limit', 'Too many tries. Wait a minute and try again.'],
    ['over_email_send_rate_limit', 'Too many tries. Wait a minute and try again.'],
    ['mfa_verification_failed', "That code didn't work. Enter the latest code from your app."],
    ['mfa_challenge_expired', "That code didn't work. Enter the latest code from your app."],
  ])('maps code %s', (code, expected) => {
    expect(authErrorMessage({ code, message: 'raw text' }, FALLBACK)).toBe(expected);
  });

  it.each([
    ['Invalid login credentials', 'Email or password is wrong. Try again or reset your password.'],
    ['Email not confirmed', 'Confirm your email first. Check your inbox for the link.'],
    ['User already registered', 'That email already has an account. Sign in instead.'],
    ['Password should be at least 6 characters', 'Pick a longer password.'],
    ['Email rate limit exceeded', 'Too many tries. Wait a minute and try again.'],
    ['Invalid TOTP code entered', "That code didn't work. Enter the latest code from your app."],
  ])('maps message "%s" when no code is present', (message, expected) => {
    expect(authErrorMessage({ message }, FALLBACK)).toBe(expected);
  });

  it('falls back and never leaks the raw message for unknown errors', () => {
    const result = authErrorMessage(
      { code: 'unexpected', message: 'db exploded at host x' },
      FALLBACK
    );
    expect(result).toBe(FALLBACK);
  });

  it('falls back for a missing error or message', () => {
    expect(authErrorMessage(null, FALLBACK)).toBe(FALLBACK);
    expect(authErrorMessage({}, FALLBACK)).toBe(FALLBACK);
  });
});
