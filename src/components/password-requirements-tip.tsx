'use client';
import { InfoTooltip, PASSWORD_REQUIREMENTS_HINT } from '@merqo/ui';

export function PasswordRequirementsTip() {
  return (
    <InfoTooltip
      content={PASSWORD_REQUIREMENTS_HINT}
      ariaLabel="Password requirements"
      trigger="tap"
    />
  );
}
