import { FaqRows } from '@merqo/ui';

export const PRICING_LINE =
  "Free during the pilot. If we start charging, you'll get at least 30 days' notice first.";

export const FAQ = [
  {
    q: 'Does stockkit track sales automatically?',
    a: "No. You log stock in and out by hand. The overview adds up each product's unit cost times what you hold.",
  },
  {
    q: 'What counts as a stock movement?',
    a: 'Restock (adding stock), waste (removing spoiled or lost stock), or adjustment (correcting a count). Every movement is kept as a permanent record.',
  },
  {
    q: 'What will it cost?',
    a: PRICING_LINE,
  },
] as const;

export function Faq() {
  return (
    <section id="faq" className="mx-auto max-w-5xl scroll-mt-20 px-5 py-14">
      <div className="grid gap-10 md:grid-cols-[5fr_7fr] md:gap-10">
        <h2 className="font-display text-3xl leading-[1.08] font-semibold text-balance sm:text-4xl">
          Questions vendors ask first.
        </h2>
        <FaqRows rows={FAQ} />
      </div>
    </section>
  );
}
