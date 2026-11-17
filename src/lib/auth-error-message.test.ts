import { describe, expect, it } from 'vitest';

import { authErrorMessage, weakPasswordMessage } from './auth-error-message';

const FALLBACK = 'Could not sign in. Try again.';

describe('authErrorMessage', () => {
  it.each([
    ['invalid_credentials', 'Email or password is wrong. Try again or reset your password.'],
    ['email_not_confirmed', 'Confirm your email first. Check your inbox for the link.'],
    ['user_already_exists', 'That email already has an account. Sign in instead.'],
    ['email_exists', 'That email already has an account. Sign in instead.'],
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

  it('routes weak_password by code through the specific message', () => {
    expect(
      authErrorMessage(
        {
          code: 'weak_password',
          message: 'Password should be at least 8 characters.',
          reasons: ['length'],
        },
        FALLBACK
      )
    ).toBe('Password is too short. Use at least 8 characters.');
  });

  it('routes a code-less weak password message by its text', () => {
    expect(
      authErrorMessage({ message: 'Password should be at least 6 characters' }, FALLBACK)
    ).toBe('Password is too short. Use at least 6 characters.');
    expect(
      authErrorMessage({ message: 'Password is known to be weak and easy to guess' }, FALLBACK)
    ).toBe('This password has appeared in a data breach. Choose a different one.');
  });
});

describe('weakPasswordMessage', () => {
  const CHARS =
    'Password should contain at least one character of each: abcdefghijklmnopqrstuvwxyz, ABCDEFGHIJKLMNOPQRSTUVWXYZ, 0123456789, !@#$%^&*()_+-=[]{};:<>?,./~.';

  it('names the minimum length when the message carries a number', () => {
    expect(
      weakPasswordMessage({
        reasons: ['length'],
        message: 'Password should be at least 10 characters.',
      })
    ).toBe('Password is too short. Use at least 10 characters.');
  });

  it('falls back to generic length copy without a number', () => {
    expect(weakPasswordMessage({ reasons: ['length'], message: 'too short' })).toBe(
      'Password is too short. Use a longer one.'
    );
  });

  it('lists every missing character class parsed from the message', () => {
    expect(weakPasswordMessage({ reasons: ['characters'], message: CHARS })).toBe(
      'Password needs a lowercase letter, an uppercase letter, a number and a symbol.'
    );
  });

  it('lists only the classes the message names', () => {
    expect(
      weakPasswordMessage({
        reasons: ['characters'],
        message: 'Password should contain at least one character of each: 0123456789, !@#.',
      })
    ).toBe('Password needs a number and a symbol.');
  });

  it('uses generic copy when the character sets cannot be parsed', () => {
    expect(weakPasswordMessage({ reasons: ['characters'], message: 'nope' })).toBe(
      'Password needs a wider mix of characters, such as upper and lower case letters, numbers and symbols.'
    );
  });

  it('explains a pwned password', () => {
    expect(weakPasswordMessage({ reasons: ['pwned'], message: '' })).toBe(
      'This password has appeared in a data breach. Choose a different one.'
    );
  });

  it('joins several reasons with a space', () => {
    expect(
      weakPasswordMessage({
        reasons: ['length', 'pwned'],
        message: 'Password should be at least 8 characters.',
      })
    ).toBe(
      'Password is too short. Use at least 8 characters. This password has appeared in a data breach. Choose a different one.'
    );
  });

  it('infers the reason from the message when none are given', () => {
    expect(weakPasswordMessage({ message: 'Password should be at least 8 characters.' })).toBe(
      'Password is too short. Use at least 8 characters.'
    );
  });

  it('uses the generic weak copy when nothing can be inferred', () => {
    expect(weakPasswordMessage({ reasons: [], message: 'weak' })).toBe(
      'That password is too weak. Choose a longer, less common one.'
    );
  });
});
