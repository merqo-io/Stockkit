import { Section as SharedSection } from '@merqo/ui';
import type { ReactNode } from 'react';

interface SectionProps {
  icon: ReactNode;
  eyebrow?: string;
  title: string;
  description: string;
  children: ReactNode;
}

// Per-field-group shell for the profile page: icon chip, eyebrow, title,
// description, then the fields. Header rendering is shared; the wrapper is a
// flat bordered card because settings are a working surface (lifted shadow
// cards stay on auth and landing pages).
export function Section({ icon, eyebrow, title, description, children }: SectionProps) {
  return (
    <SharedSection
      icon={icon}
      eyebrow={eyebrow}
      title={title}
      description={description}
      wrapper={(content) => (
        <section className="border-border bg-card rounded-2xl border px-6 py-6">{content}</section>
      )}
    >
      {children}
    </SharedSection>
  );
}
