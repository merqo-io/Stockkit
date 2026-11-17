'use client';
import { PASSWORD_REQUIREMENTS_HINT } from '@/lib/auth-error-message';
import { InfoTooltip } from '@merqo/ui';

export function PasswordRequirementsTip() {
  return (
    <InfoTooltip
      content={PASSWORD_REQUIREMENTS_HINT}
      ariaLabel="Password requirements"
      trigger="tap"
    />
  );
}
