export const PRICING_LINE =
  "Free during the pilot. If we start charging, you'll get at least 30 days' notice first.";

const FAQ = [
  {
    q: 'Does stockkit track sales automatically?',
    a: 'No. You log stock in and out by hand, and stockkit works out the costing.',
  },
  {
    q: 'What counts as a stock movement?',
    a: 'Restock (adding stock), waste (removing spoiled/lost stock), or adjustment (correcting a count). Every movement is kept as a permanent record.',
  },
  {
    q: 'What will it cost?',
    a: PRICING_LINE,
  },
];

export function Faq() {
  return (
    <section id="faq" className="mx-auto max-w-3xl px-5 py-16">
      <h2 className="font-display mb-10 text-center text-3xl font-semibold">Questions</h2>
      <div className="space-y-3">
        {FAQ.map((item) => (
          <details
            key={item.q}
            className="group bg-card open:border-primary/50 overflow-hidden rounded-xl border"
          >
            <summary className="focus-visible:ring-primary/50 flex cursor-pointer list-none items-start justify-between gap-4 px-5 py-4 outline-none focus-visible:ring-2 focus-visible:ring-inset">
              <span className="text-base leading-snug font-semibold">{item.q}</span>
              <span
                aria-hidden
                className="text-muted-foreground mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border text-lg leading-none transition-transform group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <div className="text-foreground/80 px-5 pb-5 text-sm leading-relaxed">{item.a}</div>
          </details>
        ))}
      </div>
    </section>
  );
}
