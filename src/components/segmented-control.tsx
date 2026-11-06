'use client';

import { cn } from '@/lib/utils';

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

/**
 * A row of pills with exactly one active: a view switch, not a form input.
 * Each pill is a button carrying aria-pressed inside a labelled group. A
 * local stand-in for the pill group qkit uses until @merqo/ui exports one.
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
}) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="border-border inline-flex rounded-lg border p-0.5 text-sm"
    >
      {options.map((option) => {
        const on = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={on}
            className={cn(
              'rounded-md px-3 py-1.5 font-medium transition-colors [@media(pointer:coarse)]:min-h-11',
              on ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
